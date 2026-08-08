import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | ACES KNUST - Association of Computer Engineering Students',
  description: 'Learn about ACES KNUST - the official student body representing Computer Engineering students at KNUST. Discover our mission, vision, and meet our executive team.',
  keywords: ['ACES', 'KNUST', 'Computer Engineering', 'Student Association', 'Ghana', 'Technology', 'Engineering Students', 'ACES Executives', 'Mission', 'Vision'],
  openGraph: {
    title: 'About ACES KNUST',
    description: 'The Association of Computer Engineering Students - Technology For Our Age',
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
