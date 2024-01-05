import About from "./ui/home/about";
import BlogCard from "./ui/blog/blog-card";
import Footer from "./ui/footer";
import Header from "./ui/header";
import Hero from "./ui/home/hero";
import CarouselCard from "./ui/home/event-card";
// import StudentTestimonial from "./ui/home/testimonial";

export default function page() {
  return (
    <main>
      <Header />
      <div className="py-16">
        <Hero />
        <About />
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-bold -mb-4 -mt-4 text-center p-2">
            Get Ready For  <span className="text-blue-600">Exciting</span> ACES
            <span className="text-blue-600"> Events</span>⌛
          </h2>
          {/* carousel */}
          <div className="container p-8">
            <CarouselCard />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="container text-3xl font-bold mb-0 text-center">
            Latest <span className="text-blue-600">Blog</span> & Stories
          </h2>
        </div>
        <div className="flex flex-wrap justify-between">
          <BlogCard />
          <BlogCard />
          <BlogCard />
        </div>

      </div>
      <Footer />
    </main>
  );
}

