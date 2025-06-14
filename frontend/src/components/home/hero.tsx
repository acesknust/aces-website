import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative w-full h-screen bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: "url('/images/Gallery/homeImage.png')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>

      <div className="relative z-10 flex flex-col justify-center items-center md:items-start h-full px-4">
        <div className="flex flex-col items-center md:items-start lg:px-16">
          <h1 className="text-4xl lg:text-7xl font-bold mb-4 text-center md:text-left">
            Welcome To The <br /> Land of ACES
          </h1>

          <Link href="/about">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600/80 transition duration-300">
              Explore
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
 