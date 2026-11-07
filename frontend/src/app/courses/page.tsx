import { Metadata } from "next";
import Footer from "@/components/footer";
import Header from "@/components/header";
import CoursesCard from "@/components/courses/card";

export const metadata: Metadata = {
  title: 'Course Materials | ACES-KNUST',
  description: 'Download lecture slides, past questions, and study materials for Computer Engineering courses at KNUST.',
  keywords: ['courses', 'academic resources', 'study materials', 'past questions', 'lecture slides', 'KNUST', 'computer engineering'],
};

export default function Courses() {
  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
        <div className="container mx-auto py-12 md:py-16">
          <div className="text-center mb-2 px-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Course <span className="text-blue-600">Materials</span>
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto text-base">
              Access comprehensive course materials, resources, and study guides for your academic program.
            </p>
          </div>
          <CoursesCard />
        </div>
      </div>
      <Footer />
    </div>
  );
}