// components/StudentTestimonial.tsx
"use client";

import Image from "next/image";
import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import "../../style.css";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";

interface StudentTestimonialProps {
  text: string;
  name: string;
  imageSrc: string;
  year: string;
}

const StudentTestimonial = ({
  text,
  name,
  imageSrc,
  year,
}: StudentTestimonialProps) => {
  return (
    <section className="spacer">
      <div className="testimonial-section">
        <div className="testi-user-img">
          <Swiper>
            <SwiperSlide>
              <Image
                src={imageSrc}
                alt="Student Image"
                width={200}
                height={200}
              />
            </SwiperSlide>
          </Swiper>
        </div>
        <div className="user-saying">
          * Your testimonial Swiper container goes here
        </div>
      </div>
    </section>
  );
};

export default StudentTestimonial;
