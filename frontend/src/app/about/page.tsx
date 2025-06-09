"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Image from "next/image";

const About = () => {
  const [activeSection, setActiveSection] = useState("Vision"); // Default to Vision

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white pt-24">
        {/* Hero Section */}
        <section className="relative w-full">
          {/* Group photo */}
          <div className="w-full overflow-hidden">
            <img
              src="/images/about/aces-group-photo.png"
              alt="ACES KNUST Group Photo"
              className="w-full h-auto object-cover"
            />
          </div>

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
                solve problems that impact our society. Whether it's through
                projects, hackathons, or leadership opportunities, we provide
                opportunities to think critically, work ethically, and lead
                confidently in the tech space.
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Department Executives
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Executive 1 */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-w-1 aspect-h-1 overflow-hidden rounded-lg mb-2">
                  <img
                    src="/images/executives/2023/Heads/Frimpong.jpg"
                    alt="Prof. Head of Department"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Prof. Head of Department
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Something brief about how this individual contributes to the
                  department and its vision for the future
                </p>
              </div>

              {/* Executive 2 */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-w-1 aspect-h-1 overflow-hidden rounded-lg mb-4">
                  <img
                    src="/images/executives/2023/Heads/Michael.jpg"
                    alt="ACES Patron"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  ACES Patron
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Something brief about how this individual contributes to the
                  association and its vision for the future
                </p>
              </div>

              {/* Executive 3 */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-w-1 aspect-h-1 overflow-hidden rounded-lg mb-4">
                  <img
                    src="/images/executives/2023/Heads/Emmanuel.jpg"
                    alt="ACES President"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  ACES President
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Something brief about how this individual contributes to the
                  association and its vision for the future
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Navigation Buttons */}
        <section className="py-6 px-4 sm:px-6 lg:px-8 bg-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center gap-2 bg-[#001330] rounded-full p-2 mx-auto max-w-md md:gap-4">
              <button
                onClick={() => handleSectionChange("Mission")}
                className={`px-4 py-2 rounded-full whitespace-nowrap cursor-pointer md:px-6 ${
                  activeSection === "Mission"
                    ? "bg-white text-[#001330]"
                    : "bg-transparent text-white"
                }`}
              >
                Mission
              </button>
              <button
                onClick={() => handleSectionChange("Vision")}
                className={`px-4 py-2 rounded-full whitespace-nowrap cursor-pointer md:px-6 ${
                  activeSection === "Vision"
                    ? "bg-white text-[#001330]"
                    : "bg-transparent text-white"
                }`}
              >
                Vision
              </button>
              <button
                onClick={() => handleSectionChange("Our Logo")}
                className={`px-4 py-2 rounded-full whitespace-nowrap cursor-pointer md:px-6 ${
                  activeSection === "Our Logo"
                    ? "bg-white text-[#001330]"
                    : "bg-transparent text-white"
                }`}
              >
                Our Logo
              </button>
            </div>
          </div>
        </section>

        {/* Mission & Vision Circle Layout (Carousel Content) */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeSection === "Mission" && (
                <motion.div
                  key="mission"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-10"
                >
                  <div className="flex flex-col max-w-2xl mx-auto">
                    {/* Top card: light blue */}
                    <div className="bg-[#64b5f6] p-6 text-white text-left">
                      <p>
                        Our primary objective is to enhance the academic
                        experience of Computer Engineering students by providing
                        resources, workshops, and study groups that reinforce
                        classroom learning and encourage independent study.
                      </p>
                    </div>

                    {/* Middle card: medium blue */}
                    <div className="bg-[#1565c0] p-6 text-white text-left">
                      <p>
                        We are dedicated to fostering professional growth
                        through career development programs, networking events,
                        and mentorship opportunities that connect students with
                        industry leaders and alumni.
                      </p>
                    </div>

                    {/* Bottom card: dark navy */}
                    <div className="bg-[#001330] p-6 text-white text-left">
                      <p>
                        ACES is committed to community impact, organizing
                        outreach programs and initiatives that leverage
                        technology to address societal challenges and promote
                        tech literacy beyond the university.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "Vision" && (
                <motion.div
                  key="vision"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-8 md:gap-12"
                >
                  {/* First row of circles (3 circles) */}
                  <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    {/* Internships Circle */}
                    <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-blue-900 flex flex-col items-center justify-center text-white p-4 cursor-pointer">
                      <h3 className="text-lg font-medium text-center">
                        Internships
                      </h3>
                      <p className="text-xs text-center mt-1">
                        Create opportunities for students to obtain practical
                        exposure through industrial attachments.
                      </p>
                    </div>

                    {/* Skills Circle */}
                    <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-red-600 flex flex-col items-center justify-center text-white p-4 cursor-pointer">
                      <h3 className="text-lg font-medium text-center">
                        Skills
                      </h3>
                      <p className="text-xs text-center mt-1">
                        Create opportunities for students to acquire skills
                        useful in the field of computer engineering.
                      </p>
                    </div>

                    {/* Exchange Circle */}
                    <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-yellow-400 flex flex-col items-center justify-center p-4 cursor-pointer">
                      <h3 className="text-lg font-medium text-center text-white">
                        Exchange
                      </h3>
                      <p className="text-xs text-center mt-1 text-white">
                        Organize exchange programs with other computer
                        engineering institutions.
                      </p>
                    </div>
                  </div>

                  {/* Second row of circles (2 circles) */}
                  <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    {/* Outreach Circle */}
                    <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-green-500 flex flex-col items-center justify-center text-white p-4 cursor-pointer">
                      <h3 className="text-lg font-medium text-center">
                        Outreach
                      </h3>
                      <p className="text-xs text-center mt-1">
                        Make computer engineering attractive to students in
                        second cycle institutions.
                      </p>
                    </div>

                    {/* Application Circle */}
                    <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-purple-700 flex flex-col items-center justify-center p-4 cursor-pointer">
                      <h3 className="text-lg font-medium text-center text-white">
                        Application
                      </h3>
                      <p className="text-xs text-center mt-1 text-white">
                        Help students put into practice the knowledge acquired.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "Our Logo" && (
                <motion.div
                  key="our-logo"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-10"
                >
                  <Image
                    src="/images/aceslogo.png"
                    alt="ACES KNUST Logo"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
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
