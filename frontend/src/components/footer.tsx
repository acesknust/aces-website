import { FaInstagram, FaLinkedin, FaLocationArrow } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-blue-950 text-white pt-8 pb-0">
      <div className="container mx-auto px-6">
        <div className="border-b border-gray-600 pb-4 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center">
            <div className="mr-3">
              <img src="/images/logo-white.png" alt="ACES Logo" className="h-14 w-14 object-contain" />
            </div>
            <div>
              <div className="font-semibold leading-tight">Association of Computer<br />Engineering Students</div>
            </div>
          </div>
          <div className="hidden lg:flex flex-col md:items-end min-w-[60px]">
            <div className="flex space-x-3 mb-2">
              <Link href="https://www.linkedin.com/company/aces-knust/" className="hover:text-gray-300"><FaLinkedin size={25} /></Link>
              <Link href="https://www.instagram.com/aces_knust/" className="hover:text-gray-300"><FaInstagram size={25} /></Link>
              <Link href="https://x.com/aces_knust" className="hover:text-gray-300"><FaSquareXTwitter size={25} /></Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row justify-between items-start py-4">
          <div className="mb-8 lg:mb-0 lg:w-1/4 min-w-[220px]">

            <div>
              <div className="font-bold">Department Office</div>
              <div className="text-gray-300 text-sm leading-tight">KNUST-CoE,<br />Vodafone Building - Ground Floor</div>
            </div>
            <Link href="/gallery" className="mt-4 flex items-center text-sm cursor-pointer hover:text-blue-400">
              <FaLocationArrow className="mr-2" />
              <span className="font-semibold">ACES Gallery</span>
            </Link>
          </div>

          {/* Middle: Get Started, Support, Newsletter */}
          <div className="flex flex-1 flex-col sm:flex-row justify-between w-full lg:w-3/4 gap-8">
            <div>
              <div className="font-bold mb-1">Get Started</div>
              <div className="text-sm text-gray-300">Executives<br />Events<br />Staff</div>
            </div>
            <div>
              <div className="font-bold mb-1">Support</div>
              <div className="text-sm text-gray-300">Internship Application<br />Sponsors<br />Help Desk</div>
            </div>
            <div className="min-w-[220px]">
              <div className="font-bold mb-1">Newsletter</div>
              <div className="text-sm text-gray-300 mb-2">Get exclusive news concerning ACES by signing up to our Newsletter</div>
              <form className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded py-2 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Social Icons for mobile */}
        <div className="flex lg:hidden justify-center mt-4 mb-2">
          <div className="flex space-x-3">
            <Link href="https://www.linkedin.com/company/aces-knust/" className="hover:text-gray-300"><FaLinkedin size={25} /></Link>
            <Link href="https://www.instagram.com/aces_knust/" className="hover:text-gray-300"><FaInstagram size={25} /></Link>
            <Link href="https://x.com/aces_knust" className="hover:text-gray-300"><FaSquareXTwitter size={25} /></Link>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-4 py-4 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <div className="mb-2 md:mb-0 flex items-center gap-2">
            <span>Technology For Our Age</span>
            <span className="text-lg">©</span>
            <span>2025</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white">Terms and Conditions</Link>
            <Link href="#" className="hover:text-white">Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
