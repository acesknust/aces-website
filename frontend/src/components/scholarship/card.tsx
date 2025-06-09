'use client'
import Image from 'next/image'
import Link from 'next/link'
import { BiSolidRightArrowCircle } from 'react-icons/bi'
import { getScholarships } from '../../app/api/scholarship'
import { useEffect, useState } from 'react'
import Scholarship from '@/app/scholarships/page'
import { CardSkeletons } from '../skeletons'

interface Scholarship {
  id: number;
  name: string;
  description: string;
  link: string;
  image: string;
}

export default function Card() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScholarships().then((res) => {
      setScholarships(res?.data);
      setLoading(false);
      // console.log(res?.data);
    });
  }, []);

  if (loading === false && scholarships.length === 0) {
    return (
      <div>
        <p className="lg:text-5xl text-3xl text-gray-400 text-center h-screen">No scholarships data yet</p>
      </div>
    );
  }
  return (
    <div>
      {loading ? (
        <CardSkeletons />
      ) : (
        <div>
          {scholarships.map((scholarship) => (
            <div
              key={scholarship.id}
              className="flex flex-col md:flex-row items-center md:items-start rounded-lg overflow-hidden bg-white shadow-md p-6 mb-8"
            >
              {/* Image on the left (or above on mobile) */}
              <div className="md:w-1/3 mb-4 md:mb-0 md:mr-6 md:order-1">
                <Image
                  src={scholarship.image}
                  alt={scholarship.name + ' image'}
                  width={400}
                  height={300}
                />
              </div>

              {/* Title, Details, and Apply Link on the right (or below on mobile) */}
              <div className="container md:w-2/3 md:order-2">
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
      )}
    </div>
  );
}
