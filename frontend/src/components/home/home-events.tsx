"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';

export default function HomeEvents() {
  const events = [
    {
      id: 1,
      title: 'CodeFest 2025',
      image: '/images/codefest.jpg',
      description: 'Join us for a thrilling day of coding challenges, workshops, and networking with tech enthusiasts.',
      time: '00:00'
    },
    {
      id: 2,
      title: 'ACES Robotics Meeting',
      image: '/images/club_images/robotics_meeting.jpg',
      description: 'Explore the latest in robotics. Collaborate, build bots, and automate solutions with fellow members.',
      time: '00:00'
    },
    {
      id: 3,
      title: 'ACES Dinner 2025',
      image: '/images/dinner_night.jpg',
      description: 'A night of fun, food, and fellowship. Connect with ACES members over an elegant dinner.',
      time: '00:00'
    },
    {
      id: 4,
      title: 'ACES Hangout',
      image: '/images/aces_hangout.jpg',
      description: 'Unwind with games, conversations, and chill vibes in this relaxed member-exclusive event.',
      time: '00:00'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
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
    <section className="pb-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
          Upcoming Events
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {events.map((event) => (
            <motion.div
              key={event.id}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative w-full h-48">
                <Image
                  src={event.image}
                  alt={event.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-xl"
                />
              </div>
              <div className="p-4">
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                </div>
                <div className="flex items-center justify-between w-full">
                  <p className="text-sm font-medium text-blue-600">{event.time}</p>
                  <div className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                    Read more <FaArrowRight />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
