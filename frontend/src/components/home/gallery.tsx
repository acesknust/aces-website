"use client";

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

export default function Gallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const galleryImages = [
    { id: 1, src: '/images/Gallery/Trip.jpg', alt: "trip image" },
    { id: 2, src: '/images/Gallery/Acesshirt.jpg', alt: "aces shirt image" },
    { id: 3, src: '/images/Gallery/codefest.jpg', alt: "codefest image" },
    { id: 4, src: '/images/Gallery/Jersey.jpg', alt: "Jersey image" },
    { id: 5, src: '/images/Gallery/Trip.jpg', alt: "trip image" },

  ];

  const scrollToSlide = (index: number) => {
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
    scrollToSlide(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1;
    scrollToSlide(newIndex);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold" >
            Our Gallery
          </h2>
          <Link href="/gallery">
            <span className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
              See more <FaArrowRight />
            </span>
          </Link>
        </div>

        {/* Gallery */}
        <div className="relative">
          <div
            ref={carouselRef}
            className="flex overflow-x-hidden gap-4 pb-4 snap-x snap-mandatory"
          >
            {galleryImages.map((image, index) => (
              <div
                key={image.id}
                className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 snap-center"
              >
                <div className="overflow-hidden rounded-lg shadow-lg mx-2">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={600}
                    height={400}
                    className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${currentIndex === index ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10 transition-colors"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10 transition-colors"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
