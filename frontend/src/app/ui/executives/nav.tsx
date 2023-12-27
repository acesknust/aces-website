'use client';
import Link from "next/link";
import  { useState, ReactNode } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { RiMenuUnfoldLine } from "react-icons/ri";

interface DropdownProps {
  title: string;
  children: ReactNode;
}

const Dropdown = ({ title, children }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div
        className="flex items-center p-4 cursor-pointer hover:text-blue-600 hover:underline"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        {isOpen ? <FaAngleUp className="mr-2" /> : <FaAngleDown className="mr-2" />}
      </div>
      {isOpen && <ul className="ml-4">{children}</ul>}
    </div>
  );
};


const App = () => {
    const [isOpen, setIsOpen] = useState(false)
    const toggleDrawer = () => {
        setIsOpen((prevState) => !prevState)
    }

    return (
        <>
          {/* Mobile view */}
          <div className="lg:hidden">
            <div className="py-20 mt-6 fixed">

            <button onClick={toggleDrawer}
            >
            <RiMenuUnfoldLine 
            size={28}
            />
            </button>
            </div>
            <Drawer
                open={isOpen}
                onClose={toggleDrawer}
                direction='left'
                className='bla bla bla'
            >
                <div>
                <Link href="/executives">
                  <h1 className="text-xl m-5 mt-8 hover:text-blue-600">Executives</h1>
                  </Link>
                <ul className="flex-1">
                  <Dropdown title="2023/2024 Executives">
                    <Link href="/executives/2024">
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Executive Council</li>
                    </Link>
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Committee Heads</li>
                  </Dropdown>
                  <Dropdown title="2022/2023 Executives">
                  <Link href="/executives/2023">
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Executive Council</li>
                    </Link>
                    <Link href="/executives/2023/committee-heads">
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Committee Heads</li>
                    </Link>
                  </Dropdown>
                  <Dropdown title="2021/2022 Executives">
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Executive Council</li>
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Committee Heads</li>
                  </Dropdown>
                  <Dropdown title="2020/2021 Executives">
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Executive Council</li>
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Committee Heads</li>
                  </Dropdown>
                </ul>
              </div>
            </Drawer>
          </div>
            
            {/* Desktop view */}
            <div className="hidden lg:block py-20 border">
            <div>
                <Link href="/executives">
                  <h1 className="text-xl m-5 mt-8 hover:text-blue-600">Executives</h1>
                  </Link>
                <ul className="flex-1">
                  <Dropdown title="2023/2024 Executives">
                    <Link href="/executives/2024">
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Executive Council</li>
                    </Link>
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Committee Heads</li>
                  </Dropdown>
                  <Dropdown title="2022/2023 Executives">
                  <Link href="/executives/2023">
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Executive Council</li>
                    </Link>
                    <Link href="/executives/2023/committee-heads">
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Committee Heads</li>
                    </Link>
                  </Dropdown>
                  <Dropdown title="2021/2022 Executives">
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Executive Council</li>
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Committee Heads</li>
                  </Dropdown>
                  <Dropdown title="2020/2021 Executives">
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Executive Council</li>
                    <li className="p-2 cursor-pointer hover:text-blue-600 hover:underline">Committee Heads</li>
                  </Dropdown>
                </ul>
              </div>
            </div>

        </>
    )
}

export default App