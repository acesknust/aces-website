'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Users,
  ExternalLink,
  Clock,
  GraduationCap,
  XCircle,
  ImageIcon,
  X,
  Sparkles,
  Maximize2,
  Share2
} from 'lucide-react'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { format } from 'date-fns'

interface Scholarship {
  id: string | number;
  name: string;
  description: string;
  image?: string;
  link?: string;
  eligibility?: string;
  deadline?: string;
  status: "active" | "closed" | "upcoming";
  lastUpdated: string;
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
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

const shineVariants = {
  rest: { x: '-100%' },
  hover: {
    x: '100%',
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      duration: 1.5,
      ease: "linear",
      repeatDelay: 0.5
    }
  }
};

function parseDeadline(deadlineStr: string | undefined): { date: Date | null; isExpired: boolean; daysLeft: number | null } {
  if (!deadlineStr || deadlineStr.trim() === '') {
    return { date: null, isExpired: false, daysLeft: null };
  }

  const parsed = new Date(deadlineStr);

  if (isNaN(parsed.getTime())) {
    return { date: null, isExpired: false, daysLeft: null };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);

  const diffTime = parsed.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    date: parsed,
    isExpired: daysLeft < 0,
    daysLeft: daysLeft
  };
}

function parseEligibility(text: string | undefined): React.ReactNode {
  if (!text) return null;

  try {
    const json = JSON.parse(text);
    if (typeof json === 'object') {
      // Ignore JSON object logic as we migrated, but keep safe catch
    }
  } catch (e) { }

  const items = text.split(',').map(s => s.trim()).filter(s => s.length > 0);

  if (items.length > 0) {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-100/50 text-blue-700 text-xs font-semibold border border-blue-200 shadow-sm">
            {item}
          </span>
        ))}
      </div>
    );
  }

  return <span className="text-sm text-gray-700 leading-relaxed font-medium">{text}</span>;
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Rolling / Not specified';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) {
    return dateString;
  }
}

function ScholarshipSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4"
        >
          <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-50 rounded-xl animate-pulse"></div>
        </motion.div>
      ))}
    </div>
  );
}

