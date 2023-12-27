import Image from "next/image"
import Link from "next/link"
import { BiArrowFromLeft, BiArrowFromRight } from "react-icons/bi"
import { FaArrowRight } from "react-icons/fa"

export default function About() {
  return (
    <section className="py-12 p-3 flex flex-col items-center">
      <div className="containermx-auto flex flex-col lg:flex-row items-center p-3">
        {/* Text Content */}
        <div className="lg:w-1/2 lg:pr-10">
          <h2 className="lg:text-4xl text-3xl font-bold mb-4"><span className="text-blue-600">Technology</span> For Our Age</h2>
          <p className="text-lg mb-6">
            A hub of innovation, where cutting-edge technologies meet academic rigor. We pride ourselves on fostering a dynamic learning environment
          </p>

          {/* View Gallery Link */}
          <a href="/gallery" className="text-primary font-bold hover:underline hover:text-blue-600">
            View Gallery <FaArrowRight className="inline" />
          </a>
        </div>

        {/* Image Cards */}
        <div>
          {/* Card 1 */}
          <div className="flex flex-col items-center p-4">
          <Link href="/gallery">
          <div className="group">
            <Image
              src="/images/trip.jpg" // trip image
              alt="Image 1"
              width={400}
              height={50}
              quality={100}
              className="rounded-lg group-hover:scale-[1.03] transition duration-300"
              />
          </div>
          </Link>
          <p className="text-center mt-2 text-xl ">Field Trip Diaries</p>
              </div>

          {/* Card 2 */}
          <div className="flex flex-col items-center p-4">
          <Link href="/gallery">
          <div className="group">
            <Image
              src="/images/codefest.jpg" // coefest image
              alt="Image 1"
                width={400}
                height={450}
                quality={100}
              className="rounded-lg group-hover:scale-[1.03] transition duration-300"
              />
          </div>
          </Link>
          <p className="text-center mt-2 text-xl">CODEFEST</p>
              </div>
        </div>
      </div>
    </section>
  )
}
