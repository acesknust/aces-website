import Image from "next/image"
import Link from "next/link"
import { BiArrowFromLeft, BiArrowFromRight } from "react-icons/bi"
import { FaArrowRight } from "react-icons/fa"

export default function About() {
  return (
    <section className="py-12 p-3 flex flex-col items-center -mb-4">
      <div className="container flex flex-col p-3">
        {/* Text Content */}
        <div className=" lg:pr-10 text-left">
          <h2 className="lg:text-4xl text-3xl font-bold mb-4"><span className="text-blue-600">Technology</span> For Our Age</h2>
          <p className="text-lg mb-6">
            A hub of innovation, where cutting-edge technologies meet academic rigor. We pride ourselves on fostering a dynamic learning environment that encourages creativity
            an collaboration. Together, we are shaping the future by seamlessly integrating innovation and education, 
            preparing our students to thrive in the ever-evolving landscape of technology and discovery.
          </p>

          {/* View Gallery Link */}
          <a href="/gallery" className="text-primary font-bold hover:underline hover:text-blue-600">
            View Gallery <FaArrowRight className="inline" />
          </a>
        </div>

        {/* Image Cards */}
        <div
        className="flex flex-col lg:flex-row items-center justify-center gap-4 mt-8"
        >
          {/* Card 1 */}
          <div className="flex flex-col items-center p-4">
          <Link href="/gallery">
          <div className="group">
            <Image
              src="/images/trip1.jpg" // trip image
              alt="Image 1"
              width={450}
              height={50}
              quality={100}
              className="rounded-lg group-hover:scale-[1.03] transition duration-300 lg:h-80"
              />
          </div>
          </Link>
          <p className="text-center mt-2 text-xl font-semibold ">Field Trip Diaries</p>
              </div>

          {/* Card 2 */}
          <div className="flex flex-col items-center p-4">
          <Link href="/gallery">
          <div className="group">
            <Image
              src="/images/codefest.jpg" // coefest image
              alt="Image 1"
                width={450}
                height={450}
                quality={100}
              className="rounded-lg group-hover:scale-[1.03] transition duration-300 lg:h-80"
              />
          </div>
          </Link>
          <p className="text-center mt-2 text-xl font-semibold">CODEFEST</p>
              </div>
        </div>
      </div>
    </section>
  )
}
