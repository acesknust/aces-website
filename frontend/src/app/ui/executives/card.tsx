'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Children } from "react";

interface ExecutiveCardProps {
  name: string;
  position: string;
  imageUrl: string;
  children?: React.ReactNode;
}

const ExecutiveCard = ({ name, position, imageUrl, children }: ExecutiveCardProps) => {
  return (
    <div className="rounded-md p-6 mb-4 h-full group border-2 border-gray-200">
      <div className="mb-4">
        <Image 
        src={imageUrl} 
        alt={`${name}'s photo`} 
        width={250}
        height={50}
        className="group-hover:scale-[1.03] transition duration-200 rounded-md" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <p className="text-gray-600">{position}</p>
      {children}
    </div>

  );
};

interface ExecutivesListProps {
  executives: { name: string; position: string; imageUrl: string, profileUrl?: string }[];
}

const ExecutivesList = ({ executives, }: ExecutivesListProps) => {
  const pathname = usePathname();

  return (
    <div className="p-4 flex justify-center lg:py-16 sm:12 py-16">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {executives.map((executive, index) => (
        <ExecutiveCard key={index} name={executive.name} position={executive.position} imageUrl={'/images/executives' + executive.imageUrl}>
          {pathname === '/department' && (
            <button className="hover:bg-blue-700 hover:text-white border-2 border-blue-600 font-medium py-2 px-4 rounded mt-4">
            <Link href={executive.profileUrl? `${executive.profileUrl}`: `#`} target="_blank">
              View Profile
            </Link>
          </button>
          )}
        </ExecutiveCard>
        ))}
      </div>
    </div>
  );
};

export default ExecutivesList;
