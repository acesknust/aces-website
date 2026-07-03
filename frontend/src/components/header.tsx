'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BiMenu, BiX, BiShoppingBag } from 'react-icons/bi';
import Image from 'next/image';
import { usePathname } from "next/navigation"
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';

const Header = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const menu = [
    {
      label: 'Home',
      href: '/',
      isActive: pathname === '/'
    },
    {
      label: 'About',
      href: '/about',
      isActive: pathname === '/about'
    },
    {
      label: 'Executives',
      href: '/executives',
      isActive: pathname === '/executives'
    },

    {
      label: 'Staff',
      href: '/department',
      isActive: pathname === '/department'
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
    },
    {
      label: 'Courses',
      href: '/courses',
      isActive: pathname === '/courses'
    },
    {
      label: 'Shop',
      href: '/shop',
      isActive: pathname?.startsWith('/shop')
    },
    {
      label: 'Marketplace',
      href: '/marketplace',
      isActive: pathname?.startsWith('/marketplace') || pathname?.startsWith('/vendor') || pathname === '/login' || pathname === '/register',
      subMenu: [
        { label: 'Browse Products', href: '/marketplace' },
        { label: 'Register', href: '/register' },
        { label: 'Login', href: '/login' },
        { label: 'Vendor Dashboard', href: '/vendor-dashboard' },
      ],
    }
  ]

  const [mobileSubOpen, setMobileSubOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    const dismissed = localStorage.getItem('codefest-banner-dismissed');
    if (!dismissed) setBannerDismissed(false);
  }, []);

  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem('codefest-banner-dismissed', 'true');
  };

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <>
    <style jsx global>{`
      @keyframes gradient-spin {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .marketplace-glow {
        background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #3b82f6);
        background-size: 300% 300%;
        animation: gradient-spin 3s ease infinite;
      }
      @keyframes banner-shimmer {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .codefest-banner {
        background: linear-gradient(90deg, #1e3a8a, #6d28d9, #7c3aed, #1e3a8a);
        background-size: 200% 200%;
        animation: banner-shimmer 4s ease infinite;
      }
    `}</style>

    {/* CODEFEST Announcement Banner */}
    {!bannerDismissed && (
      <div className="codefest-banner fixed top-0 left-0 w-full z-[60] text-white">
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-sm relative">
          <span className="hidden sm:inline">🔥</span>
          <span className="font-medium text-center">
            <span className="font-bold">CODEFEST</span> is here! Register for the coding challenges
          </span>
          <a
            href="https://forms.gle/p5789Kabjyah6wq59"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-xs px-4 py-1.5 rounded-full transition-colors whitespace-nowrap shadow-sm"
          >
            Register Now →
          </a>
          <button
            onClick={dismissBanner}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1"
            aria-label="Dismiss banner"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
    )}

    <header className={`bg-white text-blue-950 py-2 fixed left-0 w-full z-50 transition-all duration-300 ${!bannerDismissed ? 'top-[44px]' : 'top-0'}`}>
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
              <span className='text-blue-950 text-sm font-semibold leading-tight'>
                Association of Computer <br /> Engineering Students
              </span>
            </div>
          </Link>
        </div>


        {/* Mobile Navigation Controls */}
        <div className="flex items-center lg:hidden">
          {/* Mobile Cart Icon - Always Visible */}
          <Link href="/shop/cart" className="relative p-2 mr-2 text-blue-950 hover:text-blue-700 transition-colors">
            <BiShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="p-2 text-blue-950 focus:outline-none"
          >
            {isMenuOpen ? <BiX size={28} /> : <BiMenu size={28} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-4 mr-10 text-sm text-blue-600">
          {menu.map((item, index) => (
            item.subMenu ? (
              <div key={index} className="relative group">
                <Link href={item.href} className="relative flex items-center gap-1">
                  {/* Animated gradient border pill */}
                  <span className="relative inline-flex items-center gap-0.5">
                    <span className="absolute -inset-[2px] rounded-full marketplace-glow opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span className={`relative bg-white px-3 py-1 rounded-full font-semibold text-sm transition-colors ${
                      item.isActive ? 'text-blue-950' : 'text-blue-600 group-hover:text-blue-950'
                    }`}>
                      {item.label}
                    </span>
                    <svg className="w-3 h-3 mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </Link>
                {/* Dropdown */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[180px]">
                    {item.subMenu.map((sub, si) => (
                      <Link key={si} href={sub.href}
                        className={`block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                          pathname === sub.href ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-gray-600'
                        }`}>
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
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
            )
          ))}
          <Link href="/shop/cart" className="relative hover:text-blue-950 transition duration-300">
            <BiShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-white p-4 flex flex-col shadow-lg border-t border-gray-100">
            {menu.map((item, index) => (
              item.subMenu ? (
                <div key={index}>
                  <button
                    onClick={() => setMobileSubOpen(!mobileSubOpen)}
                    className="w-full flex items-center justify-between py-2 transition duration-300"
                  >
                    <span className="relative inline-flex items-center">
                      <span className="absolute -inset-[2px] rounded-full marketplace-glow opacity-80" />
                      <span className={`relative bg-white px-3 py-1 rounded-full font-semibold text-sm ${item.isActive ? 'text-blue-950' : 'text-blue-600'}`}>
                        {item.label}
                      </span>
                    </span>
                    <svg className={`w-4 h-4 text-blue-600 transition-transform ${mobileSubOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {mobileSubOpen && (
                    <div className="pl-4 pb-1 flex flex-col border-l-2 border-blue-100 ml-2">
                      {item.subMenu.map((sub, si) => (
                        <Link key={si} href={sub.href}
                          onClick={() => setMenuOpen(false)}
                          className={`py-1.5 text-sm transition-colors ${pathname === sub.href ? 'text-blue-700 font-semibold' : 'text-gray-500 hover:text-blue-600'}`}>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link href={item.href} key={index}
                  onClick={() => setMenuOpen(false)}
                  className={`relative text-blue-600 py-2 transition duration-300 ${item.isActive ? 'text-blue-950' : ''}`}>
                  {item.label}
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    </header>
    </>
  );
};

export default Header;
