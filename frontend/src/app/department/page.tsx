import { Metadata } from "next";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Department Officials",
};

const executivesData = [
  {
    name: "Prof. Emmanuel K. Akowuah",
    position: "Head of Department",
    imageUrl:
      "https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508749/Hod_mbewh4.jpg",
  },
  {
    name: "Dr. Henry Nunoo-Mensah",
    position: "ACES Patron/Exams Officer",
    imageUrl:
      "https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508751/Nunoo_b3bwzb.jpg",
  },
];

export default function Page() {
  return (
    <div>
      <Header />
      <h1 className="lg:text-5xl text-3xl font-bold -mb-20 py-16 text-center mt-8">
        Department <span className="text-blue-600">Officials</span>
      </h1>

      {/* Officials Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 lg:ml-[25rem] mt-24 mb-16 w-full max-w-6xl mx-auto text-center">
        {executivesData.map((exec, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Full-width image */}
            <div className="relative w-full h-[400px]">
              <Image
                src={exec.imageUrl}
                alt={exec.name}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>

            {/* Text info */}
            <div className="p-6 text-center">
              <h2 className="text-xl font-semibold">{exec.name}</h2>
              <p className="text-gray-600">{exec.position}</p>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
