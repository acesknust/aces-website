
import Image from 'next/image';
import Link from 'next/link';

const Gallery = () => {
  return (
    <div className="container mx-auto p-8">

      <div className='text-center'>
      <h1 className="lg:text-5xl text-3xl font-bold -mb-10 py-16">
        ACES <span className="text-blue-600">Gallery</span>
      </h1>
      <p className='text-gray-600 mb-16'>Explore the rich tapestry of moments and achievements within our 
      department through a curated collection of images. Our gallery captures the essence of academic excellence, 
      student life, and memorable events that define the unique spirit of our department.
      </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Column  1 */}
        <div className="col-lg-4 col-md-12 mb-4 mb-lg-0">
          <div className="group">
            <Link href="https://t.me/+DLdm_86B3lc5YzFk">
              <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 group-hover:scale-[1.03] transition duration-300">
                <Image
                  src="/images/Gallery/codefest.jpg"
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
            <Link href="https://drive.google.com/drive/folders/1-7r1f4S3YR8NjzcKWv3NZV5eSxIJcTtR">
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
            <Link href="">
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
            <Link href="">
              <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 group-hover:scale-[1.03] transition duration-300">
                <Image
                  src="/images/Gallery/official.jpg"
                  alt="Official Monday | ACES Week Celebration"
                  width={800}
                  height={1200}
                  className="w-full shadow-1-strong rounded mb-4"
                />
                <p className="text-gray-600">
                  African Wear Day | ACES Week Celebration
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Column  3 */}
        <div className="col-lg-4 col-md-12 mb-4 mb-lg-0">
          <div className="group">
            <Link href="https://t.me/+DLdm_86B3lc5YzFk">
              <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 group-hover:scale-[1.03] transition duration-300">
                <Image
                  src="/images/Gallery/Trip.jpg"
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
            <Link href="https://drive.google.com/drive/folders/1-xzTD28JBEl3gIOwhZ1F0Ds0eE1Fy9_w?usp=sharing">
              <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 group-hover:scale-[1.03] transition duration-300">
                <Image
                  src="/images/Gallery/Jersey.jpg"
                  alt="Rep your team"
                  width={800}
                  height={1200}
                  className="w-full shadow-1-strong rounded mb-4"
                />
                <p className="text-gray-600">
                  REP YOUR TEAM
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
