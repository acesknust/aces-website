import { Metadata } from "next";
import Header from "../ui/header";
import BlogCard from "../ui/blog/blog-card";
import { BiPencil, BiSearch } from "react-icons/bi";
import { BsPencilSquare } from "react-icons/bs";
import Footer from "../ui/footer";

export const metadata: Metadata = {
  title: "Blog",
};

export default function page() {
  return (
    <div>
      <Header />
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="lg:text-5xl text-3xl font-bold -mb-10 py-16">
            ACES <span className="text-blue-600">Blog</span>
          </h1>
          <p className="text-gray-600 mb-4 ml-3 mr-3">
            Read the latest blog posts and stories from the ACES community. Stay
            up to date with the latest news and articles
          </p>
        </div>
        <div className="flex flex-col lg:flex-row justify-center gap-4 items-center -mb-5">
          {/* search blog  */}
          <div className="flex flex-col items-center">
            <div className="flex items-center border-b border-blue-500 py-2">
              <input
                className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                type="text"
                placeholder="Search Blog"
                aria-label="Full name"
              />
              <BiSearch size={24} />
            </div>
          </div>
          {/* write blog button with icon */}
          <div className="">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              type="button"
            >
              <BsPencilSquare size={35} className="inline-block p-2" />
              Write Blog
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-between">
        <BlogCard />
        <BlogCard />
        <BlogCard />
        <BlogCard />
        <BlogCard />
        <BlogCard />
      </div>
      <Footer />
    </div>
  );
}
