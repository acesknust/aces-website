"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Clubs() {
  const clubs = [
    { id: 1, name: 'ACES Arduino Club', 
      image: '/images/club_images/Arduino_image.avif',
      description: "A club for electronics and embedded systems lovers. Dive into real hardware projects with Arduino boards." 
    },
    { id: 2, name: 'ACES Coding Club', 
      image: '/images/club_images/coding.webp',
      description: "Build beautiful websites and applications. This club focuses on HTML, CSS, JavaScript, and modern frameworks." 
    },
    { id: 3, name: 'ACES Robotics Club',
      image: '/images/club_images/robotics_image.webp',
      description: "Design, build, and program intelligent robots. From autonomous vehicles to robotic arms, explore the future of automation through teamwork and innovation."
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-800"
          >
            Our Clubs
          </motion.h2>

          <motion.a
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            href="#"
            className="text-blue-600 hover:underline font-medium"
          >
            See all
          </motion.a>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {clubs.map((club) => (
            <motion.div
              key={club.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative w-full h-60">
                <Image
                  src={club.image}
                  alt={club.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-xl"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {club.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {club.description}
                </p>
                <a href="#" className="text-blue-600 hover:underline font-medium">
                  Read More...
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
