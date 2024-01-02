'use client'
import Image from 'next/image'
import Link from 'next/link'
import { BiSolidRightArrowCircle } from 'react-icons/bi'
import { getScholarships } from '../../../../api/scholarship'
import { useEffect, useState } from 'react'
import Scholarship from '@/app/scholarships/page'

// interface ScholarshipResponse {
//   data: Scholarship[];
// }
interface Scholarship {
  id: number;
  name: string;
  description: string;
  link: string;
  image: File;  
}

export default function Card() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);

  useEffect(() => {
    getScholarships().then((res) => {
      setScholarships(res?.data);
      // console.log(res?.data);
    });
  }, []);

  if (!scholarships || scholarships.length === 0) {
    return <p className="mt-4 text-gray-400 text-center text-3xl">No Scholarship data available.</p>;
  }

  return (
    <div>
      {scholarships.map((scholarship) => (
        <div
          key={scholarship.id}
          className="flex flex-col md:flex-row items-center md:items-start rounded-lg overflow-hidden bg-white shadow-md p-6 mb-8"
        >
          {/* Image on the left (or above on mobile) */}
          <div className="md:w-1/3 mb-4 md:mb-0 md:mr-6 md:order-1">
            <Image
              src="/images/mtn.jpg"
              alt="Scholarship Image"
              width={400}
              height={300}
            />
          </div>

          {/* Title, Details, and Apply Link on the right (or below on mobile) */}
          <div className="md:w-2/3 md:order-2">
            <h2 className="text-2xl font-bold mb-4">{scholarship.name}</h2>
            <p className="text-gray-700 mb-4">{scholarship.description}</p>
            <Link
              href={scholarship.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Apply here <BiSolidRightArrowCircle className="inline-block" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
