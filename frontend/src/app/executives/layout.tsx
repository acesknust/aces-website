import { ReactNode } from 'react';
import Nav from '../ui/executives/nav';
import Header from '../ui/header';
import { Metadata } from 'next';
import Footer from '../ui/footer';

export const metadata: Metadata = {
  title: 'Executives',
};
interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {

  return (
    <div>
      <Header />
    <div className="min-h-screen flex flex-row lg:flex-row">
      <Nav /> 

      <main className="flex-grow container mx-auto my-8 lg:w-4/5">
        {children}
      </main>
    </div>
    <Footer />
    </div>
  );
};

export default Layout;