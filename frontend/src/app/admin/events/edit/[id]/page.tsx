'use client'

import { notFound, usePathname } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { getEvent, updateEvent } from "../../../../api/event";
import { eventNavigate } from "@/app/actions";

interface FormData {
  name: string;
  date: string;
  time: string;
  location: string;
  status: 'Upcoming' | 'Completed';
  image: File | null;
}

export default function UpdateEventForm({ params }: { params: any }) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    date: '',
    time: '',
    location: '',
    status: 'Upcoming',
    image: null,
  });

  // get the id from the url
  const pathname = usePathname();
  const parts = pathname.split('/');
  const id = parts[parts.length - 1];

  useEffect(() => {
    // Fetch event data when the component mounts and return not found if the event is not found
    getEvent(id).then((res) => {
      if (res?.data) {
        const eventdata = res.data;
        setFormData(
          {
            name: eventdata.name,
            date: eventdata.date,
            time: eventdata.time,
            location: eventdata.location,
            status: eventdata.status,
            image: null,
          }
        );
      } else {
        console.log('Event not found');
        // render 404.tsx page
        notFound();
      }
    });
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData({ ...formData, image: file || null });
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value as 'Upcoming' | 'Completed' });
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('date', formData.date);
    data.append('time', formData.time);
    data.append('location', formData.location);
    data.append('status', formData.status);
    if (formData.image) {
      data.append('image', formData.image);
    }

    updateEvent(id as string, data);
    eventNavigate();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
          Event Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="date" className="block text-gray-700 font-bold mb-2">
          Date
        </label>
        <textarea
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="time" className="block text-gray-700 font-bold mb-2">
          Time
        </label>
        <input
          type="text"
          id="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="location" className="block text-gray-700 font-bold mb-2">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="status" className="block text-gray-700 font-bold mb-2">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleStatusChange}
          className="w-full p-2 border rounded"
        >
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
        </select>
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
          required
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-full">
        Update
      </button>
    </form>
  );
}
