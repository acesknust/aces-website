"use client";
import { useEffect, useState } from "react";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import { getScholarships } from "../../../../api/scholarship";
import { BiPlusCircle, BiSearch } from "react-icons/bi";
import Link from "next/link";
import { deleteScholarship } from "../../../../api/scholarship";

interface Scholarship {
  id: number;
  name: string;
}

export default function Table() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  // const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getScholarships().then((res) => {
      console.log(res?.data);
      setScholarships(res?.data);
    });
  }, []);

  const handleDelete = async (scholarshipId: number) => {

    try {
      await deleteScholarship(scholarshipId);
      const newScholarships = scholarships.filter(
        (scholarship) => scholarship.id !== scholarshipId
      );
      setScholarships(newScholarships);
    } catch (error) {
      console.error('Error deleting scholarship:', error);
    }
  };


  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col lg:flex-row justify-center gap-4 items-center -mb-5">
        {/* search scholarship  */}
        <div className="flex flex-col items-center">
          <div className="flex items-center border-b border-blue-500 py-2">
            <input
              className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
              type="text"
              placeholder="Search Scholarship"
              aria-label="Full name"
            />
            <BiSearch size={24} />
          </div>
        </div>
        {/* write scholar button with icon */}
        <div className="">
          <Link

            href="/admin/scholarships/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >

            <BiPlusCircle size={35} className="inline-block p-2" />
            Create Scholarship

          </Link>
        </div>
      </div>
      <div className="py-16">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Scholarship Name</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scholarships.map((scholarship) => (
              <tr key={scholarship.id}>
                <td className="py-2 px-4 border-b">{scholarship.name}</td>
                <td className="py-2 px-4 border-b flex gap-4">
                  <button className="mr-2 text-blue-500">
                    <BsPencilSquare size={24} />
                  </button>
                  <div>

                  <button onClick={() => handleDelete(scholarship.id)}
                  className="text-red-500">
                    <BsTrash size={24} />
                  </button>
                </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
