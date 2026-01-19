import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './style.css'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | ACES-KNUST',
    default: 'ACES-KNUST',
  },
  description: 'The Official Website For The Association Of Computer Engineering Students, Kwame Nkrumah University of Science and Technology.',
  icons: {
    icon: '/images/aceslogo.png',
  },
};


import { CartProvider } from '@/context/CartContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
