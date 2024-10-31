import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Clock, Star, Shield, MapPin, Users, ChevronRight, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const features = [
    { icon: <Truck className="w-8 h-8" />, title: 'Efficient Logistics', description: 'Optimized routes and real-time tracking for faster deliveries' },
    { icon: <Clock className="w-8 h-8" />, title: 'On-Time Performance', description: 'Punctual pickups and deliveries, every time' },
    { icon: <Star className="w-8 h-8" />, title: 'Quality Service', description: 'Highly rated drivers and excellent customer support' },
    { icon: <Shield className="w-8 h-8" />, title: 'Secure Shipments', description: 'Advanced security measures to protect your cargo' },
    // { icon: <Dollar className="w-8 h-8" />, title: 'Competitive Pricing', description: 'Transparent and fair pricing for all services' },
    { icon: <MapPin className="w-8 h-8" />, title: 'Wide Coverage', description: 'Extensive network covering major cities and routes' },
    { icon: <Users className="w-8 h-8" />, title: 'Community Driven', description: 'A platform that values both drivers and passengers' },
    { icon: <Star className="w-8 h-8" />, title: 'Rewards Program', description: 'Earn points and get discounts on future rides' },
  ];

  const reviews = [
    { name: 'John D.', role: 'Regular Commuter', content: 'This ride-sharing app has transformed my daily commute. It\'s reliable, affordable, and the drivers are always professional.', rating: 5 },
    { name: 'Sarah M.', role: 'Business Traveler', content: 'As someone who travels for work frequently, this app has been a game-changer. The wide coverage and consistent service quality are impressive.', rating: 4 },
    { name: 'Alex T.', role: 'Student', content: 'The student discounts and shared ride options make this my go-to choice for getting around campus and the city.', rating: 5 },
    { name: 'Emily R.', role: 'Part-time Driver', content: 'I love the flexibility this platform offers. It\'s a great way to earn extra income on my own schedule.', rating: 5 },
  ];

  const stats = [
    { value: '5M+', label: 'Active Users' },
    { value: '100+', label: 'Cities Covered' },
    { value: '1M+', label: 'Rides Completed' },
    { value: '4.8', label: 'Average Rating' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-blue-600">
        <div className="absolute inset-0 z-0">
          <img src='/truck1.jpeg' alt="Ride sharing concept" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="z-10 text-center px-4 max-w-4xl">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Ride Booking and Sharing Reinvented
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-8 text-blue-100"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Experience seamless transportation with our cutting-edge ride-sharing platform
          </motion.p>
          <motion.button 
            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-100 transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
          >
            Get Started
          </motion.button>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronRight className="w-10 h-10 text-white transform rotate-90" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-xl text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-8 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-blue-600">Our Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-blue-600">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Request a Ride</h3>
              <p className="text-gray-600">Enter your destination and choose your ride type</p>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Matched</h3>
              <p className="text-gray-600">We'll connect you with a nearby driver</p>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy Your Ride</h3>
              <p className="text-gray-600">Track your ride in real-time and pay seamlessly</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-4 md:px-8 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-blue-600">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <span className="text-xl font-bold text-blue-600">{review.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{review.name}</h3>
                    <p className="text-gray-600">{review.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{review.content}</p>
                <div className="flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-white">Ready to Transform Your Ride Experience with LogistiQ?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied users who have made the switch to our innovative ride-sharing platform.
          </p>
          <motion.button 
            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-100 transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
          >
            Sign Up Now
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Ride Sharing</h3>
              <p className="text-gray-400">Transforming the way you travel with innovative ride-sharing solutions.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Safety</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2">
                <li className="flex items-center"><Phone className="w-5 h-5 mr-2" /> +1 (555) 123-4567</li>
                <li className="flex items-center"><Mail className="w-5 h-5 mr-2" /> support@ridesharing.com</li>
                <li className="flex items-center"><MapPin className="w-5 h-5 mr-2" /> 123 Main St, City, Country</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">© 2024 Ride Sharing. All rights reserved.</p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                  {/* <Facebook className="w-6 h-6" /> */}
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                  {/* <Twitter className="w-6 h-6" /> */}
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                  {/* <LinkedIn className="w-6 h-6" /> */}
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                  {/* <Instagram className="w-6 h-6" /> */}
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Newsletter Signup */}
      <section className="bg-blue-700 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold text-white">Stay Updated</h3>
              <p className="text-blue-200">Subscribe to our newsletter for the latest updates and offers</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full md:w-64 px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600 transition duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <motion.button
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-300"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronRight className="w-6 h-6 transform rotate-[-90deg]" />
      </motion.button>
    </div>
  );
};

export default Home;