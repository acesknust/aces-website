'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { BiSearch } from "react-icons/bi";
import { BsTrash } from "react-icons/bs";
import { FaFileExcel } from "react-icons/fa6";
import { useAdminProfile } from "@/components/admin/use-admin-profile";
import {
  AttendanceRecord, AttendanceSession, AttendanceStatus,
  addRecord, bulkAddRecords, deleteRecord, exportSession, getRecords, getSession, updateRecord,
} from "@/app/api/attendance";

const STATUSES: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
];

const emptyRecord = { full_name: '', index_number: '', email: '', status: 'present' as AttendanceStatus };

function errorText(err: any, fallback: string) {
  const data = err?.response?.data;
  if (!data || typeof data === 'string') return fallback;
  return Object.values(data).flat().join(' ') || fallback;
}

export default function AttendanceSessionPage({ params }: { params: { id: string } }) {
  const { loading, hasPerk } = useAdminProfile();
  const canTake = hasPerk('take_attendance');
  const canExport = hasPerk('export_attendance');

  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [form, setForm] = useState(emptyRecord);
  const [bulkText, setBulkText] = useState('');
  const [bulkStatus, setBulkStatus] = useState<AttendanceStatus>('present');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | ''>('');

  const load =() => {
    getSession(params.id).then((res) => setSession(res.data));
    getRecords(params.id).then((res) => setRecords(res.data));
  };

  useEffect(() => {
    if (!loading && (canTake || canExport)) load();
  }, [loading, canTake, canExport, params.id]);

  if (loading) return null;
  if (!canTake && !canExport) {
    return <p className="text-gray-600">You don&apos;t have a role that allows attendance.</p>;
  }
  if (!session) return <p className="text-gray-500">Loading…</p>;

  const q = query.trim().toLowerCase();
  const shown = records.filter(
    (r) =>
      (!statusFilter || r.status === statusFilter) &&
      (!q || [r.full_name, r.index_number, r.email].some((v) => v.toLowerCase().includes(q))),
  );

  const mark = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await addRecord(session.id, form);
      setMessage(`Marked ${form.full_name}.`);
      setForm({ ...emptyRecord, status: form.status });
      load();
    } catch (err) {
      setError(errorText(err, 'Could not mark attendance.'));
    }
  };

  const bulkMark = async () => {
    setError('');
    setMessage('');
    try {
      const res = await bulkAddRecords(session.id, bulkText, bulkStatus);
      const { created, skipped } = res.data;
      setMessage(`Marked ${created.length} ${created.length === 1 ? 'person' : 'people'}.`);
      if (skipped.length) {
        setError(`Skipped ${skipped.length}: ${skipped.map((s) => s.line).join('; ')} (already marked or invalid).`);
      }
      setBulkText('');
      load();
    } catch (err) {
      setError(errorText(err, 'Could not mark attendance.'));
    }
  };

  const changeStatus = async (record: AttendanceRecord, status: AttendanceStatus) => {
    await updateRecord(record.id, { status });
    load();
  };

  const remove = async (record: AttendanceRecord) => {
    if (!confirm(`Remove ${record.full_name} from this session?`)) return;
    await deleteRecord(record.id);
    load();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <Link href="/admin/attendance" className="text-sm text-blue-700 hover:underline">← All sessions</Link>
          <h1 className="text-2xl font-bold text-blue-950">{session.title}</h1>
          <p className="text-gray-600 text-sm">
            {session.date}{session.event_name ? ` · ${session.event_name}` : ''} · {session.present} present, {session.late} late, {session.absent} absent
          </p>
        </div>
        {canExport && (
          <button
            onClick={() => exportSession(session)}
            className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2"
          >
            <FaFileExcel /> Export to Excel
          </button>
        )}
      </div>

      {message && <p className="text-green-700 text-sm">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {canTake && (
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={mark} className="bg-white border border-gray-300 rounded p-4 space-y-3">
            <h2 className="font-semibold">Mark one person</h2>
            <input
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Full name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="border border-gray-300 rounded px-3 py-2"
                placeholder="Index number (optional)"
                value={form.index_number}
                onChange={(e) => setForm({ ...form, index_number: e.target.value })}
              />
              <input
                type="email"
                className="border border-gray-300 rounded px-3 py-2"
                placeholder="Email (optional)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                className="border border-gray-300 rounded px-3 py-2"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as AttendanceStatus })}
              >
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Mark
              </button>
            </div>
          </form>

          <div className="bg-white border border-gray-300 rounded p-4 space-y-3">
            <h2 className="font-semibold">Mark many at once</h2>
            <p className="text-xs text-gray-500">One person per line: <code>Full name, index number</code>. You can paste straight from a spreadsheet.</p>
            <textarea
              rows={5}
              className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm"
              placeholder={"Ama Mensah, 20512345\nKwame Boateng, 20554321"}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <select
                className="border border-gray-300 rounded px-3 py-2"
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as AttendanceStatus)}
              >
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <button
                type="button"
                disabled={!bulkText.trim()}
                onClick={bulkMark}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
              >
                Mark all
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center border-b border-blue-500 py-2 w-full max-w-md">
          <input
            className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
            type="search"
            placeholder="Search by name, index number or email"
            aria-label="Search people in this session"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <BiSearch size={24} />
        </div>
        <select
          aria-label="Filter by status"
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AttendanceStatus | '')}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span className="text-sm text-gray-500">{shown.length} of {records.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-start">Name</th>
              <th className="py-2 px-4 border-b text-start">Index number</th>
              <th className="py-2 px-4 border-b text-start">Status</th>
              <th className="py-2 px-4 border-b text-start">Marked by</th>
              {canTake && <th className="py-2 px-4 border-b text-start">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={5} className="py-4 px-4 text-gray-500">
                {records.length === 0 ? 'Nobody marked yet.' : 'Nobody matches your search.'}
              </td></tr>
            )}
            {shown.map((r) => (
              <tr key={r.id}>
                <td className="py-2 px-4 border-b">
                  <div className="font-medium">{r.full_name}</div>
                  {r.email && <div className="text-xs text-gray-500">{r.email}</div>}
                </td>
                <td className="py-2 px-4 border-b">{r.index_number || '—'}</td>
                <td className="py-2 px-4 border-b">
                  {canTake ? (
                    <select
                      aria-label={`Status for ${r.full_name}`}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      value={r.status}
                      onChange={(e) => changeStatus(r, e.target.value as AttendanceStatus)}
                    >
                      {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  ) : (
                    STATUSES.find((s) => s.value === r.status)?.label
                  )}
                </td>
                <td className="py-2 px-4 border-b text-sm text-gray-600">{r.marked_by || '—'}</td>
                {canTake && (
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => remove(r)} className="text-red-600" aria-label={`Remove ${r.full_name}`}><BsTrash /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
