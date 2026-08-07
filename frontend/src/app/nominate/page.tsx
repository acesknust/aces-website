'use client';

import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Award,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Clock,
  ChevronDown,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface Category {
  id: number;
  group_name: string;
  name: string;
  is_active: boolean;
}

export default function NominatePage() {
  const router = useRouter();

  // Page load & status state
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Selected Group and Category state
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');

  // Form Fields (Only Nominee Name & Nominee WhatsApp)
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeWhatsapp, setNomineeWhatsapp] = useState('');
  const [hpWebsite, setHpWebsite] = useState(''); // Honeypot field

  // Form Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'https://aces-backend-pgtot.ondigitalocean.app';
    }
    return 'http://localhost:8000';
  };

  const apiUrl = getApiUrl();

  // Fetch nomination status & categories
  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingStatus(true);
        setLoadError(null);

        // Fetch Status
        const statusRes = await fetch(`${apiUrl}/api/nominations/status/`);
        if (!statusRes.ok) throw new Error('Could not fetch nomination status.');
        const statusData = await statusRes.json();
        setIsOpen(statusData.is_open);

        // Fetch Categories
        const catRes = await fetch(`${apiUrl}/api/categories/`);
        if (!catRes.ok) throw new Error('Could not load categories.');
        const catData: Category[] = await catRes.json();

        // Remove duplicate entries
        const uniqueCategories = Array.from(
          new Map(catData.map((cat) => [cat.id, cat])).values()
        );
        setCategories(uniqueCategories);

        // Auto-select first group if available
        if (uniqueCategories.length > 0) {
          const firstGroup = uniqueCategories[0].group_name;
          setSelectedGroup(firstGroup);
        }
      } catch (err) {
        console.error(err);
        setLoadError('Unable to connect to the server. Please check your connection and refresh.');
      } finally {
        setLoadingStatus(false);
      }
    }
    fetchData();
  }, [apiUrl]);

  // Extract unique category groups
  const groups = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((cat) => set.add(cat.group_name));
    return Array.from(set);
  }, [categories]);

  // Filter categories by selected parent group
  const availableSubCategories = useMemo(() => {
    if (!selectedGroup) return categories;
    return categories.filter((cat) => cat.group_name === selectedGroup);
  }, [categories, selectedGroup]);

  // Reset Form
  const resetForm = () => {
    setNomineeName('');
    setNomineeWhatsapp('');
    setHpWebsite('');
    setCategoryId('');
    setFieldErrors({});
    setGeneralError(null);
    setIsSubmitted(false);
  };

  // Submit Handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    // Client-side validations
    const errors: Record<string, string> = {};

    if (!nomineeName.trim()) {
      errors.nominee_name = 'Nominee name is required.';
    }

    if (!nomineeWhatsapp.trim()) {
      errors.nominee_whatsapp = 'Nominee WhatsApp number is required.';
    } else if (!/^\+?[0-9\s\-\(\)]{7,20}$/.test(nomineeWhatsapp.trim())) {
      errors.nominee_whatsapp = 'Please enter a valid WhatsApp number.';
    }

    if (!categoryId) {
      errors.category = 'Please select an award category.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('nominee_name', nomineeName.trim());
      formData.append('nominee_whatsapp', nomineeWhatsapp.trim());
      formData.append('category', categoryId);
      if (hpWebsite) formData.append('hp_website', hpWebsite);

      const res = await fetch(`${apiUrl}/api/nominations/`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setIsSubmitted(true);
      } else if (res.status === 400 && data) {
        const parsedErrors: Record<string, string> = {};
        Object.keys(data).forEach((key) => {
          const val = data[key];
          parsedErrors[key] = Array.isArray(val) ? val.join(' ') : String(val);
        });

        if (parsedErrors.detail) {
          setGeneralError(parsedErrors.detail);
        }
        setFieldErrors(parsedErrors);
      } else {
        setGeneralError('Failed to submit nomination. Please check your information and try again.');
      }
    } catch {
      setGeneralError('Network error. Could not connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <Header />

      {/* Navy Gradient Header Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs sm:text-sm font-semibold mb-4 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            ACES Annual Dinner & Awards 2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-normal text-white mb-4">
            Awards <span className="text-blue-400">Nominations</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Recognizing excellence, leadership, and outstanding achievements within the Association of Computer Engineering Students.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 -mt-10 mb-20 relative z-20">
        {loadingStatus ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
            <Loader2 className="w-10 h-10 text-blue-950 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Checking nomination status...</p>
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-6">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-blue-950 text-white rounded-xl font-bold hover:bg-blue-900 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : !isOpen ? (
          /* Nominations Closed Screen */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center"
          >
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Nominations Are Currently Closed
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8 text-base leading-relaxed">
              Public nominations for the ACES Annual Awards 2026 are currently closed. Please check back later or monitor official departmental channels for updates.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-950 text-white rounded-xl font-bold hover:bg-blue-900 transition-all shadow-md hover:shadow-lg"
            >
              Return to Homepage
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : isSubmitted ? (
          /* Success Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 sm:p-12 text-center"
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Nomination Submitted!
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8 text-base leading-relaxed">
              Thank you for submitting your nomination. Your entry has been recorded and will be evaluated by the awards committee.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-6 py-3.5 bg-blue-950 text-white rounded-xl font-bold hover:bg-blue-900 transition-all shadow-md cursor-pointer"
              >
                Submit Another Nomination
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        ) : (
          /* Streamlined Nomination Form Card */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10"
          >
            {generalError && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-medium">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>{generalError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Hidden Honeypot Input */}
              <input
                type="text"
                name="hp_website"
                value={hpWebsite}
                onChange={(e) => setHpWebsite(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="pb-2 mb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-blue-950 tracking-normal">Nominee Information</h2>
                <p className="text-xs text-gray-500">Provide details of the person you are nominating</p>
              </div>

              {/* Nominee Name */}
              <div>
                <label htmlFor="nominee_name" className="block text-sm font-semibold text-blue-950 mb-2">
                  Nominee Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="nominee_name"
                    type="text"
                    required
                    value={nomineeName}
                    onChange={(e) => {
                      setNomineeName(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, nominee_name: '' }));
                    }}
                    placeholder="e.g. Kwame Mensah"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-950 focus:border-blue-950 outline-none transition-all ${
                      fieldErrors.nominee_name ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                    }`}
                  />
                </div>
                {fieldErrors.nominee_name && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fieldErrors.nominee_name}
                  </p>
                )}
              </div>

              {/* Nominee WhatsApp Number */}
              <div>
                <label htmlFor="nominee_whatsapp" className="block text-sm font-semibold text-blue-950 mb-2">
                  Nominee WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="nominee_whatsapp"
                    type="tel"
                    required
                    value={nomineeWhatsapp}
                    onChange={(e) => {
                      setNomineeWhatsapp(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, nominee_whatsapp: '' }));
                    }}
                    placeholder="e.g. 024XXXXXXX"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-950 focus:border-blue-950 outline-none transition-all ${
                      fieldErrors.nominee_whatsapp ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                    }`}
                  />
                </div>
                {fieldErrors.nominee_whatsapp && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fieldErrors.nominee_whatsapp}
                  </p>
                )}
              </div>

              {/* Award Category Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Group Selector */}
                <div>
                  <label htmlFor="selected_group" className="block text-sm font-semibold text-blue-950 mb-2">
                    Award Category Group <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      id="selected_group"
                      value={selectedGroup}
                      onChange={(e) => {
                        setSelectedGroup(e.target.value);
                        setCategoryId('');
                        setFieldErrors((prev) => ({ ...prev, category: '' }));
                      }}
                      className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-950 focus:border-blue-950 outline-none transition-all appearance-none cursor-pointer font-medium"
                    >
                      {groups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>

                {/* Specific Award Category Dropdown */}
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-blue-950 mb-2">
                    Award Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      id="category"
                      required
                      value={categoryId}
                      onChange={(e) => {
                        setCategoryId(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, category: '' }));
                      }}
                      className={`w-full pl-12 pr-10 py-3.5 rounded-xl border bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-950 focus:border-blue-950 outline-none transition-all appearance-none cursor-pointer ${
                        fieldErrors.category ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                      }`}
                    >
                      <option value="">-- Select Specific Award --</option>
                      {availableSubCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>
                  {fieldErrors.category && (
                    <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {fieldErrors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-blue-950 hover:bg-blue-900 active:bg-blue-950 text-white rounded-full font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:shadow-none cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting Nomination...
                    </>
                  ) : (
                    <>
                      Submit Nomination
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-gray-400" />
                  Your nomination is encrypted & strictly used for ACES awards verification.
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
