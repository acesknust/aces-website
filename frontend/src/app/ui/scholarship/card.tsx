import Image from 'next/image'
import Link from 'next/link'
import { BiSolidRightArrowCircle } from 'react-icons/bi'

export default function Card() {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start rounded-lg overflow-hidden bg-white shadow-md p-6 mb-8">
      {/* Image on the left (or above on mobile) */}
      <div className="md:w-1/3 mb-4 md:mb-0 md:mr-6 md:order-1">
        <Image 
        src="/images/mtn.jpg"
        alt="Scholarship Image"
        width={400} 
        height={300} />
      </div>

      {/* Title, Details, and Apply Link on the right (or below on mobile) */}
      <div className="md:w-2/3 md:order-2">
        <h2 className="text-2xl font-bold mb-4">Ketewa Biara Nsua (KBN) Scholarship</h2>
        <p className="text-gray-700 mb-4">Schorlaship contents an requirements. Sure, if 
        you have any more questions.</p>
        <Link href=""
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Apply here <BiSolidRightArrowCircle className="inline-block" />
        </Link>
      </div>
    </div>
  )
}
