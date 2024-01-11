'use client';

import { IoHomeOutline } from "react-icons/io5";
import { RiArticleLine, RiGraduationCapLine } from "react-icons/ri";
import { FaRegCalendarAlt } from "react-icons/fa";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Metadata } from "next";


// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/admin', icon: IoHomeOutline },
  {
    name: 'Blogs',
    href: '/admin/',
    icon: RiArticleLine,
  },
  {
    name: 'Events',
    href: '/admin/events',
    icon: FaRegCalendarAlt,
  },
  {
    name: 'Scholarships',
    href: '/admin/scholarships',
    icon: RiGraduationCapLine,
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon size={24} className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>  
  );
}
