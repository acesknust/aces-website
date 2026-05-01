'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Book, AlertCircle, RefreshCw, GraduationCap, Search, FileText, FileArchive, Presentation, Layers, ExternalLink } from 'lucide-react'
import { useEffect, useState, useCallback, useMemo } from 'react'

interface CourseResource {
  id: number;
  title: string;
  resource_type: 'slides' | 'past_exam' | 'tutorial' | 'lab_manual' | 'assignment' | 'textbook' | 'project' | 'other';
  download_url: string;
  file_extension: string;
  file_size: number | null;
  download_count: number;
  created_at: string;
}

interface Course {
  id: number;
  name: string;
  code: string | null;
  resource_url: string | null;
  credits?: number;
  description?: string;
  resource_count: number;
  resources: CourseResource[];
  _year?: number;
  _semester?: number;
  _semesterName?: string;
}

interface Semester {
  id: number;
  semester_number: number;
  courses: Course[];
  semester_name?: string;
}

interface Year {
  year: number;
  semesters: Semester[];
  year_name?: string;
}

// Color palette for each year
const yearThemes: Record<number, { accent: string; accentLight: string; accentBorder: string; pillActive: string; pillText: string }> = {
  1: { accent: '#2563eb', accentLight: '#eff6ff', accentBorder: '#bfdbfe', pillActive: 'bg-blue-600 text-white shadow-lg shadow-blue-200', pillText: 'text-blue-700' },
  2: { accent: '#059669', accentLight: '#ecfdf5', accentBorder: '#a7f3d0', pillActive: 'bg-emerald-600 text-white shadow-lg shadow-emerald-200', pillText: 'text-emerald-700' },
  3: { accent: '#d97706', accentLight: '#fffbeb', accentBorder: '#fde68a', pillActive: 'bg-amber-600 text-white shadow-lg shadow-amber-200', pillText: 'text-amber-700' },
  4: { accent: '#7c3aed', accentLight: '#f5f3ff', accentBorder: '#c4b5fd', pillActive: 'bg-violet-600 text-white shadow-lg shadow-violet-200', pillText: 'text-violet-700' },
};

const yearNames: Record<number, string> = { 1: 'Freshman', 2: 'Sophomore', 3: 'Junior', 4: 'Senior' };

