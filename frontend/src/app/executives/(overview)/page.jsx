'use client'
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ExecutivePage = () => {
  // Sample data structure for executives by year
  const executiveData = {
    '2024-2025': [
      {
        id: 1,
        name: 'Collins Akatey',
        position: 'President',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508773/Collins_ys1vlg.jpg'
      },
      {
        id: 2,
        name: 'Prince Owusu',
        position: 'Vice President',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508748/kekeli_xchuze.jpg'
      },
      {
        id: 3,
        name: 'Afua Twumasi Britwum',
        position: 'General Secretary',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508739/afua_szlxot.jpg'
      },
      {
        id: 4,
        name: 'Famous Mawulenu Kwaku Aba',
        position: 'Organizing Secretary',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508785/Famous_jxvwys.jpg'
      },
      {
        id: 5,
        name: 'Rahinatu Adam',
        position: 'Financial Secretary',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508745/hajia_fjzvv7.jpg'
      },
      {
        id: 6,
        name: 'Jesse Yaw Owusu',
        position: 'Public Relations Officer',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508788/Jesse_nycrl3.jpg'
      },

      {
        id: 7,
        name: 'Nana Akosua Addipa',
        position: "Women's Commissioner",
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508738/addipa_mq4pv3.jpg'
      }
    ],
    '2023-2024': [
      {
        id: 8,
        name: 'Gyasi Gideon',
        position: 'President',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508726/GIDEON_hcpjnz.jpg'
      },
      {
        id: 9,
        name: 'Owusu Bismark Owiredu',
        position: 'Vice President',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508734/BISMARK_p11fre.jpg'
      },
      {
        id: 10,
        name: 'Gyening Kwadjo Augustine',
        position: 'General Secretary',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508721/AUGUSTINE_rjsajx.jpg'
      },
      {
        id: 11,
        name: 'Baffuoh Asare-Bediako',
        position: 'Financial Secretary',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508739/BAFFOUH_oracit.jpg'
      },
      {
        id: 12,
        name: 'Tenkorang Terrance',
        position: 'Organizing Secretary',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508744/TERRANCE_kws4qo.jpg'
      },
      {
        id: 13,
        name: 'Ankrah Vince Churchill',
        position: 'Public Relation Officer',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508734/VINCE_whiwr9.jpg'
      },

      {
        id: 14,
        name: 'Yawlui Enam Sharon',
        position: "Women's Commissioner",
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508729/SHARON_le9xr3.jpg'
      },
    ],
    '2022-2023': [
      {
        id: 15,
        name: 'Baki Jessy Justice Julien',
        position: 'President',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508748/Jessy_ldszim.jpg'
      },
      {
        id: 16,
        name: 'Simon Delali Atiegar',
        position: 'Vice President',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508762/Simon_kuebix.jpg'
      },
      {
        id: 17,
        name: 'Baffoah Takyi Lordia',
        position: 'General Secretary',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508705/Lordia_emicsh.jpg'
      },
      {
        id: 18,
        name: 'Agyarko Samuel',
        position: 'Financial Secretary',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508723/Sammy_ml5egg.jpg'
      },
      {
        id: 19,
        name: 'Akofi-Holison Kwabena',
        position: 'Public Relation Officer',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508695/Holison_ajxnym.jpg'
      },

      {
        id: 20,
        name: 'Peter Derry Arkadius',
        position: 'Organizing Secretary',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508708/Peter_myx1ct.jpg'
      },      

      {
        id: 21,
        name: 'Josephine N.A Asmah',
        position: 'Women’s Commissioner',
        image: 'https://res.cloudinary.com/dmgk37i6y/image/upload/v1756508698/Josephine_iwlojs.jpg'
      },
    ],
    
  };

  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const years = Object.keys(executiveData);
  const currentExecutives = executiveData[selectedYear];

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-cover bg-center h-96 md:h-[500px]" 
           style={{
             backgroundImage: `url('https://res.cloudinary.com/dmgk37i6y/image/upload/v1756565095/executives_ahwozc.jpg')`,
             backgroundSize: "cover",   // 👈 makes image cover the whole div
             backgroundPosition: "center", // 👈 keeps it centered
             backgroundRepeat: "no-repeat", // 👈 prevents tiling
             height: "800px",           // 👈 set height, otherwise div might collapse
             width: "100%",  
           }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center">
            Our Executives
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Description */}
        <div className="mb-12 space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg">
            We are a student-led association that aims to provide an environment where 
            students can grow and develop their skills. It is with great honor and 
            enthusiasm that we, the executives leading the Noble Association, extend our 
            warmest welcome to each and every one of you.
          </p>
          
          <p className="text-lg">
            We feel privileged to assist and guide you on your educational journey within 
            the association and beyond. Our commitment is to provide unwavering support, 
            fostering an environment where you can thrive academically and personally.
          </p>
          
          <p className="text-lg">
            Your success is our priority, and we look forward to contributing to your growth 
            and achievements.
          </p>
        </div>

        {/* Year Dropdown */}
        <div className="mb-8">
          <div className="relative inline-block">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-blue-900 text-white px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-blue-800 transition-colors duration-200 min-w-[200px] justify-between"
            >
              <span className="font-medium">{selectedYear} Executives</span>
              <ChevronDown 
                className={`w-5 h-5 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                      selectedYear === year ? 'bg-blue-50 text-blue-900 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {year} Executives
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Executive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {currentExecutives.map((executive) => (
            <div 
               key={`${selectedYear}-${executive.id}`} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="aspect-square bg-gray-200">
                <img
                  src={executive.image}
                  alt={`${executive.name} - ${executive.position}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300/e5e7eb/6b7280?text=Executive';
                  }}
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {executive.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {executive.position}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutivePage;

