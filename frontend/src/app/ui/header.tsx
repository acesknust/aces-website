'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { BiMenu, BiX } from 'react-icons/bi';
import Image from 'next/image';


const Header = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-blue-950 text-white py-4 fixed top-0 left-0 w-full z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-light p-2 ml-4">
          <Link href="/">
            <div className='flex items-center'>
            <Image 
            src="/images/aceslogo.png"
            alt='logo'
            width={40}
            height={30}
            className='mr-2 rounded-full'
            />
            ACES-KNUST
            </div>
            </Link>
        </div>
      

        {/* Mobile Menu Icon */}
        <div className="lg:hidden p-2 mr-4">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none focus:text-white"
          >
            {isMenuOpen ? <BiX size={24} /> : <BiMenu size={24} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-4">
          <Link href="/" className="hover:text-gray-300 hover:border-b-2 hover:border-white">
            Home
          </Link>
          <Link href="/gallery" className="hover:text-gray-300 hover:border-b-2 hover:border-white">
            Gallery
          </Link>
          {/* <Link href="/blog" className="hover:text-gray-300 hover:border-b-2 hover:border-white">
            Blog
          </Link> */}
          <Link href="/scholarships" className="hover:text-gray-300 hover:border-b-2 hover:border-white">
            Scholarships
          </Link>
          <Link href="/executives" className="hover:text-gray-300 hover:border-b-2 hover:border-white">
            Executives
          </Link>
          <Link href="/department" className="hover:text-gray-300 hover:border-b-2 hover:border-white">
            Dep. Officials
          </Link>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-blue-950 p-4 flex flex-col items-left">
            <Link href="/" className="hover:text-gray-300 p-2">
              Home
            </Link>
            <Link href="/gallery" className="hover:text-gray-300 p-2">
              Gallery
            </Link>
            {/* <Link href="/blog" className="hover:text-gray-300 p-2">
              Blog
            </Link> */}
            <Link href="/scholarships" className="hover:text-gray-300 p-2">
              Scholarships
            </Link>
            <Link href="/executives" className="hover:text-gray-300 p-2">
              Executives
            </Link>
            <Link href="/department" className="hover:text-gray-300 p-2">
              Department Officials
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
