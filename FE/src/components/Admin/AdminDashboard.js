import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';
import { Users, Truck, Calendar, DollarSign, TrendingUp, AlertTriangle, Activity, Clock, Star, Map, Settings, FileText, User } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [driverActivity, setDriverActivity] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [revenueAnalytics, setRevenueAnalytics] = useState([]);
  const [fleetData, setFleetData] = useState([]);
  const [tripAnalytics, setTripAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]);

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [startDate, endDate] = dateRange;

      const responses = await Promise.all([
        fetch('http://52.66.145.247:3001/api/v2/admin/dashboard', { headers }),
        fetch('http://52.66.145.247:3001/api/v2/admin/statistics', { headers }),
        fetch('http://52.66.145.247:3001/api/v2/admin/users', { headers }),
        fetch('http://52.66.145.247:3001/api/v2/admin/drivers', { headers }),
        fetch('http://52.66.145.247:3001/api/v2/admin/vehicles', { headers }),
        fetch(`http://52.66.145.247:3001/api/v2/admin/driver-activity?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, { headers }),
        fetch(`http://52.66.145.247:3001/api/v2/admin/booking-data?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, { headers }),
        fetch('http://52.66.145.247:3001/api/v2/admin/revenue-analytics', { 
          method: 'POST', 
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate: startDate.toISOString(), endDate: endDate.toISOString() })
        }),
        fetch('http://52.66.145.247:3001/api/v2/admin/fleet', { headers }),
        fetch(`http://52.66.145.247:3001/api/v2/admin/trip-analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, { headers })
      ]);

      const [
        dashboardRes,
        statisticsRes,
        usersRes,
        driversRes,
        vehiclesRes,
        driverActivityRes,
        bookingDataRes,
        revenueAnalyticsRes,
        fleetRes,
        tripAnalyticsRes
      ] = await Promise.all(responses.map(r => r.json()));

      setDashboardData(dashboardRes.data);
      setStatistics(statisticsRes.data);
      setUsers(usersRes.data);
      setDrivers(driversRes.data);
      setVehicles(vehiclesRes.data);
      setDriverActivity(driverActivityRes.data);
      setBookingData(bookingDataRes.data);
      setRevenueAnalytics(revenueAnalyticsRes.data);
      setFleetData(fleetRes.data);
      setTripAnalytics(tripAnalyticsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

  const revenueChartData = {
    labels: revenueAnalytics.map(data => new Date(data._id).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Revenue',
        data: revenueAnalytics.map(data => data.totalRevenue),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const bookingStatusData = {
    labels: ['Pending', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [
          bookingData.filter(b => b.status === 'pending').length,
          bookingData.filter(b => b.status === 'completed').length,
          bookingData.filter(b => b.status === 'cancelled').length
        ],
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384']
      }
    ]
  };

  const driverPerformanceData = {
    labels: driverActivity.map(d => d.name),
    datasets: [
      {
        label: 'Completed Bookings',
        data: driverActivity.map(d => d.completedBookings),
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      },
      {
        label: 'Cancelled Bookings',
        data: driverActivity.map(d => d.cancelledBookings),
        backgroundColor: 'rgba(255, 99, 132, 0.6)'
      }
    ]
  };

  const fleetStatusData = {
    labels: ['Available', 'In Use', 'Maintenance'],
    datasets: [{
      data: [
        fleetData.filter(v => v.status === 'available').length,
        fleetData.filter(v => v.status === 'in_use').length,
        fleetData.filter(v => v.status === 'maintenance').length
      ],
      backgroundColor: ['#4CAF50', '#2196F3', '#FFC107']
    }]
  };

  const avgTripTimeData = {
    labels: tripAnalytics?.avgTripTimeByHour.map(d => d.hour),
    datasets: [{
      label: 'Average Trip Time (minutes)',
      data: tripAnalytics?.avgTripTimeByHour.map(d => d.avgTime),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
      
      <div className="mb-6">
        <DatePicker
          selectsRange={true}
          startDate={dateRange[0]}
          endDate={dateRange[1]}
          onChange={(update) => {
            setDateRange(update);
          }}
          className="p-2 border rounded"
        />
      </div>

      <div className="flex mb-6 space-x-4">
        <TabButton title="Overview" icon={<Activity />} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton title="Users" icon={<Users />} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton title="Drivers" icon={<User />} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton title="Bookings" icon={<Calendar />} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton title="Fleet" icon={<Truck />} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton title="Analytics" icon={<TrendingUp />} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <DashboardCard icon={<Users />} title="Total Users" value={dashboardData.userCount} />
            <DashboardCard icon={<Truck />} title="Total Drivers" value={dashboardData.driverCount} />
            <DashboardCard icon={<Calendar />} title="Total Bookings" value={dashboardData.bookingCount} />
            <DashboardCard icon={<DollarSign />} title="Total Revenue" value={`$${statistics.totalRevenue.toFixed(2)}`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard title="Revenue Trend">
              <Line data={revenueChartData} options={{ responsive: true }} />
            </ChartCard>
            <ChartCard title="Booking Status Distribution">
              <Pie data={bookingStatusData} options={{ responsive: true }} />
            </ChartCard>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <DataTable title="User Management" data={users} fields={['_id', 'username', 'email', 'role', 'createdAt']} />
      )}

      {activeTab === 'drivers' && (
        <>
          <ChartCard title="Driver Performance">
            <Bar 
              data={driverPerformanceData} 
              options={{
                responsive: true,
                scales: {
                  x: { stacked: true },
                  y: { stacked: true }
                }
              }} 
            />
          </ChartCard>
          <DataTable title="Driver Management" data={drivers} fields={['_id', 'username', 'email', 'licenseNumber', 'experienceYears', 'isAvailable']} />
        </>
      )}

      {activeTab === 'bookings' && (
        <DataTable title="Booking Management" data={bookingData} fields={['_id', 'user.username', 'driver.username', 'status', 'price', 'createdAt']} />
      )}

      {activeTab === 'fleet' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard title="Fleet Status">
              <Doughnut data={fleetStatusData} options={{ responsive: true }} />
            </ChartCard>
            <ChartCard title="Average Trip Time by Hour">
              <Line data={avgTripTimeData} options={{ responsive: true }} />
            </ChartCard>
          </div>
          <DataTable title="Fleet Management" data={fleetData} fields={['_id', 'make', 'model', 'year', 'licensePlate', 'status', 'lastMaintenanceDate']} />
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <DashboardCard icon={<Clock />} title="Avg Trip Time" value={`${tripAnalytics?.overallAvgTripTime.toFixed(2)} mins`} />
            <DashboardCard icon={<TrendingUp />} title="Total Trips" value={tripAnalytics?.totalTrips} />
            <DashboardCard icon={<Star />} title="Avg Driver Rating" value={tripAnalytics?.avgDriverRating.toFixed(2)} />
            <DashboardCard icon={<AlertTriangle />} title="Incidents" value={tripAnalytics?.incidentCount} />
          </div>
          <DataTable title="Top Performing Drivers" data={tripAnalytics?.topDrivers || []} fields={['driverId', 'name', 'completedTrips', 'avgRating', 'totalRevenue']} />
        </>
      )}
    </div>
  );
};

const TabButton = ({ title, icon, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(title.toLowerCase())}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
      activeTab === title.toLowerCase() ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span>{title}</span>
  </button>
);

const DashboardCard = ({ icon, title, value }) => (
  <motion.div 
    className="bg-white p-6 rounded-lg shadow-lg"
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center justify-between">
      <div className="text-xl font-semibold text-gray-700">{title}</div>
      <div className="text-blue-500">{icon}</div>
    </div>
    <div className="text-3xl font-bold mt-2 text-gray-800">{value}</div>
  </motion.div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
    {children}
  </div>
);

const DataTable = ({ title, data, fields }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            {fields.map(field => (
              <th key={field} className="px-4 py-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {field.split('.').pop()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              {fields.map(field => (
                <td key={field} className="px-4 py-2 whitespace-nowrap">
                  {field.split('.').reduce((obj, key) => obj && obj[key], item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminDashboard;