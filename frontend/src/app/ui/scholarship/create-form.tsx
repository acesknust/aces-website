'use client'
import { useState, ChangeEvent, FormEvent } from 'react';
import { createScholarship } from '../../../../api/scholarship';
import Link from 'next/link';
import { scholarshipNavigate } from '@/app/actions';
interface FormData {
  name: string;
  description: string;
  link: string;
  image: File | null;
}

const CreateScholarshipForm = () => {

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    link: '',
    image: null,
  });

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
    

    createScholarship(data);
    scholarshipNavigate();
  };

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
        Create
      </button>
      {/* </Link> */}
    </form>
  );
};

export default CreateScholarshipForm;
