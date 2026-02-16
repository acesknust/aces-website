import { Metadata } from "next";
import Footer from "@/components/footer";
import Header from "@/components/header";
import CoursesCard from "@/components/courses/card";

export const metadata: Metadata = {
  title: 'Courses',
  description: 'Explore comprehensive course materials and resources for your academic program.',
  keywords: ['courses', 'academic resources', 'study materials', 'curriculum', 'education'],
};

export default function Courses() {
  return (
    <div>
      <Header />
      <div className="container mx-auto py-16">
        <div className='text-center ml-3 mr-3 -mb-8 -mt-8'>
          <h1 className="lg:text-5xl text-3xl font-bold -mb-10 py-16">
            Course <span className="text-blue-600">Materials</span>
          </h1>
          <p className='text-gray-600 mb-16'>
            Access comprehensive course materials, resources, and study guides for your academic program. 
            Download lecture notes, assignments, and additional learning resources to enhance your studies.
          </p>
        </div>
        <CoursesCard />
      </div>
      <Footer />
    </div>
  );
}