// 'use client';
import Image from 'next/image';
import { BiCalendarEdit, BiCategoryAlt } from 'react-icons/bi';
import Link from 'next/link';

export default function BlogCard() {
  return (
    <div className="p-6 bg-white w-full sm:w-4/12">

        <a href="" className="block hover:text-primary overflow-hidden group">
          <Image
            className="rounded-lg group-hover:scale-[1.03] transition duration-300"
            src="/images/image.jpg"
            alt="Sample Post Title"
            width={550}
            height={250}
            />
        </a>
      <ul className="mt-6 mb-4 flex flex-wrap items-center text-text">
        <li className="mr-5">
              <a
                href=""
                className="flex items-center hover:text-primary font-medium"
                >
                  <Image
                    src="/images/image.jpg"
                    alt="Author photo"
                    height={50}
                    width={50}
                    className="mr-2 h-6 w-6 rounded-full"
                    />
          
                <span>simonatiegar</span>
              </a>
        </li>
        <li className="mr-5 flex items-center flex-wrap font-medium text-gray-500">
          <BiCalendarEdit className="mr-1 h-5 w-5 text-gray-600" />
          <>20th Nov 2023</>
        </li>
        <li className="mr-5 flex items-center flex-wrap">
          <BiCategoryAlt className="mr-1 h-[18px] w-[18px] text-gray-600" />
          <>
            <ul>
                <li className="inline-block">
                  <a href="" className="mr-2 hover:text-primary font-medium text-gray-500">
                    Sample Category
                  </a>
                </li>
    
            </ul>
          </>
        </li>
      </ul>
      <h3 className="mb-4">
        <a href="/post" className="block hover:text-primary transition duration-300 text-2xl font-bold hover:underline hover:text-blue-600">
          Sample Blog Title Which I Hope It Works Else Hmm Sample Blog Title Which I Hope It Works Else Hmm
        </a>
      </h3>
      <p className="text-gray-600">
      This example assumes you have set up a Next.js project with Tailwind CSS. 
      The Card component is a simple card with an image, title, description, and a button. You can customize 
      the content, styles, and structure according to your needs.
      </p>
    </div>

  )
}