function getFileIcon(ext: string) {
  if (ext?.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
  if (ext?.includes('zip') || ext?.includes('rar')) return <FileArchive className="w-4 h-4 text-purple-500" />;
  if (ext?.includes('ppt')) return <Presentation className="w-4 h-4 text-orange-500" />;
  return <Layers className="w-4 h-4 text-blue-500" />;
}

function formatSize(bytes: number | null) {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

// ─── Single Course Card ───
function CourseCard({ course, yearNum, trackDownload }: { course: Course; yearNum: number; trackDownload: (id: number) => void }) {
  const theme = yearThemes[yearNum] || yearThemes[1];
  const mainResource = course.resources?.[0];
  const downloadUrl = mainResource?.download_url || course.resource_url;
  const fileExt = mainResource?.file_extension || '';
  const isExternal = downloadUrl?.includes('drive.google') || downloadUrl?.includes('firebase');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Color accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}88)` }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Course name */}
        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
          {course.name}
        </h3>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {course.code && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg" style={{ backgroundColor: theme.accentLight, color: theme.accent, border: `1px solid ${theme.accentBorder}` }}>
              {course.code}
            </span>
          )}
          {course.credits && (
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-100">
              {course.credits} Credits
            </span>
          )}
          {fileExt && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-lg uppercase">
              {fileExt}
            </span>
          )}
        </div>

        {/* Resource info */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          {getFileIcon(fileExt)}
          <span>{course.resource_count} {course.resource_count === 1 ? 'resource' : 'resources'}</span>
          {mainResource?.file_size && <span>· {formatSize(mainResource.file_size)}</span>}
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        {/* Download button */}
        {downloadUrl ? (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => mainResource && trackDownload(mainResource.id)}
            className="flex items-center justify-center gap-2.5 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-blue-100 group-hover:scale-[1.02]"
          >
            {isExternal ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            {isExternal ? 'Open Resource' : 'Download'}
          </a>
        ) : (
          <div className="flex items-center justify-center w-full py-3 bg-gray-50 text-gray-400 text-sm font-medium rounded-xl border border-dashed border-gray-200">
            No resources yet
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───
export default function CoursesCard() {
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/courses/years/`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data: Year[] = await res.json();
      // Tag each course with its year/semester for search
      data.forEach(y => y.semesters.forEach(s => s.courses.forEach(c => {
        c._year = y.year;
        c._semester = s.semester_number;
        c._semesterName = s.semester_name;
      })));
      setYears(data);
      if (data.length > 0) setSelectedYear(data[0].year);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const trackDownload = useCallback((id: number) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${apiUrl}/api/courses/resources/${id}/track/`, { method: 'POST' }).catch(() => {});
  }, []);

  // Derived data
  const totalCourses = useMemo(() => years.reduce((a, y) => a + y.semesters.reduce((b, s) => b + s.courses.length, 0), 0), [years]);
  const currentYear = years.find(y => y.year === selectedYear);
  const currentSemester = currentYear?.semesters.find(s => s.semester_number === selectedSemester);
  const currentCourses = currentSemester?.courses || [];
  const semesterCount = currentYear?.semesters.length || 2;

  // All courses flat (for search)
  const allCourses = useMemo(() => years.flatMap(y => y.semesters.flatMap(s => s.courses)), [years]);
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allCourses.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.code && c.code.toLowerCase().includes(q))
    );
  }, [searchQuery, allCourses]);

  // ─── Error State ───
  if (!loading && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center shadow-lg">
          <AlertCircle className="mx-auto text-red-500 w-12 h-12 mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Failed to Load Courses</h2>
          <p className="text-red-600 text-sm mb-6">{error}</p>
          <button onClick={() => { setRetryCount(r => r + 1); fetchData(); }} className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all">
            <RefreshCw className="mr-2 w-4 h-4" /> Try Again {retryCount > 0 && `(${retryCount})`}
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Empty State ───
  if (!loading && years.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <Book className="mx-auto text-gray-300 w-16 h-16 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Courses Available</h2>
        <p className="text-gray-500">Course data is currently unavailable.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {loading ? (
        /* Loading Skeleton */
        <div className="space-y-6 animate-pulse">
          <div className="h-28 bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl" />
          <div className="h-14 bg-gray-100 rounded-2xl" />
          <div className="flex gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-12 w-28 bg-gray-100 rounded-xl" />)}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 bg-gray-50 rounded-2xl border border-gray-100" />)}
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

          {/* ── Hero Banner ── */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <GraduationCap className="w-7 h-7 text-white/80" />
                  <h2 className="text-xl md:text-2xl font-bold text-white">Computer Engineering</h2>
                </div>
                <p className="text-blue-200 text-sm">Access lecture slides, past questions, and study materials for every course.</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-2.5 text-center min-w-[80px]">
                  <div className="text-2xl font-bold text-white">{totalCourses}</div>
                  <div className="text-[11px] text-blue-200 font-medium">Courses</div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-2.5 text-center min-w-[80px]">
                  <div className="text-2xl font-bold text-white">{years.length}</div>
                  <div className="text-[11px] text-blue-200 font-medium">Years</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Search Bar ── */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              className="w-full pl-12 pr-20 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow text-sm"
              placeholder="Search by course name or code (e.g. COE 251)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                Clear
              </button>
            )}
          </div>

          {searchQuery ? (
            /* ── Search Results ── */
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-500 px-1">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
              </p>
              {searchResults.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map(course => (
                    <CourseCard key={course.id} course={course} yearNum={course._year || 1} trackDownload={trackDownload} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                  <Search className="mx-auto w-10 h-10 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-700">No courses found</h3>
                  <p className="text-gray-400 text-sm mt-1">Try a different course name or code</p>
                </div>
              )}
            </div>
          ) : (
            /* ── Normal View ── */
            <>
              {/* Year Pills + Semester Toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/80 rounded-2xl p-3 border border-gray-100">
                {/* Year Pills */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full sm:w-auto">
                  {years.map(y => {
                    const isActive = selectedYear === y.year;
                    const theme = yearThemes[y.year] || yearThemes[1];
                    return (
                      <button
                        key={y.year}
                        onClick={() => { setSelectedYear(y.year); setSelectedSemester(1); }}
                        className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isActive ? theme.pillActive : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                      >
                        Year {y.year}
                        <span className="hidden sm:inline ml-1.5 opacity-75 font-normal">· {y.year_name || yearNames[y.year]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Semester Toggle */}
                <div className="flex bg-white rounded-xl border border-gray-200 p-1 flex-shrink-0">
                  {Array.from({ length: semesterCount }, (_, i) => i + 1).map(sem => (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedSemester === sem ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                      Sem {sem}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year + Semester Summary */}
              <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Year {selectedYear} <span className="text-gray-400 font-normal">·</span>{' '}
                  <span className="text-gray-500 font-medium">{currentSemester?.semester_name || `Semester ${selectedSemester}`}</span>
                </h3>
                <span className="text-sm text-gray-400 font-medium">{currentCourses.length} courses</span>
              </div>

              {/* Course Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedYear}-${selectedSemester}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  {currentCourses.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentCourses.map(course => (
                        <CourseCard key={course.id} course={course} yearNum={selectedYear} trackDownload={trackDownload} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                      <Book className="mx-auto w-10 h-10 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-700">No courses this semester</h3>
                      <p className="text-gray-400 text-sm mt-1">Try switching to a different semester</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}