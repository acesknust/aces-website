import axiosInstance from "./axios";

export type AttendanceStatus = 'present' | 'late' | 'absent';

export interface AttendanceSession {
  id: number;
  title: string;
  date: string;
  event: number | null;
  event_name: string | null;
  notes: string;
  created_by: string | null;
  created_at: string;
  total: number;
  present: number;
  late: number;
  absent: number;
}

export interface AttendanceRecord {
  id: number;
  session: number;
  full_name: string;
  index_number: string;
  email: string;
  status: AttendanceStatus;
  note: string;
  marked_by: string | null;
  marked_at: string;
}

export const getSessions = () => axiosInstance.get<AttendanceSession[]>('/attendance/sessions/');
export const getSession = (id: string | number) => axiosInstance.get<AttendanceSession>(`/attendance/sessions/${id}/`);
export const createSession = (data: Partial<AttendanceSession>) =>
  axiosInstance.post<AttendanceSession>('/attendance/sessions/', data);
export const deleteSession = (id: number) => axiosInstance.delete(`/attendance/sessions/${id}/`);

export const getRecords = (sessionId: string | number) =>
  axiosInstance.get<AttendanceRecord[]>(`/attendance/sessions/${sessionId}/records/`);
export const addRecord = (sessionId: string | number, data: Partial<AttendanceRecord>) =>
  axiosInstance.post<AttendanceRecord>(`/attendance/sessions/${sessionId}/records/`, data);
export const bulkAddRecords = (sessionId: string | number, text: string, status: AttendanceStatus) =>
  axiosInstance.post<{ created: AttendanceRecord[]; skipped: { line: string; errors: Record<string, string[]> }[] }>(
    `/attendance/sessions/${sessionId}/records/bulk/`,
    { text, status },
  );
export const updateRecord = (id: number, data: Partial<AttendanceRecord>) =>
  axiosInstance.patch<AttendanceRecord>(`/attendance/records/${id}/`, data);
export const deleteRecord = (id: number) => axiosInstance.delete(`/attendance/records/${id}/`);

/** Download the session as an .xlsx file. */
export async function exportSession(session: AttendanceSession) {
  const res = await axiosInstance.get(`/attendance/sessions/${session.id}/export/`, { responseType: 'blob' });
  const disposition: string = res.headers['content-disposition'] || '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match ? match[1] : `attendance_${session.date}.xlsx`;
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
