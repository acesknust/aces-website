"use client";

import { useEffect, useState } from "react";
import { deleteEvent, getEvents } from "../../app/api/event";
import { BiPlusCircle, BiSearch } from "react-icons/bi";
import Link from "next/link";
import { BsPencilSquare, BsTrash } from "react-icons/bs";

interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
  image: string;
  status: "Upcoming" | "Completed";
}

export default function Table() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    getEvents().then((res) => {
      setEvents(res?.data);
      console.log(res?.data);
    });
  }, []);

  const handleDelete = async (eventId: number) => {

    try {
      await deleteEvent(eventId);
      const newEvents = events.filter(
        (event) => event.id !== eventId
      );
      setEvents(newEvents);
    } catch (error) {
      console.error('Error deleting event:', error);
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
              placeholder="Search Event"
              aria-label="Full name"
            />
            <BiSearch size={24} />
          </div>
        </div>
        {/* write scholar button with icon */}
        <div className="">
          <Link

            href="/admin/events/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >

            <BiPlusCircle size={35} className="inline-block p-2" />
            Create Event

          </Link>
        </div>
      </div>
      <div className="py-16">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-start">Event Name</th>
              <th className="py-2 px-4 border-b text-start">Date</th>
              <th className="py-2 px-4 border-b text-start">Time</th>
              <th className="py-2 px-4 border-b text-start">Location</th>
              <th className="py-2 px-4 border-b text-start">Status</th>
              <th className="py-2 px-4 border-b text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td className="py-2 px-4 border-b">{event.name}</td>
                <td className="py-2 px-4 border-b">{event.date}</td>
                <td className="py-2 px-4 border-b">{event.time}</td>
                <td className="py-2 px-4 border-b">{event.location}</td>
                <td className="py-2 px-4 border-b">{event.status}</td>
                <td className="py-2 px-4 border-b flex gap-4">
                  <Link href={`/admin/events/edit/${event.id}`}>
                    <button
                      className="mr-2 text-blue-500">
                      <BsPencilSquare size={24} />
                    </button>
                  </Link>
                  <div>

                    <button onClick={() => handleDelete(event.id)}
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
