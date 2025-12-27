'use client'
import Link from 'next/link'
import { BiSolidRightArrowCircle, BiBook, BiCalendar, BiDownload, BiCode, BiError, BiRefresh } from 'react-icons/bi'
import { useEffect, useState, useCallback } from 'react'

interface Course {
  name: string;
  code: string | null;
  resource_url: string;
  credits?: number;
  prerequisite?: string;
  description?: string;
}

interface Semester {
  semester: number;
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
    version?: string;
    contact?: string;
  };
}

export default function CoursesCard() {
  const [coursesData, setCoursesData] = useState<CoursesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchCoursesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/data/aces_courses.json');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate the data structure
      if (!data.program || !data.years || !Array.isArray(data.years)) {
        throw new Error('Invalid courses data structure');
      }
      
      setCoursesData(data);
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

  const getResourceType = useCallback((url: string) => {
    if (url.includes('firebase')) return 'Firebase Storage';
    if (url.includes('drive.google.com')) return 'Google Drive';
    if (url.includes('github.com')) return 'GitHub';
    if (url.includes('dropbox.com')) return 'Dropbox';
    if (url.includes('onedrive')) return 'OneDrive';
    if (url.includes('.pdf')) return 'PDF Document';
    return 'External Link';
  }, []);

  const getYearColor = useCallback((year: number) => {
    switch (year) {
      case 1: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 2: return 'bg-green-100 text-green-800 border-green-200';
      case 3: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 4: return 'bg-purple-100 text-purple-800 border-purple-200';
      case 5: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const getSemesterName = useCallback((semester: number) => {
    switch (semester) {
      case 1: return 'First Semester';
      case 2: return 'Second Semester';
      case 3: return 'Summer Semester';
      default: return `Semester ${semester}`;
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, []);

  const getTotalCoursesByYear = useCallback((yearData: Year) => {
    return yearData.semesters.reduce((total, semester) => total + semester.courses.length, 0);
  }, []);

  // Error state
  if (!loading && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <BiError className="mx-auto text-red-500 text-4xl mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Courses</h2>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            <BiRefresh className="mr-2" />
            Try Again {retryCount > 0 && `(${retryCount})`}
          </button>
        </div>
      </div>
    );
  }

  // No data state (after successful load)
  if (!loading && !coursesData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <BiBook className="mx-auto text-gray-400 text-5xl mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Courses Available</h2>
          <p className="text-gray-500">Course data is currently unavailable. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {loading ? (
        // Enhanced loading state
        <div className="space-y-6">
          {/* Loading header */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-6 w-2/3"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-16"></div>
              ))}
            </div>
          </div>
          
          {/* Loading course cards */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="bg-gray-100 rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3 w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : coursesData ? (
        <div className="space-y-8">
          {/* Enhanced Program Header */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white rounded-xl p-8 mb-8 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-4xl font-bold mb-3">{coursesData.program}</h1>
                <p className="text-blue-100 text-lg leading-relaxed max-w-3xl">{coursesData.description}</p>
              </div>
              <div className="flex-shrink-0">
                <BiBook className="text-6xl text-white opacity-20" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{coursesData.metadata.total_years}</div>
                <div className="text-blue-100 text-sm">Academic Years</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{coursesData.metadata.total_courses}</div>
                <div className="text-blue-100 text-sm">Total Courses</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{coursesData.metadata.resource_platforms.length}</div>
                <div className="text-blue-100 text-sm">Resource Platforms</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-sm font-semibold">Last Updated</div>
                <div className="text-blue-100 text-xs">{formatDate(coursesData.metadata.last_updated)}</div>
              </div>
            </div>

            {/* Additional metadata */}
            {(coursesData.metadata.version || coursesData.metadata.contact) && (
              <div className="mt-6 pt-4 border-t border-white border-opacity-20">
                <div className="flex flex-wrap gap-4 text-sm text-blue-100">
                  {coursesData.metadata.version && (
                    <span>Version: {coursesData.metadata.version}</span>
                  )}
                  {coursesData.metadata.contact && (
                    <span>Contact: {coursesData.metadata.contact}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Course Years */}
          {coursesData.years.map((yearData) => (
            <div key={yearData.year} className="space-y-6">
              {/* Year Overview */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Year {yearData.year} {yearData.year_name && `- ${yearData.year_name}`}
                    </h2>
                    <p className="text-gray-600">
                      {getTotalCoursesByYear(yearData)} courses across {yearData.semesters.length} semesters
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getYearColor(yearData.year)}`}>
                    Year {yearData.year}
                  </span>
                </div>
              </div>

              {/* Semesters */}
              {yearData.semesters.map((semesterData) => (
                <div
                  key={`${yearData.year}-${semesterData.semester}`}
                  className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  {/* Enhanced Semester Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="mb-2 sm:mb-0">
                        <h3 className="text-xl font-bold text-gray-900">
                          {getSemesterName(semesterData.semester)}
                          {semesterData.semester_name && ` (${semesterData.semester_name})`}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Year {yearData.year} • {semesterData.courses.length} courses
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BiCalendar className="text-gray-400" />
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getYearColor(yearData.year)}`}>
                          {semesterData.courses.length} Courses
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Courses Grid */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {semesterData.courses.map((course, courseIndex) => (
                        <div
                          key={courseIndex}
                          className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 group"
                        >
                          {/* Enhanced Course Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-2 group-hover:text-blue-700 transition-colors">
                                {course.name}
                              </h4>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {course.code && (
                                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded border">
                                    {course.code}
                                  </span>
                                )}
                                {course.credits && (
                                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded border">
                                    {course.credits} Credits
                                  </span>
                                )}
                              </div>
                              {course.description && (
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {course.description}
                                </p>
                              )}
                              {course.prerequisite && (
                                <p className="text-xs text-orange-600 mb-2">
                                  <strong>Prerequisite:</strong> {course.prerequisite}
                                </p>
                              )}
                            </div>
                            <BiBook className="text-blue-500 text-xl flex-shrink-0 ml-3 group-hover:text-blue-600 transition-colors" />
                          </div>

                          {/* Enhanced Resource Info */}
                          <div className="flex items-center space-x-2 mb-4">
                            <BiCode className="text-gray-400 text-sm" />
                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {getResourceType(course.resource_url)}
                            </span>
                          </div>

                          {/* Enhanced Action Button */}
                          <Link
                            href={course.resource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow-md group-hover:scale-105"
                          >
                            <BiDownload className="mr-2 text-base" />
                            Access Resources
                            <BiSolidRightArrowCircle className="ml-2 text-base opacity-75" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Footer Information */}
          <div className="bg-gray-50 rounded-lg p-6 mt-12 border border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">
                <strong>{coursesData.program}</strong> - {coursesData.metadata.total_courses} courses across {coursesData.metadata.total_years} years
              </p>
              <p className="text-xs">
                Resources available on: {coursesData.metadata.resource_platforms.join(', ')}
              </p>
              <p className="text-xs mt-1">
                Last updated: {formatDate(coursesData.metadata.last_updated)}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}