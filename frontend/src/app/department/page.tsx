'use client';

import Header from "@/components/header";
import Footer from "@/components/footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface StaffMember {
  id: number;
  name: string;
  position: string;
  image: string | null;
}

// Loading skeleton component
function SkeletonCard() {
  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden animate-pulse w-full">
      <div className="w-full aspect-[3/4] bg-gray-200" />
      <div className="p-4 sm:p-6 text-center space-y-3">
        <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 mx-auto" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
      </div>
    </div>
  );
}

// Staggered container animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

// Card animation with spring physics
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      mass: 0.5
    }
  }
};

export default function Page() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          apiUrl = process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000'
            : 'https://aces-shop-backend-w8ro7.ondigitalocean.app';
        }
        const response = await fetch(`${apiUrl}/api/staff/`);
        if (!response.ok) throw new Error('Failed to fetch staff');
        const data = await response.json();
        setStaff(data);
      } catch (err) {
        console.error('Error fetching staff:', err);
        setError('Unable to load staff members');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section - Responsive padding and text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8 px-4"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
          Department <span className="text-blue-600">Officials</span>
        </h1>
        <p className="text-gray-600 mt-3 sm:mt-4 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
          Meet the dedicated faculty members leading the Computer Engineering Department
        </p>
      </motion.div>

      {/* Staff Grid - Responsive padding and gap */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <p className="text-gray-500 text-base sm:text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        ) : staff.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <p className="text-gray-500 text-base sm:text-lg">No staff members available</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          >
            {staff.map((member) => (
              <motion.div
                key={member.id}
                variants={cardVariants}
                whileHover={{
                  y: -12,
                  scale: 1.02,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                }}
                whileTap={{ scale: 0.98 }}
                className="group bg-white shadow-lg rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Image with zoom effect - Responsive height using aspect ratio */}
                <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
                  <Image
                    src={member.image || '/images/placeholder-person.png'}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    unoptimized
                  />
                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Text info - Responsive padding and text sizes */}
                <div className="p-4 sm:p-5 md:p-6 text-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                    {member.name}
                  </h2>
                  <p className="text-blue-600 font-medium mt-1 text-sm sm:text-base line-clamp-1">
                    {member.position}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
