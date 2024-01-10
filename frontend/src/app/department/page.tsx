import { Metadata } from "next";
import Header from "../ui/header";
import ExecutivesList from "../ui/executives/card";
import Footer from "../ui/footer";

export const metadata: Metadata = {
  title: "Department Offficials",
};

const executivesData = [
  {
    name: "Prof. Emmanuel k. Akowuah",
    position: "Head of Department",
    imageUrl: "/department/Hod.jpg",
    profileUrl:
      "https://webapps.knust.edu.gh/staff/dirsearch/profile/summary/525c5345ba0b.html",
  },
  {
    name: "Dr. Henry Nunoo-Mensah",
    position: "ACES Patron/Exams Officer",
    imageUrl: "/department/Nunoo.jpg",
    profileUrl:
      "https://webapps.knust.edu.gh/staff/dirsearch/profile/summary/da258450ae33.html",
  },
];

export default function page() {
  return (
    <div>
      <Header />
      <h1 className="lg:text-5xl text-3xl font-bold -mb-20 py-16 text-center mt-8">
        Department <span className="text-blue-600">Officials</span>
      </h1>
      <ExecutivesList executives={executivesData} />
      <Footer />
    </div>
  );
}
