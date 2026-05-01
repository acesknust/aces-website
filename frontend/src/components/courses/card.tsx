'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Download, Book, AlertCircle, RefreshCw, GraduationCap, Info, Search, FileText, FileArchive, Presentation, Layers } from 'lucide-react'
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
  // For search context
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

interface CoursesData {
  program: string;
  description: string;
  years: Year[];
  metadata: {
    total_years: number;
    total_courses: number;
    resource_platforms: string[];
    last_updated: string;
  };
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const accordionVariants = {
  closed: { height: 0, opacity: 0 },
  open: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};

export default function CoursesCard() {
  const [coursesData, setCoursesData] = useState<CoursesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // New state for navigation
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [expandedSemesters, setExpandedSemesters] = useState<Set<string>>(new Set());
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCoursesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/courses/years/`);

      if (!response.ok) {
        throw new Error(`Failed to fetch courses data: ${response.status} ${response.statusText}`);
      }

      const yearsData = await response.json();

      const totalYears = yearsData.length;
      let totalCourses = 0;
      yearsData.forEach((year: Year) => {
        year.semesters.forEach((semester: Semester) => {
          totalCourses += semester.courses.length;
          // Add context for search results
          semester.courses.forEach(course => {
            course._year = year.year;
            course._semester = semester.semester_number;
            course._semesterName = semester.semester_name;
          });
        });
      });

      const transformedData: CoursesData = {
        program: "ACES",
        description: "Academic Course - Computer Engineering Curriculum",
        years: yearsData,
        metadata: {
          total_years: totalYears,
          total_courses: totalCourses,
          resource_platforms: ["Cloudflare R2", "Firebase", "Google Drive"],
          last_updated: new Date().toISOString()
        }
      };

      setCoursesData(transformedData);

      // Set first year as selected and expand first semester by default
      if (yearsData.length > 0) {
        setSelectedYear(yearsData[0].year);
        const firstSemester = yearsData[0].semesters[0];
        if (firstSemester) {
          setExpandedSemesters(new Set([`${yearsData[0].year}-${firstSemester.semester_number}`]));
        }
      }
    } catch (error) {
      console.error('Error fetching courses data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load courses data');
      setCoursesData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoursesData();
  }, [fetchCoursesData]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchCoursesData();
  }, [fetchCoursesData]);

  const toggleSemester = (yearNum: number, semesterNum: number) => {
    const key = `${yearNum}-${semesterNum}`;
    setExpandedSemesters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const getResourceType = (url: string) => {
    if (url.includes('firebase')) return 'Firebase';
    if (url.includes('drive.google.com')) return 'Drive';
    if (url.includes('.pdf')) return 'PDF';
    return 'Link';
  };

  const getYearColor = (year: number) => {
    const colors: Record<number, { bg: string; text: string; border: string; tab: string; tabActive: string }> = {
      1: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', tab: 'hover:bg-blue-50', tabActive: 'bg-blue-600 text-white' },
      2: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', tab: 'hover:bg-emerald-50', tabActive: 'bg-emerald-600 text-white' },
      3: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', tab: 'hover:bg-amber-50', tabActive: 'bg-amber-600 text-white' },
      4: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', tab: 'hover:bg-purple-50', tabActive: 'bg-purple-600 text-white' },
    };
    return colors[year] || colors[1];
  };

  const getYearName = (year: number) => {
    const names: Record<number, string> = { 1: 'Freshman', 2: 'Sophomore', 3: 'Junior', 4: 'Senior' };
    return names[year] || `Year ${year}`;
  };

  const getSemesterName = (semester: number) => {
    return semester === 1 ? 'First Semester' : semester === 2 ? 'Second Semester' : `Semester ${semester}`;
  };

  const trackDownload = (resourceId: number) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${apiUrl}/api/courses/resources/${resourceId}/track/`, { method: 'POST' }).catch(() => {});
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const selectedYearData = coursesData?.years.find(y => y.year === selectedYear);

  // Search logic
  const allCourses = useMemo(() => {
    if (!coursesData) return [];
    const flat: Course[] = [];
    coursesData.years.forEach(y => {
      y.semesters.forEach(s => {
        flat.push(...s.courses);
      });
    });
    return flat;
  }, [coursesData]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allCourses.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.resources && c.resources.some(r => r.title.toLowerCase().includes(q)))
    );
  }, [searchQuery, allCourses]);

