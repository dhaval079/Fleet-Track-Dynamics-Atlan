import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const BACKEND_URL = 'https://fleet-track-dynamics-atlan.onrender.com';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState({ active: [], pending: [], incoming: [] });
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [analytics, setAnalytics] = useState({
    totalEarnings: 0,
    completedJobs: 0,
    averageRating: 0,
    jobStatusDistribution: {}
  });

  const fetchDriverInfo = useCallback(async () => {
    const driverId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/drivers/${driverId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch driver info');
      }

      const data = await response.json();
      setIsAvailable(data.driver.isAvailable);
      return true;
    } catch (error) {
      console.error('Error fetching driver info:', error);
      throw new Error('Failed to load driver information');
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    const token = localStorage.getItem('token');
    const email = user?.email;

    if (!email || !token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/drivers/current-jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired');
        }
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      
      const active = data.bookings.filter(job => ['en_route', 'goods_collected'].includes(job.status));
      const pending = data.bookings.filter(job => job.status === 'pending');
      const incoming = data.bookings.filter(job => job.status === 'assigned');
      
      setJobs({ active, pending, incoming });
      calculateAnalytics(data.bookings);
      return true;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }, [user?.email]);

  const calculateAnalytics = useCallback((bookings) => {
    const completedJobs = bookings.filter(job => job.status === 'completed');
    const totalEarnings = completedJobs.reduce((sum, job) => sum + job.price, 0);
    
    const jobStatusDistribution = bookings.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    setAnalytics({
      totalEarnings,
      completedJobs: completedJobs.length,
      averageRating: 4.5,
      jobStatusDistribution
    });
  }, []);

  const initializeDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await fetchDriverInfo();
      await fetchJobs();
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      setError(error.message || 'Failed to initialize dashboard');
      return false;
    } finally {
      setLoading(false);
    }

    return true;
  }, [fetchDriverInfo, fetchJobs]);

  useEffect(() => {
    let intervalId;

    const setupDashboard = async () => {
      if (user?.email && localStorage.getItem('token')) {
        const success = await initializeDashboard();
        
        if (success) {
          // Set up polling only if initialization was successful
          intervalId = setInterval(async () => {
            try {
              await fetchJobs();
            } catch (error) {
              console.error('Polling error:', error);
              // Optionally handle polling errors
            }
          }, 30000);
        }
      }
    };

    setupDashboard();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user?.email, initializeDashboard, fetchJobs]);

  const toggleAvailability = async () => {
    const driverId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/drivers/${driverId}/availability`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isAvailable: !isAvailable })
      });

      if (!response.ok) {
        throw new Error('Failed to update availability');
      }

      const data = await response.json();
      setIsAvailable(data.driver.isAvailable);
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability. Please try again.');
    }
  };

  const updateJobStatus = async (jobId, newStatus) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/drivers/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }

      await fetchJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status. Please try again.');
    }
  };

  const acceptJob = async (jobId) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/drivers/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'assigned' })
      });

      if (!response.ok) {
        throw new Error('Failed to accept job');
      }

      await fetchJobs();
    } catch (error) {
      console.error('Error accepting job:', error);
      alert('Failed to accept job. Please try again.');
    }
  };

  // Early return for authentication check
  if (!user?.email || !localStorage.getItem('token')) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">Please log in to access the dashboard</div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button 
          onClick={initializeDashboard}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Chart data and options
  const barChartData = {
    labels: ['Total Earnings', 'Completed Jobs'],
    datasets: [
      {
        label: 'Total Earnings',
        data: [analytics.totalEarnings, 0],
        backgroundColor: '#007A5E',
        yAxisID: 'earnings',
      },
      {
        label: 'Completed Jobs',
        data: [0, analytics.completedJobs],
        backgroundColor: '#D4AF37',
        yAxisID: 'jobs',
      },
    ],
  };

  const barChartOptions = {
    scales: {
      earnings: {
        type: 'linear',
        position: 'left',
        ticks: {
          callback: (value) => `$${value}`,
        },
        title: {
          display: true,
          text: 'Total Earnings ($)',
        },
      },
      jobs: {
        type: 'linear',
        position: 'right',
        ticks: {
          beginAtZero: true,
        },
        title: {
          display: true,
          text: 'Completed Jobs',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const statusColors = {
    pending: '#FFA500',
    assigned: '#4169E1',
    en_route: '#32CD32',
    goods_collected: '#9370DB',
    completed: '#228B22'
  };

  const pieChartData = {
    labels: Object.keys(analytics.jobStatusDistribution),
    datasets: [
      {
        data: Object.values(analytics.jobStatusDistribution),
        backgroundColor: Object.keys(analytics.jobStatusDistribution)
          .map(status => statusColors[status] || '#000000'),
      },
    ],
  };

  // Job card component
  const JobCard = ({ job, isActive, isPending }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-lg rounded-lg p-6 mb-4"
    >
      <h3 className="text-xl font-semibold mb-2">Booking ID: {job._id}</h3>
      <p className="mb-1"><strong>Pickup:</strong> {job.pickup.address}</p>
      <p className="mb-1"><strong>Dropoff:</strong> {job.dropoff.address}</p>
      <p className="mb-2"><strong>Status:</strong> {job.status}</p>
      <p className="mb-2"><strong>Price:</strong> ${job.price.toFixed(2)}</p>
     
      {isActive && (
        <div className="flex space-x-2 mt-4">
          <button 
            onClick={() => updateJobStatus(job._id, 'en_route')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            En Route
          </button>
          <button 
            onClick={() => updateJobStatus(job._id, 'goods_collected')}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300"
          >
            Goods Collected
          </button>
          <button 
            onClick={() => updateJobStatus(job._id, 'completed')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
          >
            Complete
          </button>
        </div>
      )}
      {isPending && (
        <button 
          onClick={() => acceptJob(job._id)}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition duration-300 mt-4"
        >
          Accept Request
        </button>
      )}
    </motion.div>
  );

  // Main dashboard render
return (
  <div className="min-h-screen bg-[#f8fafc]">
    {/* Stats Cards */}
    <div className="grid grid-cols-3 gap-6 p-8">
      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Earnings</p>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-2xl font-bold text-gray-900">${analytics.totalEarnings.toFixed(2)}</h2>
              <span className="text-sm text-green-500">↑ 12.5%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Completed Jobs</p>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-2xl font-bold text-gray-900">{analytics.completedJobs}</h2>
              <span className="text-sm text-blue-500">This month</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Rating</p>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-2xl font-bold text-gray-900">{analytics.averageRating.toFixed(1)}</h2>
              <span className="text-sm text-gray-500">(342 reviews)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Charts Section */}
    <div className="grid grid-cols-3 gap-6 px-8 mb-8">
      <div className="col-span-2 bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Analytics</h2>
        <div className="h-[300px]">
          <Bar data={barChartData} options={{
            ...barChartOptions,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            }
          }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Job Distribution</h2>
        <Pie data={pieChartData} options={{
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }} />
      </div>
    </div>

    {/* Job Management Section */}
    <div className="px-8 mb-8">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Jobs</h2>
          <div className="inline-flex p-1 bg-gray-100 rounded-xl">
            {['active', 'pending', 'incoming'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Jobs
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {jobs[activeTab].length === 0 ? (
              <p className="text-center text-gray-500 py-8">No {activeTab} jobs at the moment.</p>
            ) : (
             // Inside the JobCard mapping section, replace the existing code with:
jobs[activeTab].map(job => (
  <motion.div
    key={job._id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
  >
    <div className="grid grid-cols-5 gap-4 items-center">
      <div>
        <p className="text-sm text-gray-500">Booking ID</p>
        <p className="font-mono text-sm text-gray-900">{job._id.slice(0, 10)}...</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">From</p>
        <p className="text-sm text-gray-900">{job.pickup.address}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">To</p>
        <p className="text-sm text-gray-900">{job.dropoff.address}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Price</p>
        <p className="text-sm font-medium text-gray-900">${job.price.toFixed(2)}</p>
      </div>
      <div className="flex justify-end space-x-2">
        {activeTab === 'active' && (
          <>
            <button 
              onClick={() => updateJobStatus(job._id, 'en_route')}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              En Route
            </button>
            <button 
              onClick={() => updateJobStatus(job._id, 'completed')}
              className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors duration-200"
            >
              Complete
            </button>
          </>
        )}
        {activeTab === 'pending' && (
          <button 
            onClick={() => acceptJob(job._id)}
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
          >
            Accept Request
          </button>
        )}
      </div>
    </div>
  </motion.div>
))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>

    {/* Availability Toggle */}
    <div className="fixed bottom-8 right-8">
      <button 
        onClick={toggleAvailability}
        className={`px-6 py-3 rounded-xl text-white font-medium shadow-lg transition-all duration-300 ${
          isAvailable 
            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
        }`}
      >
        {isAvailable ? 'Available for Jobs' : 'Not Available'}
      </button>
    </div>
  </div>
);
};

export default DriverDashboard;
