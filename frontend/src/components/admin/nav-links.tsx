'use client';

import { IoHomeOutline } from "react-icons/io5";
import { RiArticleLine, RiGraduationCapLine } from "react-icons/ri";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaClipboardCheck, FaUserShield } from "react-icons/fa6";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAdminProfile } from "./use-admin-profile";


// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
// `perks`: show the link to holders of any of these perks (super admins see everything).
// `staff`: existing staff admins keep seeing the link.
type NavLink = { name: string; href: string; icon: any; perks?: string[]; staff?: boolean; superOnly?: boolean };

const links: NavLink[] = [
  { name: 'Home', href: '/admin', icon: IoHomeOutline },
  // {
  //   name: 'Blogs',
  //   href: '/admin/',
  //   icon: RiArticleLine,
  // },
  {
    name: 'Events',
    href: '/admin/events',
    icon: FaRegCalendarAlt,
    perks: ['manage_events'],
    staff: true,
  },
  {
    name: 'Scholarships',
    href: '/admin/scholarships',
    icon: RiGraduationCapLine,
    perks: ['manage_scholarships'],
    staff: true,
  },
  {
    name: 'Attendance',
    href: '/admin/attendance',
    icon: FaClipboardCheck,
    perks: ['take_attendance', 'export_attendance'],
  },
  {
    name: 'Roles & Perks',
    href: '/admin/roles',
    icon: FaUserShield,
    superOnly: true,
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  const { profile, hasPerk } = useAdminProfile();

  const visible = links.filter((link) => {
    if (link.superOnly) return !!profile?.is_superuser;
    if (!link.perks) return true;
    return (link.staff && profile?.is_staff) || hasPerk(...link.perks);
  });

  return (
    <>
      {visible.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': link.href === '/admin' ? pathname === link.href : pathname.startsWith(link.href),
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
