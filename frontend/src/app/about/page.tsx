'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';

// Types for API response
interface SocialLink {
  platform: string;
  url: string;
}

interface Executive {
  id: number;
  name: string;
  position: string;
  display_position: string;
  image: string;
  sort_order: number;
  social_links: SocialLink[];
}

interface AcademicYear {
  id: number;
  name: string;
  hero_banner: string | null;
  group_photo: string | null;
  description: string;
  show_description: boolean;
  is_current: boolean;
  executives: Executive[];
}

interface ApiResponse {
  current_year: string;
  years: AcademicYear[];
}

// Loading skeleton for executive carousel
const ExecutiveSkeleton = () => (
  <div className="flex flex-col items-center animate-pulse">
    <div className="w-full h-[500px] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
    </div>
    <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-32" />
  </div>
);

const About = () => {
  const [activeSection, setActiveSection] = useState('Vision');
  const [currentExecutiveIndex, setCurrentExecutiveIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // API state
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Fallback group photo
  const fallbackGroupPhoto = 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508620/aces-group-photo_zoxsvy.png';

  // Auto-rotate carousel (pauses on hover)
  useEffect(() => {
    if (executives.length <= 1 || isHovering) return;
    const interval = setInterval(() => {
      setCurrentExecutiveIndex((prev) => (prev + 1) % executives.length);
    }, 4000); // Rotate every 4 seconds
    return () => clearInterval(interval);
  }, [executives.length, isHovering]);

  // Fetch executives from API
  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        setIsLoading(true);
        let apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          apiUrl = process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000'
            : 'https://aces-shop-backend-w8ro7.ondigitalocean.app';
        }

        const res = await fetch(`${apiUrl}/api/executives/years/`);
        if (!res.ok) throw new Error('Failed to fetch executives');

        const json: ApiResponse = await res.json();

        // Get current year's executives and group photo
        const currentYearData = json.years.find(y => y.name === json.current_year);
        if (currentYearData) {
          if (currentYearData.executives.length > 0) {
            setExecutives(currentYearData.executives);
          }
          if (currentYearData.group_photo) {
            setGroupPhoto(currentYearData.group_photo);
          }
        }
      } catch (err) {
        console.error('Error fetching executives:', err);
        setError('Failed to load executives');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExecutives();
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleImageLoad = (executiveId: number) => {
    setLoadedImages((prev) => new Set(prev).add(executiveId));
  };

  const nextExecutive = () => {
    if (executives.length > 0) {
      setCurrentExecutiveIndex((prev) => (prev + 1) % executives.length);
    }
  };

  const prevExecutive = () => {
    if (executives.length > 0) {
      setCurrentExecutiveIndex((prev) => (prev - 1 + executives.length) % executives.length);
    }
  };

  const currentExecutive = executives[currentExecutiveIndex];

  return (
    <>
      <Head>
        <title>About Us | ACES KNUST - Association of Computer Engineering Students</title>
        <meta name="description" content="Learn about ACES KNUST - the official student body representing Computer Engineering students at KNUST. Discover our mission, vision, and meet our executive team." />
        <meta name="keywords" content="ACES, KNUST, Computer Engineering, Student Association, Ghana, Technology, Engineering Students, ACES Executives, Mission, Vision" />
        <meta property="og:title" content="About ACES KNUST" />
        <meta property="og:description" content="The Association of Computer Engineering Students - Technology For Our Age" />
        <meta property="og:type" content="website" />
      </Head>
      <Header />
      <div className="min-h-screen bg-white pt-24">
        {/* Hero Section */}
        <section className="relative w-full">
          {/* Group photo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full overflow-hidden"
          >
            <img
              src={groupPhoto || fallbackGroupPhoto}
              alt="ACES KNUST Group Photo"
              className="w-full h-auto object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white py-8 px-4 sm:px-6 lg:px-8 text-center"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Association of Computer Engineering Students - ACES KNUST
            </h1>
            <p className="mt-2 text-gray-600">Technology For Our Age</p>
          </motion.div>
        </section>

        {/* Main Content Description */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="py-8 px-4 sm:px-6 lg:px-8 bg-white"
        >
          <div className="max-w-7xl mx-auto">
            <div className="prose max-w-none">
              <p className="text-base text-gray-700">
                The Association of Computer Engineering Students (ACES) is the
                official student body representing all Computer Engineering
                students at KNUST. As a vibrant community of innovative and
                forward-thinking individuals, ACES serves as a platform for
                students to connect, learn, and grow together in the field of
                Computer Engineering.
              </p>

              <p className="text-base text-gray-700 mt-4">
                Our association is committed to supporting students through a
                wide range of initiatives, including technical workshops, career
                development programs, mentorship, industrial visits, networking
                events, and community service. We organize events, competitions,
                conferences, and strive to bridge the gap between classroom
                learning and real-world application.
              </p>

              <p className="text-base text-gray-700 mt-4">
                At the heart of ACES is a passion for technology and a drive to
                solve problems that impact our society. Whether it&apos;s
                through projects, hackathons, or leadership opportunities, we
                provide opportunities to think critically, work ethically, and
                lead confidently in the tech space.
              </p>

              <p className="text-base text-gray-700 mt-4">
                Together, we aim to build a vibrant community where innovation
                thrives, ideas are shared, and every member is empowered to
                succeed.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Department Executives Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="py-4 px-4 sm:px-6 lg:px-8 bg-gray-50"
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Department Executives
            </h2>

            {/* Loading State */}
            {isLoading && (
              <div className="max-w-2xl mx-auto">
                <ExecutiveSkeleton />
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-10">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Carousel Container - with hover detection for auto-pause */}
            {!isLoading && !error && executives.length > 0 && currentExecutive && (
              <div
                className="relative max-w-2xl mx-auto"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {/* Navigation Buttons */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prevExecutive}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
                  aria-label="Previous executive"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextExecutive}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
                  aria-label="Next executive"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>

                {/* Executive Card - with swipe support */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentExecutiveIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 100) {
                        prevExecutive();
                      } else if (info.offset.x < -100) {
                        nextExecutive();
                      }
                    }}
                    className="flex flex-col items-center cursor-grab active:cursor-grabbing"
                  >
                    {/* Position Badge - Prominent */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mb-3"
                    >
                      <span className="inline-block bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg">
                        {currentExecutive.display_position}
                      </span>
                    </motion.div>

                    {/* Image Container */}
                    <div className="w-full h-[500px] overflow-hidden rounded-lg mb-4 relative bg-gray-100">
                      {!loadedImages.has(currentExecutive.id) && (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                      )}
                      <Image
                        src={currentExecutive.image}
                        alt={currentExecutive.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 672px"
                        className={`object-contain transition-opacity duration-500 pointer-events-none ${loadedImages.has(currentExecutive.id) ? 'opacity-100' : 'opacity-0'
                          }`}
                        onLoad={() => handleImageLoad(currentExecutive.id)}
                      />
                    </div>

                    {/* Executive Name */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center"
                    >
                      <h3 className="text-2xl font-bold text-gray-900">
                        {currentExecutive.name}
                      </h3>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {/* Dots Indicator */}
                <div className="flex justify-center mt-6 space-x-2">
                  {executives.map((_, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentExecutiveIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentExecutiveIndex
                        ? 'bg-blue-600 scale-125'
                        : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      aria-label={`Go to executive ${index + 1}`}
                    />
                  ))}
                </div>

                {/* View All Executives Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center mt-8"
                >
                  <Link href="/executives">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                    >
                      View All Executives
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && executives.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No executives found for this year.</p>
                <Link href="/executives">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View All Executives
                  </button>
                </Link>
              </div>
            )}
          </div>
        </motion.section>

        {/* Navigation Buttons */}
        <section className="py-6 px-4 sm:px-6 lg:px-8 bg-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center gap-2 bg-[#001330] rounded-full p-2 mx-auto max-w-md md:gap-4">
              {['Mission', 'Vision', 'Our Logo'].map((section) => (
                <motion.button
                  key={section}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSectionChange(section)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap cursor-pointer md:px-6 transition-all duration-200 ${activeSection === section
                    ? 'bg-white text-[#001330]'
                    : 'bg-transparent text-white'
                    }`}
                >
                  {section}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision Circle Layout (Carousel Content) */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeSection === 'Mission' && (
                <motion.div
                  key="mission"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-10"
                >
                  <div className="flex flex-col gap-3 max-w-2xl mx-auto">
                    {/* Top card: light blue */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-[#64b5f6] p-6 text-white text-left rounded-xl shadow-md"
                    >
                      <p>
                        Our primary objective is to enhance the academic
                        experience of Computer Engineering students by providing
                        resources, workshops, and study groups that reinforce
                        classroom learning and encourage independent study.
                      </p>
                    </motion.div>

                    {/* Middle card: medium blue */}
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-[#1565c0] p-6 text-white text-left rounded-xl shadow-md"
                    >
                      <p>
                        We are dedicated to fostering professional growth
                        through career development programs, networking events,
                        and mentorship opportunities that connect students with
                        industry leaders and alumni.
                      </p>
                    </motion.div>

                    {/* Bottom card: dark navy */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-[#001330] p-6 text-white text-left rounded-xl shadow-md"
                    >
                      <p>
                        ACES is committed to community impact, organizing
                        outreach programs and initiatives that leverage
                        technology to address societal challenges and promote
                        tech literacy beyond the university.
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'Vision' && (
                <motion.div
                  key="vision"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-6"
                >
                  {/* Horizontal scroll hint for mobile */}
                  <p className="text-sm text-gray-500 md:hidden flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    Swipe to explore
                  </p>

                  {/* Circles - Horizontal scroll on mobile, wrap on desktop */}
                  <div className="w-full overflow-x-auto pb-4 md:overflow-visible">
                    <div className="flex md:flex-wrap md:justify-center gap-6 md:gap-10 px-4 md:px-0" style={{ minWidth: 'max-content' }}>
                      {[
                        { title: 'Internships', color: 'bg-blue-900', text: 'Create opportunities for students to obtain practical exposure through industrial attachments.' },
                        { title: 'Skills', color: 'bg-red-600', text: 'Create opportunities for students to acquire skills useful in the field of computer engineering.' },
                        { title: 'Exchange', color: 'bg-yellow-400', text: 'Organize exchange programs with other computer engineering institutions.' },
                        { title: 'Outreach', color: 'bg-green-500', text: 'Make computer engineering attractive to students in second cycle institutions.' },
                        { title: 'Application', color: 'bg-purple-700', text: 'Help students put into practice the knowledge acquired.' },
                      ].map((item, index) => (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 2 : -2 }}
                          className={`w-40 h-40 md:w-52 md:h-52 flex-shrink-0 rounded-full ${item.color} flex flex-col items-center justify-center text-white p-4 cursor-pointer shadow-lg`}
                        >
                          <h3 className="text-base md:text-lg font-medium text-center">{item.title}</h3>
                          <p className="text-[10px] md:text-xs text-center mt-1 leading-tight">{item.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'Our Logo' && (
                <motion.div
                  key="our-logo"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-10"
                >
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <Image
                      src="/images/about/logo-transparent.png"
                      alt="ACES KNUST Logo"
                      width={400}
                      height={400}
                      className="mx-auto drop-shadow-2xl"
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default About;
