import Footer from "@/components/footer";
import Header from "@/components/header";
import Hero from "@/components/home/hero";
import Gallery from "@/components/home/gallery";
import StudentTestimonial from "@/components/home/student-testimonial";
import Clubs from "@/components/home/club";
import HomeEvents from "@/components/home/home-events";

export default function page() {
  return (
    <main>
      <Header />
      <div>
        <Hero />
        <Gallery />
        <StudentTestimonial />
        <Clubs />
        <HomeEvents />
      </div>
      <Footer />
    </main>
  );
}