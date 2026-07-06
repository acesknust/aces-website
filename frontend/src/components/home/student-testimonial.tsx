"use client";

import React from "react";

export default function StudentTestimonial() {
  return (
    <section className="container mx-auto px-4 lg:px-8 bg-white">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left - Prep Card */}
        <div className="w-full bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-sm text-gray-600 mb-4">
            Testimonials from students and professionals who have used our platform.
          </p>
          <ul className="flex flex-col gap-3">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-green-600">✔</span>
              <p className="text-sm">Easy to use and saves a lot of time</p>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-green-600">✔</span>
              <p className="text-sm">Great support and community</p>
            </li>
          </ul>
          <div className="flex justify-center mt-6 gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          </div>
        </div>

        {/* Right - Testimonial Profile */}
        <div className="w-full">
          <h3 className="text-xl font-bold mb-2">Benjamin Etonam <br /> Abotsi</h3>
          <h4 className="text-lg mb-4">A Great Mind behind <span className="text-blue-600 font-semibold">Prep Ai</span></h4>
          <p className="text-gray-600 mb-6">
            “This platform helped me study for examination. I love how everything is organized and intuitive.”
          </p>
          <button className="bg-blue-600 text-white py-2 px-6 rounded-md hover:scale-105 transition duration-300">
            Read More Testimonials
          </button>
        </div>
      </div>
    </section>
  );
}
