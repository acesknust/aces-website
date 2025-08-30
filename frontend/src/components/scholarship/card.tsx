'use client'
import Image from 'next/image'
import Link from 'next/link'
import { BiSolidRightArrowCircle, BiCalendar, BiMoney, BiUser, BiBook } from 'react-icons/bi'
import { getScholarships } from '../../app/api/scholarship'
import { useEffect, useState, useCallback } from 'react'
import { CardSkeletons } from '../skeletons'

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  description: string;
  eligibility: {
    targetStudents: string[];
    yearLevels: string[];
    nationality: string[];
    institution: string[];
    programType: string[];
    colleges?: string[];
    minimumGrade?: string;
    wassce?: string;
    excludedApplicants?: string[];
  };
  benefits: {
    amount?: string;
    duration: string;
    additionalBenefits?: string[];
  };
  requirements: {
    documents: string[];
    essays: {
      title: string;
      instructions: string;
      submissionMethod?: string;
    }[];
    formatting: {
      font: string;
      fontSize: number;
      spacing: string;
    };
  };
  applicationProcess: {
    submissionLocation: string;
    submissionMethod: string;
    envelopeRequirements: string[];
    interviewProcess: boolean;
  };
  deadlines: {
    submissionDeadline: string;
    applicationPeriod?: string;
  };
  contact: {
    office: string;
    email?: string;
    applicationForm?: string;
  };
  status: "active" | "closed" | "upcoming";
  lastUpdated: string;
}

export default function Card() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const response = await fetch('/data/scholarshipData.json');
        const data = await response.json();
        setScholarships(data.Scholarship || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching scholarship data:', error);
        setScholarships([]);
        setLoading(false);
      }
    };

    fetchScholarships();
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  if (loading === false && scholarships.length === 0) {
    return (
      <div>
        <p className="lg:text-5xl text-3xl text-gray-400 text-center h-screen">No scholarships data yet</p>
      </div>
    );
  }

  return (
    <div>
      {loading ? (
        <CardSkeletons />
      ) : (
        <div className="space-y-6">
          {scholarships.map((scholarship) => (
            <div
              key={scholarship.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Header Section */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{scholarship.name}</h2>
                  <p className="text-lg text-blue-600 font-medium">{scholarship.provider}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(scholarship.status)}`}>
                  {scholarship.status.charAt(0).toUpperCase() + scholarship.status.slice(1)}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6 leading-relaxed">{scholarship.description}</p>

              {/* Key Details Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Benefits */}
                <div className="flex items-start space-x-3">
                  <BiMoney className="text-green-500 text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Benefits</h4>
                    {scholarship.benefits.amount && (
                      <p className="text-sm text-gray-600">{scholarship.benefits.amount}</p>
                    )}
                    <p className="text-sm text-gray-600">{scholarship.benefits.duration}</p>
                  </div>
                </div>

                {/* Eligibility */}
                <div className="flex items-start space-x-3">
                  <BiUser className="text-blue-500 text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Eligibility</h4>
                    <p className="text-sm text-gray-600">
                      {scholarship.eligibility.yearLevels.join(', ')}
                    </p>
                    {scholarship.eligibility.minimumGrade && (
                      <p className="text-sm text-gray-600">Min Grade: {scholarship.eligibility.minimumGrade}</p>
                    )}
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-start space-x-3">
                  <BiCalendar className="text-red-500 text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Deadline</h4>
                    <p className="text-sm text-gray-600">{scholarship.deadlines.submissionDeadline}</p>
                  </div>
                </div>

                {/* Application Method */}
                <div className="flex items-start space-x-3">
                  <BiBook className="text-purple-500 text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Application</h4>
                    <p className="text-sm text-gray-600">{scholarship.applicationProcess.submissionMethod}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Link
                  href={`/scholarships/${scholarship.id}`}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Details <BiSolidRightArrowCircle className="ml-2" />
                </Link>
                
                {scholarship.contact.applicationForm ? (
                  <Link
                    href={scholarship.contact.applicationForm}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Apply Now <BiSolidRightArrowCircle className="ml-2" />
                  </Link>
                ) : scholarship.contact.email ? (
                  <Link
                    href={`mailto:${scholarship.contact.email}`}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Contact via Email <BiSolidRightArrowCircle className="ml-2" />
                  </Link>
                ) : (
                  <div className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                    Contact: {scholarship.contact.office}
                  </div>
                )}
              </div>

              {/* Last Updated */}
              <p className="text-xs text-gray-500 mt-4">
                Last updated: {new Date(scholarship.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}