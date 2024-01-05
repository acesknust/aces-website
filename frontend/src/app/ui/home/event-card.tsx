'use client';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight } from "react-icons/fa";

function EventCard() {
const isCompleted = false;
  return (
    <div className="bg-white p-4 mb-4 rounded-lg shadow-md">
      <div className="mb-4">
        <Image
        src="/images/event.jpg" 
        alt="event img" className="object-cover rounded-md" 
        width={250}
        height={1}
        quality={100}
        />
      </div>
      <h3 className="text-xl font-bold mb-2">ACES Tratech Tutorials</h3>
      <p className="text-gray-600 mb-2">Saturday, 16th January 2024</p>
        <p className="text-gray-600 mb-2">10:00 AM</p>
      <div
        className={`w-1/2 text-center rounded-full px-3 py-1 text-sm font-semibold ${
          isCompleted ? 'bg-red-400 text-white' : 'bg-green-400 text-white'
        }`}
      >
        {isCompleted ? 'Completed' : 'Upcoming'}
      </div>
    </div>
  )
}

function SampleNextArrow(props: any) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", color: "black" }} 
        onClick={onClick}
      >
        <FaRegArrowAltCircleRight size={24} />
      </div>
    );
  }
  
  function SamplePrevArrow(props: any) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", color: "black" }} 
        onClick={onClick}
      >
        <FaRegArrowAltCircleLeft size={24} /> 
      </div>
    );
  }

const MySlider = () => {
    const settings = {
      prevArrow: <SamplePrevArrow />,
      nextArrow: <SampleNextArrow />,
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 1,
      swipeToSlide: true,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1, 
            slidesToScroll: 1,
          },
        },
      ],
    };
  
    return ( 
      <Slider {...settings} className="m-3" >
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
      </Slider>
    );
  };
  
  export default MySlider;
  