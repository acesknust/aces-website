import Image from "next/image";
import Link from "next/link";

const Gallery = () => {
  return (
    <div className="container mx-auto p-8">
      <div className="text-center">
        <h1 className="lg:text-5xl text-3xl font-bold -mb-10 py-16">
          ACES <span className="text-blue-600">Gallery</span>
        </h1>
        <p className="text-gray-600 mb-16">
          Explore the rich tapestry of moments and achievements within our
          department through a curated collection of images. Our gallery
          captures the essence of academic excellence, student life, and
          memorable events that define the unique spirit of our department.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Column  1 */}
        <div className="col-lg-4 col-md-12 mb-4 mb-lg-0">
          <div className="group">
            <Link href="https://Acesworks.pixieset.com/codefest/" target="_blank">
              <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 group-hover:scale-[1.03] transition duration-300">
                <Image
                  src="/images/Aces_Images/Aces Images/Codefest/45.jpg"
                  alt="Codefest"
                  width={800}
                  height={533}
                  className="w-full shadow-1-strong rounded mb-4"
                />
                <p className="text-gray-600">CODEFEST</p>
              </div>
            </Link>
          </div>

          <div className="group">
            <Link href="https://drive.google.com/drive/folders/1-7r1f4S3YR8NjzcKWv3NZV5eSxIJcTtR" target="_blank">
              <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 group-hover:scale-[1.03] transition duration-300">
                <Image
                  src="/images/Gallery/Nocte.jpg"
                  alt="Nocte Memminisse"
                  width={800}
                  height={1200}
                  className="w-full shadow-1-strong rounded mb-4"
                />
                <p className="text-gray-600">
                  Nocte Memminisse | CBET Dinner and Excellence Awards
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Column  2 */}
        <div className="col-lg-4 col-md-12 mb-4 mb-lg-0">
          <div className="group">
            <Link href="https://simondelali.pixieset.com/acesphotoshoot-1/" target="_blank">
              <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 group-hover:scale-[1.03] transition duration-300">
                <Image
                  src="/images/Gallery/Acesshirt.jpg"
                  alt="Rep Aces"
                  width={800}
                  height={533}
                  className="w-full shadow-1-strong rounded mb-4"
                />
                <p className="text-gray-600">REP ACES</p>
              </div>
            </Link>
          </div>

          <div className="group">
            <Link href="https://Acesworks.pixieset.com/acesweek/" target="blank">
              <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 group-hover:scale-[1.03] transition duration-300">
                <Image
                  src="/images/Aces_Images/Aces Images/Aces week/165.jpg"
                  alt="Official Monday | ACES Week Celebration"
                  width={800}
                  height={1200}
                  className="w-full shadow-1-strong rounded mb-4"
                />
                <p className="text-gray-600">
                  ACES Week 
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Column  3 */}
        <div className="col-lg-4 col-md-12 mb-4 mb-lg-0">
          <div className="group">
            <Link href="https://Acesworks.pixieset.com/fieldtrip/" target="_blank">
              <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 group-hover:scale-[1.03] transition duration-300">
                <Image
                  src="/images/Aces_Images/Aces Images/Field Trip/7.jpg"
                  alt="FIELD TRIP"
                  width={800}
                  height={533}
                  className="w-full shadow-1-strong rounded mb-4"
                />
                <p className="text-gray-600">FIELD TRIP</p>
              </div>
            </Link>
          </div>

          <div className="group">
            <Link href="https://Acesworks.pixieset.com/orientation/" target="_blank">
              <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 group-hover:scale-[1.03] transition duration-300">
                <Image
                  src="/images/Aces_Images/Aces Images/orientation/16.jpg"
                  alt="Rep your team"
                  width={800}
                  height={1200}
                  className="w-full shadow-1-strong rounded mb-4"
                />
                <p className="text-gray-600">Orientation</p>
              </div>
            </Link>
          </div>

          <div className="group">
            <Link href="https://Acesworks.pixieset.com/medtechrave/" target="_blank">
              <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 group-hover:scale-[1.03] transition duration-300">
                <Image
                  src="/images/Aces_Images/Aces Images/MedTech Rave/16.jpg"
                  alt="Rep your team"
                  width={800}
                  height={1200}
                  className="w-full shadow-1-strong rounded mb-4"
                />
                <p className="text-gray-600">MedTech Rave</p>
              </div>
            </Link>
          </div>

          <div className="group">
            <Link href="https://Acesworks.pixieset.com/ladiesmeetup/" target="_blank">
              <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 group-hover:scale-[1.03] transition duration-300">
                <Image
                  src="/images/Aces_Images/Aces Images/Ladies general meeting/26.jpg"
                  alt="Rep your team"
                  width={800}
                  height={1200}
                  className="w-full shadow-1-strong rounded mb-4"
                />
                <p className="text-gray-600">Ladies Meetup</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
        <span className="bg-blue-600 text-white cursor-pointer border border-blue-600 hover:border-blue-700 rounded-[5px] px-4 py-2">
          <a href="https://t.me/+Is6U_pngOmYyMjM0" target="_blank">
            Telegram Gallery
          </a>
        </span>
       
    </div>

  );
};

export default Gallery;
