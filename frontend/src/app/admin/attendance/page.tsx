'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { BiPlusCircle, BiSearch } from "react-icons/bi";
import { BsTrash } from "react-icons/bs";
import { FaFileExcel } from "react-icons/fa6";
import { useAdminProfile } from "@/components/admin/use-admin-profile";
import { getEvents } from "@/app/api/event";
import { AttendanceSession, createSession, deleteSession, exportSession, getSessions } from "@/app/api/attendance";

const today = () => new Date().toISOString().slice(0, 10);

export default function AttendancePage() {
  const { loading, hasPerk } = useAdminProfile();
  const canTake = hasPerk('take_attendance');
  const canExport = hasPerk('export_attendance');

  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [events, setEvents] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({ title: '', date: today(), event: '' });
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load =() => getSessions().then((res) => setSessions(res.data));

  useEffect(() => {
    if (loading || !(canTake || canExport)) return;
    load();
    if (canTake) getEvents().then((res) => setEvents(res?.data ?? []));
  }, [loading, canTake, canExport]);

  if (loading) return null;
  if (!canTake && !canExport) {
    return <p className="text-gray-600">You don&apos;t have a role that allows attendance.</p>;
  }

  const q = query.trim().toLowerCase();
  const shown = q
    ? sessions.filter((s) => [s.title, s.date, s.event_name ?? ''].some((v) => v.toLowerCase().includes(q)))
    : sessions;

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createSession({ title: form.title, date: form.date, event: form.event ? Number(form.event) : null });
      setForm({ title: '', date: today(), event: '' });
      load();
    } catch {
      setError('Could not create the session.');
    }
  };

  const remove = async (session: AttendanceSession) => {
    if (!confirm(`Delete "${session.title}" and its ${session.total} attendance mark(s)?`)) return;
    await deleteSession(session.id);
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-blue-950 mb-1">Attendance</h1>
        <p className="text-gray-600">Start a session for a meeting or event, mark who came, and export it to Excel.</p>
      </div>

      {canTake && (
        <form onSubmit={create} className="bg-white border border-gray-300 rounded p-4 grid gap-3 md:grid-cols-4 items-end">
          <label className="text-sm md:col-span-2">
            <span className="block text-gray-700 mb-1">Session title</span>
            <input
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. General Meeting, Week 5"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="block text-gray-700 mb-1">Date</span>
            <input
              required
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="block text-gray-700 mb-1">Event (optional)</span>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={form.event}
              onChange={(e) => setForm({ ...form, event: e.target.value })}
            >
              <option value="">None</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </label>
          <div className="md:col-span-4 flex items-center gap-3">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              <BiPlusCircle size={20} className="inline-block mr-1" />
              Start session
            </button>
            {error && <span className="text-red-600 text-sm">{error}</span>}
          </div>
        </form>
      )}

      <div className="flex items-center border-b border-blue-500 py-2 max-w-md">
        <input
          className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
          type="search"
          placeholder="Search sessions by title, date or event"
          aria-label="Search sessions"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <BiSearch size={24} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-start">Session</th>
              <th className="py-2 px-4 border-b text-start">Date</th>
              <th className="py-2 px-4 border-b text-start">Present</th>
              <th className="py-2 px-4 border-b text-start">Late</th>
              <th className="py-2 px-4 border-b text-start">Absent</th>
              <th className="py-2 px-4 border-b text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={6} className="py-4 px-4 text-gray-500">
                {sessions.length === 0 ? 'No attendance sessions yet.' : 'No sessions match your search.'}
              </td></tr>
            )}
            {shown.map((s) => (
              <tr key={s.id}>
                <td className="py-2 px-4 border-b">
                  <Link href={`/admin/attendance/${s.id}`} className="font-medium text-blue-700 hover:underline">{s.title}</Link>
                  {s.event_name && <div className="text-xs text-gray-500">{s.event_name}</div>}
                </td>
                <td className="py-2 px-4 border-b">{s.date}</td>
                <td className="py-2 px-4 border-b">{s.present}</td>
                <td className="py-2 px-4 border-b">{s.late}</td>
                <td className="py-2 px-4 border-b">{s.absent}</td>
                <td className="py-2 px-4 border-b whitespace-nowrap">
                  {canExport && (
                    <button onClick={() => exportSession(s)} className="text-green-700 mr-3" aria-label="Export to Excel" title="Export to Excel">
                      <FaFileExcel />
                    </button>
                  )}
                  {canTake && (
                    <button onClick={() => remove(s)} className="text-red-600" aria-label="Delete session" title="Delete session">
                      <BsTrash />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
