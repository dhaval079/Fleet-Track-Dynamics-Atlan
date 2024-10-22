import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const BACKEND_URL = 'http://localhost:3001';
const driverId = localStorage.getItem('userId');
console.log("Driver id is : ", driverId)


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

  useEffect(() => {
    if (user) {
      fetchDriverInfo();
      fetchJobs();
      const interval = setInterval(fetchJobs, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchDriverInfo = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/drivers/${driverId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch driver info');
      const data = await response.json();
      setIsAvailable(data.driver.isAvailable);
    } catch (error) {
      console.error('Error fetching driver info:', error);
      setError('Failed to load driver information');
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/drivers/current-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: user.email })
      });
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      
      const active = data.bookings.filter(job => ['en_route', 'goods_collected'].includes(job.status));
      const pending = data.bookings.filter(job => job.status === 'pending');
      const incoming = data.bookings.filter(job => job.status === 'assigned');
      
      setJobs({ active, pending, incoming });
      calculateAnalytics(data.bookings);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };



  const calculateAnalytics = (bookings) => {
    const completedJobs = bookings.filter(job => job.status === 'completed');
    const totalEarnings = completedJobs.reduce((sum, job) => sum + job.price, 0);
    
    const jobStatusDistribution = bookings.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
    }, {});

    setAnalytics({
        totalEarnings,
        completedJobs: completedJobs.length,
        averageRating: 4.5, // Placeholder, as we don't have this data
        jobStatusDistribution
    });
};

const barChartData = {
  labels: ['Total Earnings', 'Completed Jobs'],
  datasets: [
      {
          label: 'Total Earnings',
          data: [analytics.totalEarnings, 0], // 0 for completed jobs on this dataset
          backgroundColor: '#007A5E', // Emerald Green
          yAxisID: 'earnings', // Use the earnings y-axis
      },
      {
          label: 'Completed Jobs',
          data: [0, analytics.completedJobs], // 0 for earnings on this dataset
          backgroundColor: '#D4AF37', // Royal Gold
          yAxisID: 'jobs', // Use the jobs y-axis
      },
  ],
};

// Bar Chart Options with Dual Axes
const barChartOptions = {
  scales: {
      earnings: {
          type: 'linear',
          position: 'left',
          ticks: {
              callback: (value) => `$${value}`, // Format for earnings
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
              drawOnChartArea: false, // Don't draw grid lines for the right axis
          },
      },
  },
};

 
const toggleAvailability = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v2/drivers/${driverId}/availability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ isAvailable: !isAvailable })
    });
    if (!response.ok) throw new Error('Failed to update availability');
    const data = await response.json();
    setIsAvailable(data.driver.isAvailable);
  } catch (error) {
    console.error('Error updating availability:', error);
    alert('Failed to update availability');
  }
};

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/drivers/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update job status');
      fetchJobs(); // Refresh the jobs list
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status');
    }
  };

  const acceptJob = async (jobId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/drivers/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'assigned' })
      });
      if (!response.ok) throw new Error('Failed to accept job');
      fetchJobs(); // Refresh the jobs list
    } catch (error) {
      console.error('Error accepting job:', error);
      alert('Failed to accept job');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;

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
        backgroundColor: Object.keys(analytics.jobStatusDistribution).map(status => statusColors[status] || '#000000'),
      },
    ],
  };

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
