"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { eventNavigate } from "@/app/actions";
import { createEvent } from "../../app/api/event";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, set } from "date-fns";
import { BiCalendarAlt } from "react-icons/bi";
import { FaCalendarAlt } from "react-icons/fa";

interface FormData {
  name: string;
  date: string;
  time: string;
  location: string;
  status: "Upcoming" | "Completed";
  image: File | null;
}

const CreateEventForm = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date().getTime());
  const [formData, setFormData] = useState<FormData>({
    name: "",
    date: "",
    time: "",
    location: "",
    status: "Upcoming",
    image: null,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData({ ...formData, image: file || null });
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value as "Upcoming" | "Completed" });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("date", formData.date);
    data.append("time", formData.time);
    data.append("location", formData.location);
    data.append("status", formData.status);
    if (formData.image) {
      data.append("image", formData.image);
    }

    createEvent(data);
    eventNavigate();
  };

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
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date) => {
            setSelectedDate(date);
            setFormData({
              ...formData,
              date: format(date, "EEEE, MMMM do yyyy"),
            });
          }}
          className="p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="time" className="block text-gray-700 font-bold mb-2">
          Time
        </label>
        <DatePicker
          selected={new Date(selectedTime)}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="h:mm aa"
          onChange={(time: Date) => {
            setSelectedTime(time.getTime());
            setFormData({ ...formData, time: format(time, "h:mm aa") });
          }}
          className="p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="location"
          className="block text-gray-700 font-bold mb-2"
        >
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
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-full"
      >
        Create
      </button>
    </form>
  );
};

export default CreateEventForm;
