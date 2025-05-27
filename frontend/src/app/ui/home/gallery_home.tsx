"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Gallery_home() {
  const galleryImages = [
    { id: 1, src: '/images/Gallery/Trip.jpg', alt:"trip image" },
    { id: 2, src: '/images/Gallery/Acesshirt.jpg',  alt:"aces shirt  image" },
    { id: 3, src: '/images/Gallery/codefest.jpg', alt:"codefest  image" },
    { id: 4, src: '/images/Gallery/Jersey.jpg',  alt:"Jersy  image" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold"
          >
            Our Gallery
          </motion.h2>

          <motion.a
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            href="#"
            className="text-blue-600 hover:underline"
          >
           
          <Link href="./gallery">
          <span className="text-blue-600  cursor-pointer">See more...</span>
          </Link>
           

          </motion.a>
        </div>

        {/* Gallery */}
        <div className="relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex overflow-x-auto gap-4 pb-4 no-scrollbar"
          >
            {galleryImages.map((image) => (
              <motion.div
                key={image.id}
                variants={itemVariants}
                className="flex-shrink-0 w-64"
              >
                <div className="overflow-hidden rounded-md shadow-md">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={600}
                    height={300}
                    className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Arrows */}
          <button className="absolute top-1/2 left-0 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button className="absolute top-1/2 right-0 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
