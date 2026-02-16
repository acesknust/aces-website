'use client'
import { useEffect, useState } from "react";
import SideNav from "../../components/admin/sidenav"
import { redirect } from "next/navigation";


export default function Layout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsAuthenticated(false);
        redirect("/login");
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();

  }, []);

  if (!isAuthenticated) {
    return null;
  }


  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  )
}

