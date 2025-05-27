import Image from "next/image"
import Link from "next/link"
import { FaTelegram } from "react-icons/fa"

export default function Hero() {
  return (
    // Apply the CSS module class here
<section className="relative w-full h-[100vh] bg-cover bg-center bg-no-repeat text-white"
  style={{ backgroundImage: "url('/images/Gallery/homeImage.png')" }}
>
  {/* Dark overlay */}
  <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>

  {/* Content stays above the overlay */}
  <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4 lg:-ml-[50rem] sm:-ml-80">
    <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">
      Welcome To The <br /> <span className="lg:-ml-12 sm:-ml-10">Land of ACES</span>
    </h1>

    <Link href="https://t.me/+DLdm_86B3lc5YzFk">
      <button className="bg-blue-600 text-white px-6 py-3 lg:-ml-60 sm:-ml-32 rounded-full font-bold hover:bg-white hover:text-blue-600 transition duration-300">
            <FaTelegram size={30} className="inline-block"/>
            <span>Explore</span>
      </button>
    </Link>
  </div>
</section>
  )
}

