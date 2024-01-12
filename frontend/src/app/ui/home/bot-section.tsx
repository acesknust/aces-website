import React from "react";
import { FaTelegram } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function BotSection() {
  return (
    <section className="">
      <div className="container mx-auto text-center">
        <div className="flex flex-col-reverse lg:flex-row items-center mb-8">
          <Image
            src="/images/Chatbot.png"
            alt="CourseBot"
            width={450}
            height={450}
            quality={100}
            className="rounded-lg"
          />
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Meet
              <span className="text-blue-600"> CourseBot</span>: Your Resource
              Companion!
            </h2>
            <p className="text-lg mb-8 ml-4 mr-4">
              Enhance your learning experience with CourseBot. Chat CourseBot
              for exclusive course materials, updates, and discussions.
            </p>
            <Link
              href="https://t.me/YourTelegramBot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-white hover:text-indigo-600 transition duration-300"
            >
              Chat CourseBot{" "}
              <FaTelegram className="inline-block ml-2" size={24} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
