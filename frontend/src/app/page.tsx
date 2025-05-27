
import About from "./ui/home/about";
import Footer from "./ui/footer";
import Header from "./ui/header";
import Hero from "./ui/home/hero";
import Gallery_home from "./ui/home/gallery_home";
import Student_Testimonial from "./ui/home/student_testimonial";
import Clubs from "./ui/home/club";
import HomeEvents from "./ui/home/home_events";

export default function page() {
  return (
    <main>
      <Header />
      <div className="py-16">
        <Hero />
        <Gallery_home/>
        <Student_Testimonial/>
        <Clubs/>
        <HomeEvents/>
      </div>
      <Footer/>
    </main>
  );
}