import Image from "next/image"
import Link from "next/link"
import { FaTelegram } from "react-icons/fa"

export default function Hero() {
  return (
    // Apply the CSS module class here
    <section className="bg-cover bg-center bg-no-repeat text-white py-4 rounded-md h-80"
        style={{
        backgroundImage: "url('/images/Gallery/codefest.jpg')"
        }}
    >
      <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center p-4  sm:-ml-32">
        <div className="mt-8 lg:w-1/2 text-center lg:text-left lg:pr-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 sm:-ml-4">Welcome To The <br/> <span className="sm:-ml-12">Land of ACES</span></h1>
           <Link href="https://t.me/+DLdm_86B3lc5YzFk">
          <button className="bg-blue-600 text-white px-6 py-2 sm:-ml-40 rounded-full font-bold lg:w-max w-1/2 hover:bg-white hover:text-indigo-600 transition duration-300">
            <FaTelegram size={30} className="inline-block"/>
            <span>Explore</span>
          </button>
          </Link>
        </div>
      </div>
    </section>
  )
}

