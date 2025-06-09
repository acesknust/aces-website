import { Metadata } from "next";
import Footer from "../../components/footer";
import Header from "../../components/header";
import Card from "../../components/scholarship/card";


export const metadata: Metadata = {
  title: 'Scholarships',
};


export default function Scholarship() {
  return (
    <div>
      <Header />
      <div className="container mx-auto py-16">
        <div className='text-center ml-3 mr-3 -mb-8 -mt-8'>
          <h1 className="lg:text-5xl text-3xl font-bold -mb-10 py-16">
            Schorlaship <span className="text-blue-600">Opportunities</span>
          </h1>
          <p className='text-gray-600 mb-16'>Explore various scholarships available and apply. Make sure to read eligibility
            criteria before applying and provide the neccessary documents.
          </p>
        </div>
        <Card />
      </div>
      <Footer />
    </div>
  );
}