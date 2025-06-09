'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { BiMenu, BiX } from 'react-icons/bi';
import Image from 'next/image';
import { usePathname } from "next/navigation"
import { motion } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const menu = [
    {
      label: 'Home',
      href: '/',
      isActive: pathname === '/'
    },
    {
      label: 'About',
      href: '###',
      isActive: pathname === '/about'
    },
    {
      label: 'Executives',
      href: '/executives',
      isActive: pathname === '/executives'
    },
    {
      label: 'Courses',
      href: '/courses',
      isActive: pathname === '/courses'
    },
    {
      label: 'Staff',
      href: '/department',
      isActive: pathname === '/department'
    },
    {
      label: 'Internships',
      href: '###',
      isActive: pathname === '/internships'
    },
    {
      label: 'Gallery',
      href: '/gallery',
      isActive: pathname === '/gallery'
    },
    {
      label: 'Scholarships',
      href: '/scholarships',
      isActive: pathname === '/scholarships'
    }
  ]

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white text-blue-950 py-2 fixed top-0 left-0 w-full z-50 ">
      <div className="container mx-auto flex justify-between items-center">
        <div className="p-2 lg:ml-4 sm:-ml-10 ">
          <Link href="/">
            <div className='flex items-center'>
              <Image
                src="/images/aceslogo.png"
                alt='logo'
                width={40}
                height={30}
                className='mr-2'
              />
              <span className='text-blue-950 text-xs md:text-sm'>
                Association of Computer <br /> Engineering Students
              </span>
            </div>
          </Link>
        </div>


        {/* Mobile Menu Icon */}
        <div className="md:hidden p-2 mr-4 ">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none focus:text-white"
          >
            {isMenuOpen ? <BiX size={24} className='text-blue-950' /> : <BiMenu size={24} className='text-blue-950 ' />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-4 mr-10 text-sm text-blue-600">
          {menu.map((item, index) => (
            <Link href={item.href} key={index} className={`relative hover:text-blue-950 transition duration-300 ${item.isActive ? 'text-blue-950' : ''}`}>
              {item.label}
              {pathname === item.href && (
                <motion.div
                  layoutId="underline"
                  className="w-full absolute left-0 right-0 h-0.5 rounded-full bg-blue-950 -bottom-2"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-white p-4 flex flex-col items-left">
            {menu.map((item, index) => (
              <Link href={item.href} key={index} className={`relative text-blue-600 py-2 transition duration-300 ${item.isActive ? 'text-blue-950' : ''}`}>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
