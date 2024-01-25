import { FaFacebook, FaFax, FaInstagram, FaLinkedin, FaLocationArrow, FaYoutube } from 'react-icons/fa';
import { FaLocationCrosshairs, FaSquareXTwitter, FaY } from "react-icons/fa6";
import Link from 'next/link';
import { BiMailSend, BiPhone } from 'react-icons/bi';

const Footer = () => {
  return (
    <footer className="bg-blue-950 text-white py-8">
      <div className="container px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">ACES-KNUST</h2>
          <p className="text-gray-400">Explore, Learn, and Connect with Us.</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Connect with Us</h2>
          <div className="flex space-x-4">
            <Link href="#" className="hover:text-gray-300">
              <FaFacebook size={24} />
            </Link>
            <Link href="#" className="hover:text-gray-300">
              <FaSquareXTwitter size={24} />
            </Link>
            <Link href="#" className="hover:text-gray-300">
              <FaInstagram size={24} />
            </Link>
            <Link href="#" className="hover:text-gray-300">
              <FaLinkedin size={24} />
            </Link>
            <Link href="#" className="hover:text-gray-300">
              <FaYoutube size={24} />
            </Link>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
          <ul className="flex flex-col space-y-2">
            <li>
              <Link href="#" className="hover:text-gray-300">Home</Link>
            </li>
            {/* <li>
              <Link href="#" className="hover:text-gray-300">About</Link>
            </li> */}
            <li>
              <Link href="#" className="hover:text-gray-300">Blog</Link>
            </li>
            <li>
              <Link href="#" className="hover:text-gray-300">Gallery</Link>
            </li>
            <li>
              <Link href="#" className="hover:text-gray-300">Scholarships</Link>
            </li>
            <li>
              <Link href="#" className="hover:text-gray-300">Executives</Link>
            </li>
            <li>
              <Link href="#" className="hover:text-gray-300">Department Officials</Link>
            </li>
            <li>
              <Link href="#" className="hover:text-gray-300">Upcoming Events</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Contacts</h2>
          <p className="text-gray-300"><FaLocationCrosshairs className="inline-block"/> Faculty of Electrical and Computer Engineering, KNUST</p>
          <p className="text-gray-300"><BiMailSend className="inline-block"/> aces.knust.edu.gh@gmail.com</p>
          <p className="text-gray-300"><BiPhone className="inline-block"/> +233 456 7890</p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">
          &copy; 2023 ACES-KNUST. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
