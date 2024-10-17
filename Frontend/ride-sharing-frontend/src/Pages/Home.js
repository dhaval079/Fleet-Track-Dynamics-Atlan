import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const controls = useAnimation();
  const [currentSection, setCurrentSection] = useState(0);
  const sectionsRef = useRef([]);
  const textRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const sections = sectionsRef.current;
    sections.forEach((section, index) => {
      gsap.to(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setCurrentSection(index),
          onEnterBack: () => setCurrentSection(index),
        },
      });
    });

    // Text reveal animation
    const letters = textRef.current.innerText.split('');
    textRef.current.innerHTML = '';
    letters.forEach((letter) => {
      const span = document.createElement('span');
      span.innerText = letter;
      span.style.opacity = '0';
      textRef.current.appendChild(span);
    });

    gsap.to(textRef.current.children, {
      opacity: 1,
      stagger: 0.05,
      scrollTrigger: {
        trigger: textRef.current,
        start: 'top 80%',
      },
    });

    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  const services = [
    { title: 'Full Truckload', description: 'Efficient transportation for large shipments' },
    { title: 'Less Than Truckload', description: 'Cost-effective solutions for smaller freight' },
    { title: 'Intermodal', description: 'Combining truck, rail, and sea transport' },
    { title: 'Specialized Freight', description: 'Handling oversized or sensitive cargo' },
    { title: 'Expedited Shipping', description: 'Fast delivery for time-critical shipments' },
    { title: 'Last Mile Delivery', description: 'Ensuring your goods reach their final destination' },
    { title: 'Real-Time Tracking', description: 'Track your shipment live with accurate GPS' },
    { title: 'Flexible Scheduling', description: 'Schedule future or immediate bookings with ease' }
  ];

  const features = [
    { title: 'Real-Time Tracking', description: 'Monitor your shipments 24/7 with precision GPS tracking' },
    { title: 'AI-Powered Routing', description: 'Optimize routes with machine learning for faster deliveries' },
    { title: 'Sustainable Solutions', description: 'Eco-friendly options to reduce your carbon footprint' },
    { title: 'Customs Clearance', description: 'Seamless international shipping with expert customs handling' },
    { title: 'Surge Pricing', description: 'Dynamic pricing based on real-time demand and distance' },
    { title: 'Instant Price Estimates', description: 'Get upfront pricing before booking your shipment' }
  ];

  const testimonials = [
    { name: 'John Doe', feedback: 'Logitrax Express streamlined our logistics, saving us both time and money.' },
    { name: 'Jane Smith', feedback: 'The real-time tracking feature gave me peace of mind knowing my shipment was safe.' },
    { name: 'Acme Corp', feedback: 'Weve seen a significant improvement in delivery times thanks to the AI routing system.' }
  ];

  const clients = [
    { name: 'Amazon', logo: '/amazon.png' },
    { name: 'Walmart', logo: '/walmart.png' },
    { name: 'Target', logo: '/target.png' },
    { name: 'FedEx', logo: '/fedex.png' },
    { name: 'UPS', logo: '/fedex.png' },
    { name: 'DHL', logo: '/dhl.png' },
  ];

  const investors = [
    { name: 'Sequoia Capital', logo: '/amazon.png' },
    { name: 'Andreessen Horowitz', logo: '/walmart.png' },
    { name: 'Y Combinator', logo: '/fedex.png' },
    { name: 'Softbank', logo: '/dhl.png' },
  ];


  return (
    <div className="bg-white text-black font-sans overflow-hidden">
      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center" ref={(el) => (sectionsRef.current[0] = el)}>
        <div className="absolute inset-0 z-0">
          <img src='/truck1.jpeg' alt="Truck at sunset" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <motion.div
          className="z-10 text-center px-4 max-w-4xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-serif text-white" ref={textRef}>
            Logitrax Express
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light text-white">
            Revolutionizing logistics with cutting-edge technology and unparalleled service
          </p>
          <motion.button 
            className="bg-[#4A0E4E] text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-[#3A0C3E] transition duration-300 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </motion.div>
   <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </motion.div>      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 md:px-8 bg-white" ref={(el) => (sectionsRef.current[1] = el)}>
        <div className="container mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-16 text-center font-serif text-black"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Services
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="bg-gray-100 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="text-2xl font-semibold mb-3 text-black">{service.title}</h3>
                <p className="text-gray-700">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section id="features" className="py-20 relative" ref={(el) => (sectionsRef.current[2] = el)}>
        <div className="absolute inset-0 z-0">
          <img src='/truck3.jpeg' alt="Truck fleet" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#4A0E4E] opacity-80"></div>
        </div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-16 text-center font-serif text-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Why Choose Logitrax Express
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-filter backdrop-blur-lg"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="text-2xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-200">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

     
      {/* Clients Section */}
      <section id="clients" className="py-20 bg-gray-900" ref={(el) => (sectionsRef.current[3] = el)}>
        <div className="container mx-auto px-4 md:px-8">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-16 text-white text-center font-serif"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Notable Clients
          </motion.h2>
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            pagination={true}
            modules={[EffectCoverflow, Pagination, Autoplay]}
            className="mySwiper"
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
          >
            {clients.map((client, index) => (
              <SwiperSlide key={index}>
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <img src={client.logo} alt={client.name} className="w-32 h-32 mx-auto object-contain" />
                  <h3 className="text-xl font-semibold text-center mt-4 text-gray-800">{client.name}</h3>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Investors Section */}
      <section className="py-20 bg-gray-800" ref={(el) => (sectionsRef.current[4] = el)}>
        <div className="container mx-auto px-4 md:px-8">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-16 text-white text-center font-serif"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Investors
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {investors.map((investor, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <img src={investor.logo} alt={investor.name} className="w-24 h-24 mx-auto object-contain" />
                <h3 className="text-lg font-semibold text-center mt-4 text-gray-800">{investor.name}</h3>
              </motion.div>
            ))}
            </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-20 bg-white" ref={(el) => (sectionsRef.current[5] = el)}>
        <div className="container mx-auto px-4 md:px-8">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-16 text-center font-serif text-black"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            What Our Clients Say
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-xl text-gray-600 mb-2">"{testimonial.feedback}"</div>
                <div className="text-lg font-bold text-[#4A0E4E]">{testimonial.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 relative" ref={(el) => (sectionsRef.current[6] = el)}>
        <div className="absolute inset-0 z-0">
          <img src='/truck2.jpeg' alt="Truck driving at night" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black opacity-70"></div>
        </div>
        <div className="container mx-auto text-center px-4 md:px-8 relative z-10">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-8 font-serif text-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Ready to Transform Your Logistics?
          </motion.h2>
          <motion.p
            className="text-xl mb-8 max-w-2xl mx-auto text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Join thousands of businesses that trust Logitrax Express for their shipping needs. Experience the future of logistics today.
          </motion.p>
          <motion.button 
            className="bg-[#4A0E4E] text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-[#3A0C3E] transition duration-300 flex items-center mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Now
            <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 md:px-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 font-serif">Logitrax Express</h3>
            <p className="text-gray-400">
              Revolutionizing logistics with technology. Offering comprehensive services from full truckload to last mile
              delivery. Track your shipment and optimize your logistics with AI-powered solutions.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Services</h3>
            <ul>
              {services.slice(0, 4).map((service, index) => (
                <li key={index} className="text-gray-400 mb-2">
                  {service.title}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Features</h3>
            <ul>
              {features.slice(0, 4).map((feature, index) => (
                <li key={index} className="text-gray-400 mb-2">
                  {feature.title}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-400 mb-4">
              Have questions or need assistance? Reach out to our support team.
            </p>
            <p className="text-gray-400">
              Email: <a href="mailto:support@Logitrax Express.com" className="text-blue-400">support@Logitrax Express.com</a>
            </p>
            <p className="text-gray-400">
              Phone: <a href="tel:+18001234567" className="text-blue-400">+1 (800) 123-4567</a>
            </p>
          </div>
        </div>
        <div className="text-center text-gray-600 mt-8">
          &copy; 2024 Logitrax Express. All Rights Reserved.
        </div>
      </footer>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <button
          className="bg-[#4A0E4E] text-white rounded-full p-4 shadow-lg hover:bg-[#3A0C3E] transition duration-300"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </motion.div>

      {/* Parallax Background */}
      <motion.div
        className="fixed inset-0 z-[-1] opacity-10"
        style={{ y }}
      >
        <img src="/pattern.png" alt="Background pattern" className="w-full h-full object-cover" />
      </motion.div>
    </div>
  );
};

export default Home;