export default function ScholarshipCards() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchScholarships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/scholarships/`);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      const data = await response.json();
      setScholarships(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching scholarship data:', err);
      setError('Failed to load scholarships.');
      setScholarships([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  const filteredScholarships = useMemo(() => {
    // 1. Filter first
    const filtered = scholarships.filter(s => {
      const { isExpired } = parseDeadline(s.deadline);
      if (filter === 'active') return !isExpired;
      if (filter === 'expired') return isExpired;
      return true;
    });

    // 2. Sort: Urgent First (Lowest days left) for Active/All
    return filtered.sort((a, b) => {
      const deadlineA = parseDeadline(a.deadline);
      const deadlineB = parseDeadline(b.deadline);

      // Handle null cases (push to back)
      if (deadlineA.daysLeft === null && deadlineB.daysLeft === null) return 0;
      if (deadlineA.daysLeft === null) return 1;
      if (deadlineB.daysLeft === null) return -1;

      // Ensure we compare numbers
      const daysA = deadlineA.daysLeft || 9999;
      const daysB = deadlineB.daysLeft || 9999;

      // Logic:
      // If we are looking at 'Expired', we probably want 'Recently Expired' (Highest negative number, closer to 0) first?
      // Or maybe 'Oldest Expired'?
      // Typically 'Recently Expired' is more relevant. '-1 days' > '-100 days'.
      // If Active, '1 day left' < '100 days left'.

      if (filter === 'expired') {
        return daysB - daysA; // Descending (e.g. -1 vs -10: -1 is larger) -> Shows recently expired first
      }

      return daysA - daysB; // Ascending (Urgent first)
    });
  }, [scholarships, filter]);

  const counts = useMemo(() => {
    let active = 0, expired = 0;
    scholarships.forEach(s => {
      const { isExpired } = parseDeadline(s.deadline);
      if (isExpired) expired++;
      else active++;
    });
    return { active, expired, total: scholarships.length };
  }, [scholarships]);

  const handleShare = async (scholarship: Scholarship) => {
    const title = `Check out this scholarship: ${scholarship.name}`;
    const text = `I found this scholarship on the ACES Website! \n\n${scholarship.name}\n${scholarship.description?.substring(0, 100)}...`;
    const url = window.location.href; // Or specific scholarship URL if we had pages

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      // Fallback: WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (error) return <div className="bg-red-50 p-6 rounded-xl text-center"><p className="text-red-600 mb-2">{error}</p><button onClick={fetchScholarships} className="text-sm font-semibold underline">Retry</button></div>;

  return (
    <>
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-pointer backdrop-blur-md"
          >
            <motion.div layoutId={`image-${selectedImage}`} className="relative max-w-5xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
              <Image src={selectedImage} alt="Detail" fill className="object-contain" />
              <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-colors"><X className="w-6 h-6" /></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {(['all', 'active', 'expired'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`relative overflow-hidden px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform active:scale-95 ${filter === f ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-blue-200'}`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  <span className="opacity-80 text-xs">({f === 'all' ? counts.total : f === 'active' ? counts.active : counts.expired})</span>
                </span>
                {filter === f && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-blue-600 z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
              </button>
            ))}
          </motion.div>
        )}

        {loading ? <ScholarshipSkeleton /> : filteredScholarships.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200"
          >
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No {filter} scholarships found</h3>
            <button onClick={() => setFilter('all')} className="mt-2 text-blue-600 text-sm font-medium hover:underline">View all scholarships</button>
          </motion.div>
        ) : (
          <motion.div
            layout
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredScholarships.map((scholarship) => {
                const { isExpired, daysLeft } = parseDeadline(scholarship.deadline);

                return (
                  <motion.div
                    layout
                    key={scholarship.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    whileHover={!isExpired ? { scale: 1.02, translateY: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" } : {}}
                    className={`group relative bg-white rounded-3xl border ${isExpired ? 'border-gray-200 shadow-sm' : 'border-gray-100 shadow-md'} overflow-hidden transition-all duration-300`}
                  >
                    {/* SHINE EFFECT ON HOVER */}
                    {!isExpired && (
                      <motion.div
                        className="absolute inset-0 z-0 pointer-events-none w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                        variants={shineVariants}
                        initial="rest"
                        whileHover="hover"
                      />
                    )}

                    {/* Expired Center Overlay */}
                    {isExpired && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px] pointer-events-none">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
                          animate={{ scale: 1, opacity: 1, rotate: -6 }}
                          transition={{ type: "spring", delay: 0.2 }}
                          className="bg-gray-900/95 text-white px-10 py-5 rounded-2xl shadow-2xl border-4 border-white/30"
                        >
                          <h3 className="text-4xl font-black tracking-widest flex items-center gap-4">
                            <XCircle className="w-10 h-10 text-red-400" /> EXPIRED
                          </h3>
                        </motion.div>
                      </div>
                    )}

                    {/* Top Color Bar w/ Pulse */}
                    <div className={`h-2 w-full relative overflow-hidden ${isExpired ? 'bg-gray-300' : daysLeft !== null && daysLeft <= 7 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600'}`}>
                      {!isExpired && <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 bg-white/30 w-1/2 skew-x-12" />}
                    </div>

                    <div className={`p-6 md:p-8 ${isExpired ? 'opacity-40 grayscale-[0.8] blur-[0.5px]' : ''}`}>
                      {/* Header */}
                      <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
                        <div className="flex-1">
                          <h2 className={`text-2xl md:text-3xl font-bold ${isExpired ? 'text-gray-500' : 'text-gray-900 group-hover:text-blue-700 transition-colors'}`}>{scholarship.name}</h2>
                        </div>

                        {/* Days Left Badge */}
                        {!isExpired && daysLeft !== null && (
                          <motion.span
                            animate={daysLeft <= 7 ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${daysLeft <= 7 ? 'bg-red-50 text-red-600 border-red-100' :
                                daysLeft <= 30 ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                  'bg-green-50 text-green-600 border-green-100'
                              }`}
                          >
                            <Clock className="w-3.5 h-3.5" /> {daysLeft === 0 ? 'Due Today!' : `${daysLeft} days left`}
                          </motion.span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-8 leading-relaxed line-clamp-3 text-base md:text-lg">{scholarship.description}</p>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:bg-blue-50/50 transition-colors">
                          <div className="flex items-center gap-2 mb-2.5 text-gray-900 font-bold text-sm">
                            <Users className="w-4 h-4 text-blue-600" /> Eligibility
                          </div>
                          {parseEligibility(scholarship.eligibility)}
                        </div>
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:bg-red-50/50 transition-colors">
                          <div className="flex items-center gap-2 mb-2.5 text-gray-900 font-bold text-sm">
                            <Calendar className="w-4 h-4 text-red-600" /> Deadline
                          </div>
                          <p className="text-base font-semibold text-gray-800">{formatDate(scholarship.deadline)}</p>
                        </div>
                      </div>

                      {/* Footer Row */}
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 border-t border-gray-50 relative z-10 w-full">

                        {/* Desktop: Order 1 (Left), Mobile: Order 2 (Bottom) */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-2 sm:order-1 items-stretch sm:items-center">

                          {/* Actions Group: Share + Apply */}
                          <div className="flex gap-2 w-full sm:w-auto">
                            {!isExpired && (
                              <button
                                onClick={() => handleShare(scholarship)}
                                className="inline-flex items-center justify-center p-3.5 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-200 shadow-sm active:scale-95"
                                title="Share on WhatsApp"
                              >
                                <Share2 className="w-5 h-5 text-gray-600" />
                              </button>
                            )}

                            {scholarship.link && !isExpired && (
                              <Link
                                href={scholarship.link}
                                target="_blank"
                                className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 text-sm md:text-base group-hover:shadow-blue-200"
                              >
                                Apply Now <ExternalLink className="w-4 h-4" />
                              </Link>
                            )}
                          </div>

                          {/* Last Updated (Hidden on Mobile, shown on desktop next to buttons or below) */}
                          <span className="text-xs text-gray-400 font-medium hidden sm:block whitespace-nowrap ml-2 mt-2 sm:mt-0">Last updated: <span className="text-gray-500">{new Date(scholarship.lastUpdated).toLocaleDateString()}</span></span>
                        </div>

                        {/* Desktop: Order 2 (Right), Mobile: Order 1 (Top/Inline) */}
                        <div className="flex w-full sm:w-auto justify-between sm:justify-end items-end order-1 sm:order-2">
                          {/* Mobile Only Date Display (aligned left of image) */}
                          <span className="text-xs text-gray-400 font-medium sm:hidden">Last updated: <br /><span className="text-gray-500">{new Date(scholarship.lastUpdated).toLocaleDateString()}</span></span>

                          {scholarship.image && (
                            <motion.div
                              layoutId={`image-${scholarship.image}`}
                              onClick={() => setSelectedImage(scholarship.image || null)}
                              className="relative w-24 h-24 rounded-2xl overflow-hidden cursor-zoom-in border-2 border-white shadow-lg hover:shadow-xl hover:border-blue-400 transition-all bg-gray-100 shrink-0 group/img"
                              whileHover={{ scale: 1.1, rotate: 3 }}
                            >
                              <Image src={scholarship.image} alt="Thumbnail" fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
                                <Maximize2 className="w-6 h-6 text-white drop-shadow-md" />
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </>
  );
}