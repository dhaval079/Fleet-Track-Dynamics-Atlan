"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue } from "framer-motion"
import {
  Truck,
  Star,
  Shield,
  MapPin,
  Users,
  ArrowRight,
  Menu,
  X,
  ArrowDown,
  Clock,
  Mail,
  Phone,
  Instagram,
  Twitter,
  Facebook,
  ChevronRight,
  Play,
  Plus,
  Minus,
  ArrowUp,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const Home = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [cursorHovered, setCursorHovered] = useState(false)
  const [cursorText, setCursorText] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [activeFaq, setActiveFaq] = useState(null)

  // Refs for sections to track for menu highlighting
  const homeRef = useRef(null)
  const featuresRef = useRef(null)
  const howItWorksRef = useRef(null)
  const testimonialsRef = useRef(null)
  const contactRef = useRef(null)
  const cursorRef = useRef(null)
  const videoRef = useRef(null)

  // Custom cursor effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Smooth cursor with spring physics
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 300 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    cursorX.set(cursorPosition.x)
    cursorY.set(cursorPosition.y)
  }, [cursorPosition, cursorX, cursorY])

  // Track section visibility for menu highlighting
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY

      // Update header style based on scroll position
      if (scrollPosition > 50 && !scrolled) {
        setScrolled(true)
      } else if (scrollPosition <= 50 && scrolled) {
        setScrolled(false)
      }

      const sections = [
        { id: "home", ref: homeRef },
        { id: "features", ref: featuresRef },
        { id: "howItWorks", ref: howItWorksRef },
        { id: "testimonials", ref: testimonialsRef },
        { id: "contact", ref: contactRef },
      ]

      for (const section of sections) {
        if (section.ref.current) {
          const { offsetTop, offsetHeight } = section.ref.current
          if (scrollPosition >= offsetTop - 100 && scrollPosition < offsetTop + offsetHeight - 100) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrolled])

  // Video player controls
  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  // Features section
  const features = [
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Efficient Logistics",
      description: "Optimized routes and real-time tracking for faster deliveries",
      color: "from-blue-600 to-purple-600",
      image: "https://images.unsplash.com/photo-1556122071-e404eaedb77f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "On-Time Performance",
      description: "Punctual pickups and deliveries, every time",
      color: "from-purple-600 to-indigo-600",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Quality Service",
      description: "Highly rated drivers and excellent customer support",
      color: "from-indigo-600 to-blue-600",
      image:
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Shipments",
      description: "Advanced security measures to protect your cargo",
      color: "from-blue-600 to-purple-600",
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
  ]

  // Enhanced testimonials
  const testimonials = [
    {
      name: "John D.",
      role: "Regular Commuter",
      content:
        "This ride-sharing app has transformed my daily commute. It's reliable, affordable, and the drivers are always professional.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Sarah M.",
      role: "Business Traveler",
      content:
        "As someone who travels for work frequently, this app has been a game-changer. The wide coverage and consistent service quality are impressive.",
      rating: 4,
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Alex T.",
      role: "Student",
      content:
        "The student discounts and shared ride options make this my go-to choice for getting around campus and the city. I've saved so much money!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/67.jpg",
    },
  ]

  const stats = [
    { value: "5M+", label: "Active Users", icon: <Users className="w-6 h-6" /> },
    { value: "100+", label: "Cities Covered", icon: <MapPin className="w-6 h-6" /> },
    { value: "1M+", label: "Rides Completed", icon: <Truck className="w-6 h-6" /> },
    { value: "4.8", label: "Average Rating", icon: <Star className="w-6 h-6" /> },
  ]

  const faqs = [
    {
      question: "How do I book a ride?",
      answer:
        "Booking a ride is simple. Just open the app, enter your destination, choose your ride type, and confirm your pickup location. You'll be matched with a driver in minutes.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept all major credit cards, debit cards, PayPal, and mobile payment solutions like Apple Pay and Google Pay. You can also add multiple payment methods to your account.",
    },
    {
      question: "How are ride prices calculated?",
      answer:
        "Ride prices are calculated based on distance, time, current demand, and the type of vehicle you select. You'll always see the price before confirming your ride.",
    },
    {
      question: "Can I schedule rides in advance?",
      answer:
        "Yes, you can schedule rides up to 7 days in advance. Just select the 'Schedule' option when booking and choose your desired pickup date and time.",
    },
  ]

  // Animation for scroll indicator
  const { scrollYProgress } = useScroll()
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])
  const headerBgOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1])

  // Parallax effect for hero section
  const y = useTransform(scrollYProgress, [0, 1], [0, 300])

  // Magnetic button effect
  const handleMagneticMouseMove = (e, strength = 40) => {
    const { clientX, clientY, currentTarget } = e
    const { left, top, width, height } = currentTarget.getBoundingClientRect()

    const x = clientX - (left + width / 2)
    const y = clientY - (top + height / 2)

    currentTarget.style.transform = `translate(${x / strength}px, ${y / strength}px)`
  }

  const handleMagneticMouseLeave = (e) => {
    e.currentTarget.style.transform = "translate(0px, 0px)"
  }

  return (
    <div className="bg-[#050505] w-full min-h-screen text-white px-6">
      {/* Custom cursor */}
      <motion.div
        ref={cursorRef}
        className={`fixed w-6 h-6 rounded-full pointer-events-none z-50 flex items-center justify-center ${
          cursorHovered ? "w-24 h-24 bg-blue-500/20 backdrop-blur-sm border border-blue-500/50" : "bg-blue-500"
        }`}
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          transition: "width 0.3s, height 0.3s",
        }}
      >
        {cursorHovered && cursorText && (
          <span className="text-xs font-medium text-white whitespace-nowrap">{cursorText}</span>
        )}
      </motion.div>
  
      {/* Fixed Navigation */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled ? "py-3 backdrop-blur-xl bg-black/50 border-b border-white/5" : "py-6 bg-transparent"
        }`}
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <a
                href="#"
                className="text-white font-bold text-xl flex items-center"
                onMouseEnter={() => {
                  setCursorHovered(true)
                  setCursorText("Home")
                }}
                onMouseLeave={() => {
                  setCursorHovered(false)
                  setCursorText("")
                }}
              >
                <Truck className="w-6 h-6 mr-2 text-blue-500" />
                <span className="font-sans">LogistiQ</span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-10">
              {[
                { name: "Home", href: "#home", id: "home" },
                { name: "Features", href: "#features", id: "features" },
                { name: "How It Works", href: "#howItWorks", id: "howItWorks" },
                { name: "Testimonials", href: "#testimonials", id: "testimonials" },
                { name: "Contact", href: "#contact", id: "contact" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors relative group ${
                    activeSection === item.id ? "text-blue-400" : "text-white/70 hover:text-white"
                  }`}
                  onMouseEnter={() => {
                    setCursorHovered(true)
                    setCursorText(item.name)
                  }}
                  onMouseLeave={() => {
                    setCursorHovered(false)
                    setCursorText("")
                  }}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-1 left-0 w-full h-px bg-blue-500 transform origin-left transition-transform duration-300 ${
                      activeSection === item.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                onMouseEnter={(e) => {
                  setCursorHovered(true)
                  setCursorText("Login")
                  handleMagneticMouseMove(e)
                }}
                onMouseMove={handleMagneticMouseMove}
                onMouseLeave={(e) => {
                  setCursorHovered(false)
                  setCursorText("")
                  handleMagneticMouseLeave(e)
                }}
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
              <motion.button
                onMouseEnter={(e) => {
                  setCursorHovered(true)
                  setCursorText("Sign Up")
                  handleMagneticMouseMove(e)
                }}
                onMouseMove={handleMagneticMouseMove}
                onMouseLeave={(e) => {
                  setCursorHovered(false)
                  setCursorText("")
                  handleMagneticMouseLeave(e)
                }}
                onClick={() => navigate("/signup")}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white"
                onMouseEnter={() => setCursorHovered(true)}
                onMouseLeave={() => setCursorHovered(false)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-black/95 backdrop-blur-xl py-4 px-4 absolute w-full border-b border-white/5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <nav className="flex flex-col space-y-4">
                {[
                  { name: "Home", href: "#home", id: "home" },
                  { name: "Features", href: "#features", id: "features" },
                  { name: "How It Works", href: "#howItWorks", id: "howItWorks" },
                  { name: "Testimonials", href: "#testimonials", id: "testimonials" },
                  { name: "Contact", href: "#contact", id: "contact" },
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-colors ${
                      activeSection === item.id ? "text-blue-400" : "text-white/70"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="pt-4 flex flex-col space-y-2">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full px-4 py-2 text-sm font-medium text-white/70 border border-white/10 rounded-full hover:bg-white/5 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:shadow-lg hover:shadow-blue-500/20 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="home" ref={homeRef} className="min-h-screen flex items-center relative overflow-hidden pt-20">
        {/* Abstract fluid background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#050505]" />
          <div className="absolute inset-0 opacity-70">
            <motion.div
              className="absolute top-1/4 left-1/4 w-full h-[800px] rounded-full bg-blue-600/30 blur-[120px]"
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 3,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-600/30 blur-[100px]"
              animate={{
                x: [0, -40, 0],
                y: [0, 40, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 3,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </div>
        </div>

        {/* Hero content */}
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <motion.div
                className="absolute -top-10 -left-10 text-xs font-medium text-blue-400 flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-10 h-px bg-blue-400 mr-2"></div>
                NEXT GENERATION
              </motion.div>

              <h1 className="text-5xl sm:text-7xl font-bold leading-tight mb-6 tracking-tight">
                <span className="block">Redefining</span>
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Mobility
                </span>
                <span className="block">Experience</span>
              </h1>

              <p className="text-xl text-white/70 leading-relaxed mb-8 max-w-lg">
                Experience seamless transportation with our cutting-edge ride-sharing platform. Save time, money, and
                the environment with LogistiQ.
              </p>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full shadow-lg hover:shadow-blue-500/25 transition-all duration-300 relative overflow-hidden group"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/signup")}
                  onMouseEnter={() => {
                    setCursorHovered(true)
                    setCursorText("Get Started")
                  }}
                  onMouseLeave={() => {
                    setCursorHovered(false)
                    setCursorText("")
                  }}
                >
                  <span className="relative z-10">Get Started Free</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </motion.button>

                <motion.button
                  className="px-8 py-4 bg-white/5 text-white font-medium rounded-full border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-center group"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => {
                    setCursorHovered(true)
                    setCursorText("Watch Demo")
                  }}
                  onMouseLeave={() => {
                    setCursorHovered(false)
                    setCursorText("")
                  }}
                  onClick={handleVideoPlay}
                >
                  <Play className="w-4 h-4 mr-2 fill-white" />
                  <span>Watch Demo</span>
                </motion.button>
              </div>

              <div className="flex items-center space-x-6 text-white/50 text-sm">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-blue-400 mr-2" />
                  <span>Rated 4.8/5 by 10k+ users</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-blue-400 mr-2" />
                  <span>Secure & encrypted</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              className="relative"
            >
              <div className="relative">
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-xl"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 4,
                    ease: "easeInOut",
                  }}
                />

                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-sm">
                  <video
                    ref={videoRef}
                    className="w-full h-auto rounded-xl"
                    poster="https://images.unsplash.com/photo-1556122071-e404eaedb77f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                    onClick={handleVideoPlay}
                  >
                    <source
                      src="https://assets.mixkit.co/videos/preview/mixkit-going-down-a-curved-highway-through-a-mountain-range-41576-large.mp4"
                      type="video/mp4"
                    />
                  </video>

                  {!isVideoPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-20 h-20 rounded-full bg-blue-500/20 backdrop-blur-sm flex items-center justify-center cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleVideoPlay}
                      >
                        <Play className="w-8 h-8 fill-white text-white" />
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>

              <motion.div
                className="absolute -bottom-6 -left-6 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg p-4 max-w-xs"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-white/80">
                    <span className="font-semibold text-white">5M+</span> active users trust our platform for their
                    daily commute
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="absolute -top-6 -right-6 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg p-4 max-w-xs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-white/80">
                    <span className="font-semibold text-white">100+</span> cities worldwide with expanding coverage
                    every month
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            style={{ opacity: scrollOpacity }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}>
              <ArrowDown className="w-10 h-10 text-blue-500" />
            </motion.div>
          </motion.div>
        </div>

        {/* Clients/Partners logos */}
        <div className="absolute bottom-0 left-0 right-0 backdrop-blur-md bg-black/30 border-t border-white/5 py-6">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-4">
              <p className="text-xs text-white/50 uppercase tracking-wider font-medium">Trusted by leading companies</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  className="h-8 opacity-50 hover:opacity-100 transition-all duration-300 filter grayscale hover:grayscale-0"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <img
                    src={`https://randompicturegenerator.com/img/logo-generator/g${i + 30}${i * 3}.png`}
                    alt={`Partner ${i}`}
                    className="h-full w-auto"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#050505]" />
          <div className="absolute inset-0 opacity-30">
            <motion.div
              className="absolute top-1/3 right-1/3 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[100px]"
              animate={{
                x: [0, 30, 0],
                y: [0, -30, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 15,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[80px]"
              animate={{
                x: [0, -40, 0],
                y: [0, 40, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 20,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>

        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
              <span className="text-xs font-medium">FEATURES</span>
            </motion.div>

            <motion.h2
              className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Designed for the Modern Traveler
            </motion.h2>

            <motion.p
              className="text-xl text-white/70 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Our platform is designed to provide a seamless experience with features that prioritize efficiency,
              safety, and customer satisfaction.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative h-[600px] overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      activeFeature === index ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    initial={false}
                  >
                    <img
                      src={feature.image || "/placeholder.svg"}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} w-14 h-14 flex items-center justify-center mb-4`}
                      >
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-white/70">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col justify-center"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                      activeFeature === index
                        ? "bg-white/5 border border-white/10"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                    onClick={() => setActiveFeature(index)}
                    whileHover={{ x: 5 }}
                    onMouseEnter={() => setCursorHovered(true)}
                    onMouseLeave={() => setCursorHovered(false)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${feature.color} mr-4`}>{feature.icon}</div>
                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 transition-transform duration-300 ${
                          activeFeature === index ? "rotate-90 text-blue-400" : "text-white/50"
                        }`}
                      />
                    </div>
                    {activeFeature === index && (
                      <motion.p
                        className="mt-4 text-white/70 pl-14"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {feature.description}
                      </motion.p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="howItWorks" ref={howItWorksRef} className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#050505]" />
          <div className="absolute inset-0 opacity-30">
            <motion.div
              className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[80px]"
              animate={{
                x: [0, 40, 0],
                y: [0, -20, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 18,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[100px]"
              animate={{
                x: [0, -30, 0],
                y: [0, 30, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 24,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>

        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
              <span className="text-xs font-medium">HOW IT WORKS</span>
            </motion.div>

            <motion.h2
              className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Simple Process, Exceptional Results
            </motion.h2>

            <motion.p
              className="text-xl text-white/70 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Our streamlined process ensures a hassle-free experience from booking to destination.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection line for desktop */}
            <div className="hidden md:block absolute top-32 left-0 right-0 h-px bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 z-0"></div>

            {[
              {
                step: 1,
                title: "Request a Ride",
                description: "Enter your destination and choose your ride type based on your needs.",
                image:
                  "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
                color: "from-blue-600 to-purple-600",
              },
              {
                step: 2,
                title: "Get Matched",
                description: "Our intelligent algorithm will connect you with the nearest available driver.",
                image:
                  "https://images.unsplash.com/photo-1556122071-e404eaedb77f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
                color: "from-purple-600 to-blue-600",
              },
              {
                step: 3,
                title: "Enjoy Your Ride",
                description: "Track your journey in real-time and pay seamlessly through the app.",
                image:
                  "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80",
                color: "from-blue-600 to-purple-600",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -8 }}
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 h-full group">
                  <div className="p-8">
                    <div
                      className={`bg-gradient-to-r ${step.color} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 transform transition-transform duration-500 group-hover:scale-110`}
                    >
                      <span className="text-2xl font-bold text-white">{step.step}</span>
                    </div>

                    <h3 className="text-xl font-semibold mb-4 text-center">{step.title}</h3>

                    <p className="text-white/70 text-center mb-6">{step.description}</p>

                    <div className="relative overflow-hidden rounded-xl mb-6 group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <img
                        src={step.image || "/placeholder.svg"}
                        alt={step.title}
                        className="w-full h-auto rounded-xl transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex justify-center">
                      <a
                        href="#"
                        className="text-blue-400 font-medium flex items-center hover:underline group"
                        onMouseEnter={() => setCursorHovered(true)}
                        onMouseLeave={() => setCursorHovered(false)}
                      >
                        Learn more
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full shadow-lg hover:shadow-blue-500/25 transition-all duration-300 inline-flex items-center"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => {
                setCursorHovered(true)
                setCursorText("Get Started")
              }}
              onMouseLeave={() => {
                setCursorHovered(false)
                setCursorText("")
              }}
            >
              <span>Get Started Now</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" ref={testimonialsRef} className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#050505]" />
          <div className="absolute inset-0 opacity-30">
            <motion.div
              className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[100px]"
              animate={{
                x: [0, 40, 0],
                y: [0, -20, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 18,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[80px]"
              animate={{
                x: [0, -30, 0],
                y: [0, 30, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 24,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>

        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
              <span className="text-xs font-medium">TESTIMONIALS</span>
            </motion.div>

            <motion.h2
              className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              What Our Users Say
            </motion.h2>

            <motion.p
              className="text-xl text-white/70 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Don't just take our word for it — see what our users have to say about their experience with LogistiQ.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative h-[400px] overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      activeTestimonial === index ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    initial={false}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-purple-600/10" />
                    <div className="p-8 flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center mb-6">
                          <div className="relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75" />
                            <img
                              src={testimonial.image || "/placeholder.svg"}
                              alt={testimonial.name}
                              className="w-16 h-16 rounded-full relative border-2 border-white/10 object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-xl font-semibold">{testimonial.name}</h4>
                            <p className="text-white/70">{testimonial.role}</p>
                          </div>
                        </div>

                        <div className="flex mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i < testimonial.rating ? "text-yellow-400 fill-current" : "text-white/20"}`}
                            />
                          ))}
                        </div>

                        <p className="text-xl text-white/90 italic leading-relaxed">"{testimonial.content}"</p>
                      </div>

                      <div className="absolute bottom-8 right-8 opacity-10">
                        <svg width="60" height="60" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M16.6667 13.3333H10.0001C8.15913 13.3333 6.66675 14.8257 6.66675 16.6667V23.3333C6.66675 25.1743 8.15913 26.6667 10.0001 26.6667H13.3334C15.1744 26.6667 16.6667 25.1743 16.6667 23.3333V13.3333Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M33.3334 13.3333H26.6667C24.8258 13.3333 23.3334 14.8257 23.3334 16.6667V23.3333C23.3334 25.1743 24.8258 26.6667 26.6667 26.6667H30.0001C31.841 26.6667 33.3334 25.1743 33.3334 23.3333V13.3333Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      activeTestimonial === index ? "bg-blue-500" : "bg-white/20"
                    }`}
                    onClick={() => setActiveTestimonial(index)}
                    onMouseEnter={() => setCursorHovered(true)}
                    onMouseLeave={() => setCursorHovered(false)}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="space-y-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex items-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white mr-6">
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-white/70">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <motion.button
                  className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300 flex items-center group"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => {
                    setCursorHovered(true)
                    setCursorText("View All")
                  }}
                  onMouseLeave={() => {
                    setCursorHovered(false)
                    setCursorText("")
                  }}
                >
                  <span>View All Reviews</span>
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#050505]" />
          <div className="absolute inset-0 opacity-30">
            <motion.div
              className="absolute top-1/4 right-1/3 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[80px]"
              animate={{
                x: [0, 30, 0],
                y: [0, -30, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 15,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/3 left-1/3 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[100px]"
              animate={{
                x: [0, -40, 0],
                y: [0, 40, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 20,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>

        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
              <span className="text-xs font-medium">FAQ</span>
            </motion.div>

            <motion.h2
              className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Frequently Asked Questions
            </motion.h2>

            <motion.p
              className="text-xl text-white/70 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Find answers to common questions about our ride-sharing platform.
            </motion.p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <button
                    className="w-full px-6 py-4 text-left flex items-center justify-between"
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    onMouseEnter={() => setCursorHovered(true)}
                    onMouseLeave={() => setCursorHovered(false)}
                  >
                    <span className="text-lg font-medium">{faq.question}</span>
                    {activeFaq === index ? (
                      <Minus className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Plus className="w-5 h-5 text-white/70" />
                    )}
                  </button>
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-4 text-white/70">
                          <div className="pt-2 border-t border-white/10">{faq.answer}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50" />
          <div className="absolute inset-0 opacity-70">
            <motion.div
              className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full bg-blue-600/30 blur-[120px]"
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 20,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-600/30 blur-[100px]"
              animate={{
                x: [0, -40, 0],
                y: [0, 40, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 15,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </div>
        </div>

        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                Ready to Transform Your Ride Experience?
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Join thousands of satisfied users who have made the switch to our innovative ride-sharing platform.
                Download our app today!
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <motion.button
                  className="px-8 py-4 bg-white text-blue-900 font-medium rounded-full shadow-lg hover:shadow-white/25 transition-all duration-300 flex items-center justify-center group"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => {
                    setCursorHovered(true)
                    setCursorText("App Store")
                  }}
                  onMouseLeave={() => {
                    setCursorHovered(false)
                    setCursorText("")
                  }}
                >
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.707,9.293l-5-5c-0.391-0.391-1.024-0.391-1.414,0l-5,5c-0.391,0.391-0.391,1.024,0,1.414 s1.024,0.391,1.414,0L12,7.414l4.293,4.293C16.488,11.902,16.744,12,17,12s0.512-0.098,0.707-0.293 C18.098,11.317,18.098,10.683,17.707,9.293z" />
                    <path d="M12,18c-0.553,0-1-0.447-1-1V6c0-0.553,0.447-1,1-1s1,0.447,1,1v11C13,17.553,12.553,18,12,18z" />
                  </svg>
                  <span>App Store</span>
                </motion.button>
                <motion.button
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-medium rounded-full shadow-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center group"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => {
                    setCursorHovered(true)
                    setCursorText("Google Play")
                  }}
                  onMouseLeave={() => {
                    setCursorHovered(false)
                    setCursorText("")
                  }}
                >
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.9,10.37a2.06,2.06,0,0,0-1.1-1.81l0,0L7.87,1a2.12,2.12,0,0,0-3.16,1.62L4.75,14.2h0a2.34,2.34,0,0,0,0,.38,2.09,2.09,0,0,0,2.8,1.74l11.93-4.8a2.11,2.11,0,0,0,1.42-1.88ZM5.9,15.3a1,1,0,0,1-.77-.36,1,1,0,0,1-.23-.82h0L5,2.79a1,1,0,0,1,.46-.76,1,1,0,0,1,.85-.09L18.3,8.55h0a1,1,0,0,1,.6.82,1,1,0,0,1-.6.95L6.37,15.12A1,1,0,0,1,5.9,15.3Z" />
                  </svg>
                  <span>Google Play</span>
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto max-w-xs"
            >
              <div className="relative">
                <motion.div
                  className="absolute -inset-4 bg-white/20 rounded-3xl blur-xl"
                  animate={{
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                />

                <img
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=600&q=80"
                  alt="Mobile app"
                  className="mx-auto rounded-3xl shadow-2xl border-4 border-white/10 relative z-10"
                />

                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold py-1 px-3 rounded-full z-20">
                  NEW!
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" ref={contactRef} className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#050505]" />
          <div className="absolute inset-0 opacity-30">
            <motion.div
              className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[100px]"
              animate={{
                x: [0, 40, 0],
                y: [0, -20, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 18,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[80px]"
              animate={{
                x: [0, -30, 0],
                y: [0, 30, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 24,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>

        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
              <span className="text-xs font-medium">CONTACT</span>
            </motion.div>

            <motion.h2
              className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Get in Touch
            </motion.h2>

            <motion.p
              className="text-xl text-white/70 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Have questions or need support? Our team is here to help you.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
                <form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-sm font-medium text-white/70 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-white/70 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your message..."
                    ></textarea>
                  </div>
                  <motion.button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={() => {
                      setCursorHovered(true)
                      setCursorText("Send")
                    }}
                    onMouseLeave={() => {
                      setCursorHovered(false)
                      setCursorText("")
                    }}
                  >
                    Send Message
                  </motion.button>
                </form>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden h-full border border-white/10">
                <div className="h-64 bg-gray-800 relative">
                  <img
                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80"
                    alt="Map location"
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-blue-500" />
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white mr-4">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold mb-1">Office Address</h4>
                        <p className="text-white/70">
                          123 Main Street, Suite 456
                          <br />
                          New York, NY 10001
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white mr-4">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold mb-1">Phone</h4>
                        <p className="text-white/70">+1 (555) 123-4567</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white mr-4">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold mb-1">Email</h4>
                        <p className="text-white/70">support@logistiq.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-16 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black" />
        </div>

        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="text-white font-bold text-xl flex items-center mb-6">
                <Truck className="w-6 h-6 mr-2 text-blue-500" />
                <span>LogistiQ</span>
              </div>
              <p className="text-white/70 mb-6">
                Transforming the way you travel with innovative ride-sharing solutions.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-white/40 hover:text-blue-400 transition-colors"
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <a
                  href="#"
                  className="text-white/40 hover:text-blue-400 transition-colors"
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                >
                  <Twitter className="w-6 h-6" />
                </a>
                <a
                  href="#"
                  className="text-white/40 hover:text-blue-400 transition-colors"
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                >
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-4">
                {["About Us", "Services", "Careers", "Blog"].map((item, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-white/70 hover:text-blue-400 transition-colors flex items-center group"
                      onMouseEnter={() => setCursorHovered(true)}
                      onMouseLeave={() => setCursorHovered(false)}
                    >
                      <ArrowRight className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                      <span>{item}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Support</h4>
              <ul className="space-y-4">
                {["Help Center", "Safety", "Terms of Service", "Privacy Policy"].map((item, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-white/70 hover:text-blue-400 transition-colors flex items-center group"
                      onMouseEnter={() => setCursorHovered(true)}
                      onMouseLeave={() => setCursorHovered(false)}
                    >
                      <ArrowRight className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                      <span>{item}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Phone className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                  <span className="text-white/70">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start">
                  <Mail className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                  <span className="text-white/70">support@logistiq.com</span>
                </li>
                <li className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                  <span className="text-white/70">123 Main St, New York, NY 10001, USA</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/50 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} LogistiQ. All rights reserved.
              </p>
              <div className="flex space-x-6">
                {["Terms", "Privacy", "Cookies"].map((item, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-white/50 hover:text-blue-400 text-sm transition-colors"
                    onMouseEnter={() => setCursorHovered(true)}
                    onMouseLeave={() => setCursorHovered(false)}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <motion.button
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-blue-500/25 transition-colors z-40"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onMouseEnter={() => {
          setCursorHovered(true)
          setCursorText("Top")
        }}
        onMouseLeave={() => {
          setCursorHovered(false)
          setCursorText("")
        }}
      >
        <ArrowUp className="w-6 h-6" />
      </motion.button>
</div>
  )
}

export default Home
