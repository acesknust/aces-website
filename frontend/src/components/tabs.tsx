'use client'
import React, { useState, ReactNode } from 'react';

interface Tab {
   label: string;
   content: ReactNode;
}

interface TabsProps {
   tabs: Tab[];
   initialTab?: number;
   className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, initialTab = 0, className = '' }) => {
   const [activeTab, setActiveTab] = useState(initialTab);

   return (
      <div className={`w-full flex flex-col items-center ${className}`}>
         <div className="flex bg-blue-950 p-1 rounded-lg shadow-md overflow-hidden mb-6">
            {tabs.map((tab, idx) => (
               <button
                  key={tab.label}
                  className={`px-8 py-2 text-lg font-bold focus:outline-none transition-colors duration-200 ${activeTab === idx
                     ? 'bg-white text-blue-950 rounded-lg'
                     : 'bg-blue-950 text-white'
                     } ${idx === tabs.length - 1 ? 'rounded-r-lg' : ''} ${idx === 0 ? 'rounded-l-lg' : ''}`}
                  onClick={() => setActiveTab(idx)}
                  type="button"
               >
                  {tab.label}
               </button>
            ))}
         </div>
         <div className="w-full flex justify-center">
            <div className="w-full md:w-2/3 lg:w-1/2">
               {tabs[activeTab].content}
            </div>
         </div>
      </div>
   );
};

export default Tabs; 