'use client';

import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent, DragEvent } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  User,
  Mail,
  Phone,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
  Clock,
  ChevronDown,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

interface Category {
  id: number;
  group_name: string;
  name: string;
  is_active: boolean;
}

export default function NominatePage() {
  // Page load & status state
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Selected Group and Category state
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');

  // Form Fields
  const [nomineeName, setNomineeName] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [nominatorName, setNominatorName] = useState('');
  const [nominatorPhone, setNominatorPhone] = useState('');
  const [nominatorEmail, setNominatorEmail] = useState('');
  const [hpWebsite, setHpWebsite] = useState(''); // Honeypot field

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

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

        // Remove any potential duplicate entries from API data
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

  // Handle Photo selection
  const handlePhotoSelect = (file: File) => {
    setFieldErrors((prev) => ({ ...prev, nominee_photo: '' }));

    // File type validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        nominee_photo: 'Please upload a valid image file (JPG, PNG, or WEBP).'
      }));
      return;
    }

    // File size validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        nominee_photo: 'Photo size must be less than 5MB.'
      }));
      return;
    }

    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoSelect(e.dataTransfer.files[0]);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  // Reset Form
  const resetForm = () => {
    setNomineeName('');
    setPhoto(null);
    setPhotoPreview(null);
    setNominatorName('');
    setNominatorPhone('');
    setNominatorEmail('');
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
      errors.nominee_name = 'Nominee full name is required.';
    }

    if (!categoryId) {
      errors.category = 'Please select an award category.';
    }

    if (!photo) {
      errors.nominee_photo = 'Nominee photo is required.';
    }

    if (!nominatorName.trim()) {
      errors.nominator_name = 'Your name is required.';
    }

    if (!nominatorPhone.trim()) {
      errors.nominator_phone = 'Your phone number is required.';
    } else if (!/^\+?[0-9\s\-\(\)]{7,20}$/.test(nominatorPhone.trim())) {
      errors.nominator_phone = 'Please enter a valid phone number.';
    }

    if (!nominatorEmail.trim()) {
      errors.nominator_email = 'Your email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nominatorEmail.trim())) {
      errors.nominator_email = 'Please enter a valid email address.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('nominee_name', nomineeName.trim());
      formData.append('category', categoryId);
      if (photo) formData.append('nominee_photo', photo);
      formData.append('nominator_name', nominatorName.trim());
      formData.append('nominator_phone', nominatorPhone.trim());
      formData.append('nominator_email', nominatorEmail.trim().toLowerCase());
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

      {/* Untouched Navy Gradient Header Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs sm:text-sm font-semibold mb-4 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            ACES Annual Dinner & Awards 2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Awards <span className="text-blue-500">Nominations</span>
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
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Checking nomination status...</p>
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-6">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              Nominations Are Currently Closed
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8 text-base leading-relaxed">
              Public nominations for the ACES Annual Awards 2026 are currently closed. Please check back later or monitor official departmental channels for updates.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              Nomination Submitted!
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8 text-base leading-relaxed">
              Thank you for submitting your nomination. Your entry has been recorded and will be evaluated by the awards committee.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
              >
                Submit Another Nomination
              </button>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Active Nomination Form Card */
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

            <form onSubmit={handleSubmit} className="space-y-10" noValidate>
              {/* Hidden Honeypot Input for Bot Deterrent */}
              <input
                type="text"
                name="hp_website"
                value={hpWebsite}
                onChange={(e) => setHpWebsite(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* SECTION 1: NOMINEE DETAILS */}
              <div>
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Nominee Details</h2>
                    <p className="text-xs text-gray-500">Provide details of the person you are nominating</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Nominee Full Name */}
                  <div>
                    <label htmlFor="nominee_name" className="block text-sm font-bold text-gray-800 mb-2">
                      Nominee Full Name <span className="text-red-500">*</span>
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
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all ${
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

                  {/* Award Category Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Group Selector */}
                    <div>
                      <label htmlFor="selected_group" className="block text-sm font-bold text-gray-800 mb-2">
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
                          className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer font-medium"
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
                      <label htmlFor="category" className="block text-sm font-bold text-gray-800 mb-2">
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
                          className={`w-full pl-12 pr-10 py-3.5 rounded-xl border bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer ${
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

                  {/* Nominee Photo Drag & Drop Zone */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Nominee Photo <span className="text-red-500">*</span>
                    </label>

                    {!photoPreview ? (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                          isDragging
                            ? 'border-blue-600 bg-blue-50/50'
                            : fieldErrors.nominee_photo
                            ? 'border-red-300 bg-red-50/20'
                            : 'border-gray-200 bg-gray-50/30 hover:border-blue-400 hover:bg-blue-50/20'
                        }`}
                      >
                        <input
                          id="nominee_photo_input"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleFileInputChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label="Upload Nominee Photo"
                        />
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Camera className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-gray-900 mb-1">
                          Click or drag a photo here
                        </p>
                        <p className="text-xs text-gray-500">
                          Supports JPG, PNG, or WEBP (Max size: 5MB)
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 border border-gray-200 rounded-2xl bg-gray-50/50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-600 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photoPreview}
                              alt="Nominee Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                              {photo?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {photo ? (photo.size / (1024 * 1024)).toFixed(2) : 0} MB
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={removePhoto}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Remove Photo"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {fieldErrors.nominee_photo && (
                      <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {fieldErrors.nominee_photo}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: YOUR DETAILS (NOMINATOR) */}
              <div>
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Your Details</h2>
                    <p className="text-xs text-gray-500">Your contact details as the nominator</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Nominator Full Name */}
                  <div>
                    <label htmlFor="nominator_name" className="block text-sm font-bold text-gray-800 mb-2">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="nominator_name"
                        type="text"
                        required
                        value={nominatorName}
                        onChange={(e) => {
                          setNominatorName(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, nominator_name: '' }));
                        }}
                        placeholder="e.g. Abena Osei"
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all ${
                          fieldErrors.nominator_name ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {fieldErrors.nominator_name && (
                      <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {fieldErrors.nominator_name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Nominator Phone */}
                    <div>
                      <label htmlFor="nominator_phone" className="block text-sm font-bold text-gray-800 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          id="nominator_phone"
                          type="tel"
                          required
                          value={nominatorPhone}
                          onChange={(e) => {
                            setNominatorPhone(e.target.value);
                            setFieldErrors((prev) => ({ ...prev, nominator_phone: '' }));
                          }}
                          placeholder="0241234567"
                          className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all ${
                            fieldErrors.nominator_phone ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                          }`}
                        />
                      </div>
                      {fieldErrors.nominator_phone && (
                        <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {fieldErrors.nominator_phone}
                        </p>
                      )}
                    </div>

                    {/* Nominator Email */}
                    <div>
                      <label htmlFor="nominator_email" className="block text-sm font-bold text-gray-800 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          id="nominator_email"
                          type="email"
                          required
                          value={nominatorEmail}
                          onChange={(e) => {
                            setNominatorEmail(e.target.value);
                            setFieldErrors((prev) => ({ ...prev, nominator_email: '' }));
                          }}
                          placeholder="student@knust.edu.gh"
                          className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all ${
                            fieldErrors.nominator_email ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                          }`}
                        />
                      </div>
                      {fieldErrors.nominator_email && (
                        <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {fieldErrors.nominator_email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:shadow-none cursor-pointer"
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
                  Your information is secure & strictly used for nomination verification.
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
