import Image from "next/image"
import Link from "next/link"
import { FaTelegram } from "react-icons/fa"

export default function Hero() {
  return (
    <section className="py-4 bg-indigo-50">
      <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center p-4">
        {/* Text Content */}
        <div className="mt-8 lg:w-1/2 text-center lg:text-left lg:pr-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">Welcome To <br/><span className="text-blue-600">ACES-KNUST</span> <br/> Website</h1>
          <p className="text-lg mb-8">The Official Website For The Association Of Computer Engineering Students, 
          Kwame Nkrumah University of Science and Technology.
          <br/>
           Explore, Learn, and Connect with Us</p>
           <Link href="https://t.me/+DLdm_86B3lc5YzFk">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold lg:w-max w-1/2 hover:bg-white hover:text-indigo-600 transition duration-300">
            <FaTelegram size={30} className="inline-block"/>
            <span> Join Our</span>
            <span> Community</span>
          </button>
          </Link>
        </div>

        {/* Image */}
        <div className="lg:w-1/2">
          <Image
            src="/images/hero-img.png" // Replace with the path to your image
            alt="Hero Image"
            quality={100}
            width={600}
            height={700}
          />
        </div>
      </div>
    </section>
  )
}
