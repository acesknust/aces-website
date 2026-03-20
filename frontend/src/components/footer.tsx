'use client';

import { useState } from 'react';
import { FaInstagram, FaLinkedin, FaLocationArrow } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import Link from 'next/link';
import Image from 'next/image';

// Social media links - centralized for easy updates
const SOCIAL_LINKS = {
  linkedin: 'https://www.linkedin.com/company/aces-knust/',
  instagram: 'https://www.instagram.com/aces_knust/',
  twitter: 'https://x.com/aces_knust',
};

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dynamic year
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    // Simulate API call - replace with actual endpoint when available
    try {
      // TODO: Replace with actual newsletter API endpoint
      // await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   body: JSON.stringify({ email }),
      // });

      // For now, show success message
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessage({ type: 'success', text: 'Thanks for subscribing!' });
      setEmail('');
    } catch {
      setMessage({ type: 'error', text: 'Failed to subscribe. Try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const SocialIcons = ({ size = 25 }: { size?: number }) => (
    <>
      <Link href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
        <FaLinkedin size={size} />
      </Link>
      <Link href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
        <FaInstagram size={size} />
      </Link>
      <Link href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
        <FaSquareXTwitter size={size} />
      </Link>
    </>
  );

  return (
    <footer className="bg-blue-950 text-white pt-8 pb-0">
      <div className="container mx-auto px-6">
        <div className="border-b border-gray-600 pb-4 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center">
            <div className="mr-3">
              <Image src="/images/logo-white.png" alt="ACES Logo" width={56} height={56} className="h-14 w-14 object-contain" />
            </div>
            <div>
              <div className="font-semibold leading-tight">Association of Computer<br />Engineering Students</div>
            </div>
          </div>
          <div className="hidden lg:flex flex-col md:items-end min-w-[60px]">
            <div className="flex space-x-3 mb-2">
              <SocialIcons />
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
              <div className="text-sm text-gray-300 flex flex-col gap-1">
                <Link href="/executives" className="hover:text-white transition-colors">Executives</Link>
                <Link href="/events" className="hover:text-white transition-colors">Events</Link>
                <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
              </div>
            </div>
            <div>
              <div className="font-bold mb-1">Support</div>
              <div className="text-sm text-gray-300 flex flex-col gap-1">
                <Link href="/scholarships" className="hover:text-white transition-colors">Scholarships</Link>
                <Link href="/shop" className="hover:text-white transition-colors">ACES Shop</Link>
                <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
              </div>
            </div>
            <div className="min-w-[220px]">
              <div className="font-bold mb-1">Newsletter</div>
              <div className="text-sm text-gray-300 mb-2">Get exclusive news concerning ACES by signing up to our Newsletter</div>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded py-2 transition-colors"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
                {message && (
                  <p className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {message.text}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Social Icons for mobile */}
        <div className="flex lg:hidden justify-center mt-4 mb-2">
          <div className="flex space-x-3">
            <SocialIcons />
          </div>
        </div>

        <div className="border-t border-gray-600 mt-4 py-4 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <div className="mb-2 md:mb-0 flex items-center gap-2">
            <span>Technology For Our Age</span>
            <span className="text-lg">©</span>
            <span>{currentYear}</span>
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
