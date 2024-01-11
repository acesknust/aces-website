'use client'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { getScholarship, updateScholarship } from '../../../../../../api/scholarship';
import { scholarshipNavigate } from '@/app/actions';
import { notFound } from 'next/navigation';

interface FormData {
  name: string;
  description: string;
  link: string;
  image: File | null;
}

export default function UpdateScholarshipForm({ params } : { params: any }) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    link: '',
    image: null,
  });

  // get the id from the url
  const pathname = usePathname();
  const parts = pathname.split('/');
  const id = parts[parts.length - 1];
  


  useEffect(() => {
    // Fetch scholarship data when the component mounts and return not found if the scholarship is not found
    getScholarship(params.id as string).then((res) => {
      if (res?.data) {
        const scholarshipdata = res.data;
        setFormData(
          {
            name: scholarshipdata.name,
            description: scholarshipdata.description,
            link: scholarshipdata.link,
            image: null,
          }
        );
      } else {
        console.log('Scholarship not found');
        // render 404.tsx page
        notFound();
      }
    });
  }
  , [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData({ ...formData, image: file || null });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('link', formData.link);
    if (formData.image) {
      data.append('image', formData.image);
    }

    updateScholarship(id as string, data);
    scholarshipNavigate();
    }
  


  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
          Scholarship Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded" 
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="link" className="block text-gray-700 font-bold mb-2">
          Link
        </label>
        <input
          type="text"
          id="link"
          name="link"
          value={formData.link}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="image" className="block text-gray-700 font-bold mb-2">
          Image
        </label>
        <input
          type="file"
          id="image"
          name="image"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
        />
      </div>
      {/* <Link href="/admin/scholarships"> */}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-full">
        Update
      </button>
      {/* </Link> */}
    </form>
  );


}
