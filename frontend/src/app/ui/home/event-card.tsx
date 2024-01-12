'use client';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight } from "react-icons/fa";
import { useEffect, useState } from "react";
import { getEvents } from "../../../../api/event";

interface Event{
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
  image: string;
  status : 'Upcoming' | 'Completed';
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
  const isCompleted = false;
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents().then((res) => {
      setEvents(res?.data);
      setLoading(false);
    });
  }, []);

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

  if (loading === false && events.length === 0) {
    return (
      <div>
        <p className="lg:text-5xl text-3xl text-gray-400 text-center h-screen">
          No events data yet
        </p>
      </div>
    );
  }

  return (
    <Slider {...settings} className="m-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white p-4 mb-4 rounded-lg shadow-md"
          >
            <div className="mb-4 ">
              <Image
                src={event.image}
                alt={event.name + " image"}
                className="object-cover rounded-md"
                width={450}
                height={300}
                quality={100}
              />
            </div>
            <h3 className="text-xl font-bold mb-2">{event.name}</h3>
            <p className="text-gray-600 mb-2">{event.date}</p>
            <div className="flex items-center mb-2 gap-5">
              <p className="text-gray-600 mb-2">{event.time}</p>
              <p className="text-gray-600 mb-2">{event.location}</p>
            </div>
            <div
              className={`w-1/2 text-center rounded-full px-3 py-1 text-sm font-semibold ${
                event.status === "Completed"
                  ? "bg-red-400 text-white"
                  : "bg-green-400 text-white"
              }`}
            >
              {event.status}
            </div>
          </div>
        ))}
    </Slider>
  );
};

export default MySlider;
  