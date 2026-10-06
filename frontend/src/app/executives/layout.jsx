'use client';
import Header from "@/components/header";
import Footer from '@/components/footer';

export default function ExecutivesLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
