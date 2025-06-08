import { Metadata } from "next";
import Footer from "../../components/footer";
import Gallery from "../../components/gallery/gallery";
import Header from "../../components/header";

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
