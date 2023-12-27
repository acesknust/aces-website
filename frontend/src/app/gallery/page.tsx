import { Metadata } from "next";
import Footer from "../ui/footer";
import Gallery from "../ui/gallery/gallery";
import Header from "../ui/header";

export const metadata: Metadata = {
  title: 'Gallery',
};

export default function page() {
  return (
    <div>
        <Header />
        <Gallery />
        <Footer />
    </div>
  )
}
