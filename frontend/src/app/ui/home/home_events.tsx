"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

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
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-gray-800 mb-10 text-center"
        >
          Upcoming Events
        </motion.h2>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {events.map((event) => (
            <motion.div 
              key={event.id}
              variants={itemVariants}
              className="flex items-center bg-gray-100 rounded-xl p-4 shadow-md hover:shadow-lg transition duration-300"
            >
              <div className="w-32 h-32 flex-shrink-0 relative">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>

              <div className="ml-5 flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                <p className="text-sm font-medium text-blue-600">{event.time}</p>
              </div>

              <motion.div 
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
                className="ml-4"
              >
                <a href="#" className="text-blue-500 hover:text-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" height="24" 
                       viewBox="0 0 24 24" 
                       fill="none" 
                       stroke="currentColor" 
                       strokeWidth="2" 
                       strokeLinecap="round" 
                       strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