// Separate component to hold per-card state (tooltips, tabs)
function CourseCardItem({ 
  course, 
  idx, 
  yearNum, 
  semNum, 
  searchQuery, 
  getResourceType, 
  trackDownload, 
  formatSize 
}: {
  course: Course, 
  idx: number, 
  yearNum: number, 
  semNum: number, 
  searchQuery: string,
  getResourceType: (url: string) => string,
  trackDownload: (id: number) => void,
  formatSize: (bytes: number | null) => string
}) {
  const [activeTooltip, setActiveTooltip] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'slides' | 'past_exam'>('all');

  const filteredResources = useMemo(() => {
    if (!course.resources) return [];
    if (activeTab === 'all') return course.resources;
    return course.resources.filter(r => r.resource_type === activeTab);
  }, [course.resources, activeTab]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="group bg-gray-50 hover:bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
            {course.name}
          </h4>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {course.code && (
              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
                {course.code}
              </span>
            )}
            {course.credits && (
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-md">
                {course.credits} Credits
              </span>
            )}
            {searchQuery && course._year && (
              <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-md">
                Y{course._year}S{course._semester}
              </span>
            )}
          </div>
        </div>
        <Book className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
      </div>

      <div className="mt-auto pt-3 flex flex-col h-full">
          {course.description && (
            <>
              <button
                onClick={() => setActiveTooltip(!activeTooltip)}
                className="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-colors mb-3 w-max"
              >
                <Info className="w-3.5 h-3.5" />
                <span className="text-xs">Course Info</span>
              </button>

              {/* Modal Overlay */}
              <AnimatePresence>
                {activeTooltip && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={() => setActiveTooltip(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 shrink-0 rounded-t-2xl">
                        <h3 className="text-white font-semibold">{course.name}</h3>
                        {course.code && <span className="text-blue-200 text-sm">{course.code}</span>}
                      </div>
                      <div className="p-4 overflow-y-auto">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{course.description}</p>
                      </div>
                      <div className="border-t p-3 flex justify-end shrink-0">
                        <button
                          onClick={() => setActiveTooltip(false)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          <div className="mt-auto">
            {course.resources && course.resources.length > 0 ? (
                <div className="space-y-2 mt-2">
                    {/* Filter Tabs */}
                    <div className="flex gap-1 border-b border-gray-100 pb-2 mb-2">
                      <button 
                        onClick={() => setActiveTab('all')}
                        className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md transition-colors ${activeTab === 'all' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
                      >
                        All ({course.resource_count})
                      </button>
                      <button 
                        onClick={() => setActiveTab('slides')}
                        className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md transition-colors ${activeTab === 'slides' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
                      >
                        Slides
                      </button>
                      <button 
                        onClick={() => setActiveTab('past_exam')}
                        className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md transition-colors ${activeTab === 'past_exam' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
                      >
                        Past Qs
                      </button>
                    </div>

                    <div className="max-h-[160px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                    {filteredResources.length > 0 ? filteredResources.map(res => (
                        <a
                            key={res.id}
                            href={res.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackDownload(res.id)}
                            className="group/link flex items-center justify-between p-2 rounded bg-white border border-gray-100 hover:border-blue-300 hover:shadow-sm transition-all text-sm"
                        >
                            <div className="flex items-center gap-2 overflow-hidden flex-1">
                                {res.file_extension?.includes('pdf') ? <FileText className="w-4 h-4 text-red-500 flex-shrink-0" /> : 
                                res.file_extension?.includes('zip') || res.file_extension?.includes('rar') ? <FileArchive className="w-4 h-4 text-purple-500 flex-shrink-0" /> :
                                res.file_extension?.includes('ppt') ? <Presentation className="w-4 h-4 text-orange-500 flex-shrink-0" /> :
                                <Layers className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                                <span className="text-gray-700 font-medium truncate group-hover/link:text-blue-600 transition-colors" title={res.title}>{res.title}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                {res.file_size && <span className="text-[10px] text-gray-400 hidden sm:inline-block">{formatSize(res.file_size)}</span>}
                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center group-hover/link:bg-blue-100 group-hover/link:text-blue-700 transition-colors">
                                    <Download className="w-3 h-3 text-blue-500" />
                                </div>
                            </div>
                        </a>
                    )) : (
                      <div className="text-xs text-gray-400 italic text-center py-2 bg-gray-50 rounded-lg">No {activeTab === 'slides' ? 'slides' : 'past questions'} available</div>
                    )}
                    </div>
                </div>
            ) : course.resource_url ? (
                <a
                  href={course.resource_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md group-hover:scale-[1.02] mt-2"
                >
                  <Download className="w-4 h-4" />
                  Legacy Download
                  <span className="text-xs opacity-70">({getResourceType(course.resource_url)})</span>
                </a>
            ) : (
                <div className="text-xs text-gray-400 italic text-center py-2 bg-gray-100 rounded-lg mt-2">No resources available</div>
            )}
          </div>
      </div>
    </motion.div>
  );
}

  // Error state
  if (!loading && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center shadow-lg"
        >
          <AlertCircle className="mx-auto text-red-500 w-12 h-12 mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Failed to Load Courses</h2>
          <p className="text-red-600 text-sm mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <RefreshCw className="mr-2 w-4 h-4" />
            Try Again {retryCount > 0 && `(${retryCount})`}
          </button>
        </motion.div>
      </div>
    );
  }

  // No data state
  if (!loading && !coursesData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Book className="mx-auto text-gray-300 w-16 h-16 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Courses Available</h2>
          <p className="text-gray-500">Course data is currently unavailable.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {loading ? (
        // Loading skeleton
        <div className="space-y-6">
          <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 w-24 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : coursesData ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-8"
        >
          {/* Compact Header */}
          <motion.div
            variants={cardVariants}
            className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <GraduationCap className="w-8 h-8 text-white/80" />
                  <h1 className="text-2xl font-bold text-white">{coursesData.program}</h1>
                </div>
                <p className="text-blue-100 text-sm">{coursesData.description}</p>
              </div>
              <div className="hidden md:flex gap-6 text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                  <div className="text-2xl font-bold text-white">{coursesData.metadata.total_courses}</div>
                  <div className="text-xs text-blue-200">Courses</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                  <div className="text-2xl font-bold text-white">{coursesData.metadata.total_years}</div>
                  <div className="text-xs text-blue-200">Years</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div variants={cardVariants} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-shadow hover:shadow-md"
              placeholder="Search courses by name or code (e.g. COE 252)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm font-medium text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </motion.div>

          {searchQuery ? (
            /* Search Results View */
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
            >
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-lg font-semibold text-gray-700">Search Results ({searchResults.length})</h2>
                </div>
                {searchResults.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.map((course, idx) => (
                            <CourseCardItem
                              key={course.id || idx}
                              course={course}
                              idx={idx}
                              yearNum={course._year || 0}
                              semNum={course._semester || 0}
                              searchQuery={searchQuery}
                              getResourceType={getResourceType}
                              trackDownload={trackDownload}
                              formatSize={formatSize}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <Search className="mx-auto w-12 h-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your search query</p>
                    </div>
                )}
            </motion.div>
          ) : (
            /* Year Tabs and Semester Accordions (Normal View) */
            <>
              {/* Year Tabs */}
              <motion.div
                variants={cardVariants}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
              >
                {coursesData.years.map((year) => {
                  const colors = getYearColor(year.year);
                  const isActive = selectedYear === year.year;
                  return (
                    <motion.button
                      key={year.year}
                      onClick={() => {
                        setSelectedYear(year.year);
                        // Expand first semester of selected year
                        const firstSem = year.semesters[0];
                        if (firstSem) {
                          setExpandedSemesters(new Set([`${year.year}-${firstSem.semester_number}`]));
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all duration-300
                        ${isActive
                          ? `${colors.tabActive} shadow-lg`
                          : `bg-white border-2 ${colors.border} ${colors.text} ${colors.tab}`
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{year.year}</span>
                        <span className="hidden sm:inline text-sm opacity-80">
                          {year.year_name || getYearName(year.year)}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Selected Year Content */}
              <AnimatePresence mode="wait">
                {selectedYearData && (
                  <motion.div
                    key={selectedYear}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Year Summary */}
                    <div className={`${getYearColor(selectedYear).bg} rounded-xl p-4 border ${getYearColor(selectedYear).border}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className={`text-xl font-bold ${getYearColor(selectedYear).text}`}>
                            Year {selectedYear} - {selectedYearData.year_name || getYearName(selectedYear)}
                          </h2>
                          <p className="text-gray-600 text-sm">
                            {selectedYearData.semesters.reduce((acc, s) => acc + s.courses.length, 0)} courses across {selectedYearData.semesters.length} semesters
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Semester Accordions */}
                    {selectedYearData.semesters.map((semester, index) => {
                      const isExpanded = expandedSemesters.has(`${selectedYear}-${semester.semester_number}`);
                      const colors = getYearColor(selectedYear);

                      return (
                        <motion.div
                          key={`${selectedYear}-${semester.semester_number}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
                        >
                          {/* Accordion Header */}
                          <button
                            onClick={() => toggleSemester(selectedYear, semester.semester_number)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center font-bold`}>
                                {semester.semester_number}
                              </div>
                              <div className="text-left">
                                <h3 className="font-semibold text-gray-900">
                                  {semester.semester_name || getSemesterName(semester.semester_number)}
                                </h3>
                                <p className="text-sm text-gray-500">{semester.courses.length} courses</p>
                              </div>
                            </div>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            </motion.div>
                          </button>

                          {/* Accordion Content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial="closed"
                                animate="open"
                                exit="closed"
                                variants={accordionVariants}
                                className="overflow-hidden"
                              >
                                <div className="px-6 pb-6">
                                  {semester.courses.length > 0 ? (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {semester.courses.map((course, idx) => (
                                        <CourseCardItem
                                          key={course.id || idx}
                                          course={course}
                                          idx={idx}
                                          yearNum={selectedYear}
                                          semNum={semester.semester_number}
                                          searchQuery={searchQuery}
                                          getResourceType={getResourceType}
                                          trackDownload={trackDownload}
                                          formatSize={formatSize}
                                        />
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-6 text-gray-400 text-sm italic">
                                        No courses in this semester yet.
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Footer */}
          <motion.div
            variants={cardVariants}
            className="text-center text-sm text-gray-500 pt-8 border-t border-gray-100"
          >
            <p>Resources available on: {coursesData.metadata.resource_platforms.join(' • ')}</p>
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
}