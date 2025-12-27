import Image from "next/image"
import { BiCalendarEdit, BiCategoryAlt } from "react-icons/bi";
import BlogContent from "./blog-content";


export default function BlogDetail() {
  return (
    <div className="py-16">
      <section className="flex justify-center items-center py-16">
        <div className="container mx-auto px-4">
          <article className="">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-center mb-4">
                Sample Blog Title Which I Hope It Works Else Hmm Sample Blog
                Title Which I Hope It Works Else Hmm
              </h1>
              <ul className="flex items-center justify-center mb-8">
                <li className="mx-3">
                  <a
                    href="#"
                    className="flex items-center flex-wrap font-medium"
                  >
                    <Image
                      src="/images/image.jpg" // Replace with your actual image path
                      alt="author photo"
                      height={50}
                      width={50}
                      className="mr-2 h-6 w-6 rounded-full"
                    />
                    <span>simonatiegar</span>
                  </a>
                </li>
                <li className="mx-3 flex items-center flex-wrap font-medium">
                  <BiCalendarEdit className="mr-1 h-5 w-5 text-gray-600" />
                  20th Nov 2023
                </li>
                <li className="mx-3 flex items-center flex-wrap">
                  <BiCategoryAlt className="mr-1 h-[18px] w-[18px] text-gray-600" />
                  <>
                    <ul>
                      <li className="inline-block">
                        <a
                          href="#"
                          className="mr-2 hover:text-primary font-medium"
                        >
                          Some Category
                        </a>
                      </li>
                    </ul>
                  </>
                </li>
              </ul>
            </div>

            <div className="mb-8 flex justify-center items-center">
              <div>
                <Image
                  src="/images/image.jpg" // Replace with your actual image path
                  height={500}
                  width={1000}
                  alt="blog image"
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="md:col-span-10">
              <div className="content mb-16 text-center">
                <BlogContent />
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
