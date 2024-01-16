import About from "./ui/home/about";
import BlogCard from "./ui/blog/blog-card";
import Footer from "./ui/footer";
import Header from "./ui/header";
import Hero from "./ui/home/hero";
import CarouselCard from "./ui/home/event-card";
import StudentTestimonial from "./ui/home/testimonial";
import BotSection from "./ui/home/bot-section";

export default function page() {
  return (
    <main>
      <Header />
      <div className="py-16">
        <Hero />
        <About />
        <BotSection />
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-bold -mb-4 mt-4 text-center p-2">
            Get Ready For <span className="text-blue-600">Exciting</span> ACES
            <span className="text-blue-600"> Events</span>⌛
          </h2>
          {/* carousel */}
          <div className="container p-8">
            <CarouselCard />
          </div>
        </div>
        {/* <div className="flex flex-col items-center">
          <h2 className="container text-3xl font-bold mb-0 text-center">
            Latest <span className="text-blue-600">Blog</span> & Stories
          </h2>
        </div>
        <div className="flex flex-wrap justify-between">
          <BlogCard />
          <BlogCard />
          <BlogCard />
        </div> */}
      {/* <StudentTestimonial
        text="I love computer engineering because it is a very practical course. It is a course that is very relevant in our world today. I love the fact that I can build things with my hands and also be able to code. I love the fact that I can build things with my hands and also be able to code. I love the fact that I can build things with my hands and also be able to code. I love the fact that I can build things with my hands and also be able to code. I love the fact that I can build things with my hands and also be able to code. I love the fact that I can build things with my hands and also be able to code. I love the fact that I can build things with my hands and also be able to code. I love the fact that I can build things with my hands and also be able to code."
        name="Kwame Adu"
        imageSrc="/executives/department/Hod.jpg"
        year="2023"
        /> */}
      </div>
      <Footer />
    </main>
  );
}