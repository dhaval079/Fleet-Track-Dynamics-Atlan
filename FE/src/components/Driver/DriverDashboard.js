import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const BACKEND_URL = 'https://dhavalrupapara.me';

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
    <div className="container mx-auto p-8 bg-gray-100 min-h-screen">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 text-center text-gray-800"
      >
        Driver Dashboard
      </motion.h1>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8 flex justify-center"
      >
        <button 
          onClick={toggleAvailability}
          className={`px-6 py-3 rounded-full text-lg font-semibold transition duration-300 ${
            isAvailable 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {isAvailable ? 'Available for Jobs' : 'Not Available'}
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Job Status Distribution</h2>
          <Pie data={pieChartData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Performance Metrics</h2>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold text-green-600">${analytics.totalEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Completed Jobs</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.completedJobs}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Average Rating</h3>
          <p className="text-3xl font-bold text-yellow-600">{analytics.averageRating.toFixed(1)}</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-center space-x-4 mb-4">
          {['active', 'pending', 'incoming'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full transition duration-300 ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Jobs
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {jobs[activeTab].length === 0 ? (
              <p className="text-center text-gray-600">No {activeTab} jobs at the moment.</p>
            ) : (
              jobs[activeTab].map(job => (
                <JobCard 
                  key={job._id} 
                  job={job} 
                  isActive={activeTab === 'active' || activeTab === 'incoming'} 
                  isPending={activeTab === 'pending'}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center space-x-4"
      >
        <Link to="/vehicles" className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition duration-300">
          Manage Vehicles
        </Link>
        <Link to="/profile" className="bg-gray-500 text-white px-6 py-3 rounded-full hover:bg-gray-600 transition duration-300">
          View Profile
        </Link>
      </motion.div>
    </div>
  );
};

export default DriverDashboard;
