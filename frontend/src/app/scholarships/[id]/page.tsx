'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BiArrowBack, 
  BiCalendar, 
  BiMoney, 
  BiUser, 
  BiBook, 
  BiPhone, 
  BiEnvelope,
  BiCheckCircle,
  BiInfoCircle,
  BiFilter,
  BiMapPin
} from 'react-icons/bi'


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

export default function ScholarshipDetails() {
  const params = useParams()
  const router = useRouter()
  const [scholarship, setScholarship] = useState<Scholarship | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        const response = await fetch('/data/scholarshipData.json')
        const data = await response.json()
        const scholarships = data.Scholarship || []
        const foundScholarship = scholarships.find((s: Scholarship) => s.id === params.id)
        
        if (foundScholarship) {
          setScholarship(foundScholarship)
        } else {
          setError('Scholarship not found')
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching scholarship:', error)
        setError('Failed to load scholarship details')
        setLoading(false)
      }
    }

    if (params.id) {
      fetchScholarship()
    }
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'closed': return 'bg-red-100 text-red-800 border-red-200'
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !scholarship) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <BiInfoCircle className="text-6xl text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Scholarship Not Found'}
          </h1>
          <p className="text-gray-600 mb-8">
            The scholarship you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/scholarships"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BiArrowBack className="mr-2" />
            Back to Scholarships
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <BiArrowBack className="mr-2" />
          Back to Scholarships
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{scholarship.name}</h1>
              <p className="text-xl text-blue-600 font-medium">{scholarship.provider}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(scholarship.status)}`}>
              {scholarship.status.charAt(0).toUpperCase() + scholarship.status.slice(1)}
            </span>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed">{scholarship.description}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Benefits */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="flex items-center text-xl font-semibold text-gray-900 mb-4">
              <BiMoney className="text-green-500 mr-2" />
              Benefits
            </h2>
            <div className="space-y-3">
              {scholarship.benefits.amount && (
                <div className="flex items-center">
                  <BiCheckCircle className="text-green-500 mr-2" />
                  <span className="font-medium">Amount: {scholarship.benefits.amount}</span>
                </div>
              )}
              <div className="flex items-center">
                <BiCheckCircle className="text-green-500 mr-2" />
                <span>Duration: {scholarship.benefits.duration}</span>
              </div>
              {scholarship.benefits.additionalBenefits?.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <BiCheckCircle className="text-green-500 mr-2" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="flex items-center text-xl font-semibold text-gray-900 mb-4">
              <BiCalendar className="text-red-500 mr-2" />
              Important Dates
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <BiCheckCircle className="text-red-500 mr-2" />
                <div>
                  <span className="font-medium">Submission Deadline: </span>
                  <span className="text-red-600">{scholarship.deadlines.submissionDeadline}</span>
                </div>
              </div>
              {scholarship.deadlines.applicationPeriod && (
                <div className="flex items-center">
                  <BiCheckCircle className="text-red-500 mr-2" />
                  <span>Application Period: {scholarship.deadlines.applicationPeriod}</span>
                </div>
              )}
              <div className="text-sm text-gray-500">
                Last Updated: {new Date(scholarship.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="flex items-center text-xl font-semibold text-gray-900 mb-4">
            <BiUser className="text-blue-500 mr-2" />
            Eligibility Criteria
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Target Students</h3>
                <ul className="space-y-1">
                  {scholarship.eligibility.targetStudents.map((student, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <BiCheckCircle className="text-blue-500 mr-2 text-sm" />
                      {student}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Year Levels</h3>
                <ul className="space-y-1">
                  {scholarship.eligibility.yearLevels.map((level, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <BiCheckCircle className="text-blue-500 mr-2 text-sm" />
                      {level}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Institutions</h3>
                <ul className="space-y-1">
                  {scholarship.eligibility.institution.map((inst, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <BiCheckCircle className="text-blue-500 mr-2 text-sm" />
                      {inst}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              {scholarship.eligibility.colleges && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Eligible Colleges</h3>
                  <ul className="space-y-1">
                    {scholarship.eligibility.colleges.map((college, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <BiCheckCircle className="text-blue-500 mr-2 text-sm" />
                        {college}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {scholarship.eligibility.minimumGrade && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Minimum Grade</h3>
                  <p className="text-gray-700">{scholarship.eligibility.minimumGrade}</p>
                </div>
              )}
              {scholarship.eligibility.wassce && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">WASSCE Requirement</h3>
                  <p className="text-gray-700">{scholarship.eligibility.wassce}</p>
                </div>
              )}
              {scholarship.eligibility.excludedApplicants && scholarship.eligibility.excludedApplicants.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Excluded Applicants</h3>
                  <ul className="space-y-1">
                    {scholarship.eligibility.excludedApplicants.map((excluded, index) => (
                      <li key={index} className="flex items-center text-red-600">
                        <span className="mr-2">✗</span>
                        {excluded}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="flex items-center text-xl font-semibold text-gray-900 mb-4">
            <BiFilter className="text-purple-500 mr-2" />
            Application Requirements
          </h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Documents */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Required Documents</h3>
              <ul className="space-y-2">
                {scholarship.requirements.documents.map((doc, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <BiCheckCircle className="text-purple-500 mr-2 mt-0.5 text-sm" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Essays */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Essays Required</h3>
              {scholarship.requirements.essays.map((essay, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{essay.title}</h4>
                  <p className="text-gray-700 text-sm mb-2">{essay.instructions}</p>
                  {essay.submissionMethod && (
                    <p className="text-blue-600 text-sm">
                      Submit to: {essay.submissionMethod}
                    </p>
                  )}
                </div>
              ))}

              {/* Formatting */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Formatting Requirements</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Font: {scholarship.requirements.formatting.font}</p>
                  <p>Font Size: {scholarship.requirements.formatting.fontSize}pt</p>
                  <p>Spacing: {scholarship.requirements.formatting.spacing}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Process */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="flex items-center text-xl font-semibold text-gray-900 mb-4">
            <BiBook className="text-orange-500 mr-2" />
            Application Process
          </h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Submission Details</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <BiMapPin className="text-orange-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-700 text-sm">{scholarship.applicationProcess.submissionLocation}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <BiFilter className="text-orange-500 mr-2" />
                  <div>
                    <p className="font-medium">Method</p>
                    <p className="text-gray-700 text-sm">{scholarship.applicationProcess.submissionMethod}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <BiCheckCircle className="text-orange-500 mr-2" />
                  <div>
                    <p className="font-medium">Interview Required</p>
                    <p className="text-gray-700 text-sm">{scholarship.applicationProcess.interviewProcess ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>

            {scholarship.applicationProcess.envelopeRequirements.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Envelope Requirements</h3>
                <ul className="space-y-2">
                  {scholarship.applicationProcess.envelopeRequirements.map((req, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <BiCheckCircle className="text-orange-500 mr-2 text-sm" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="flex items-center text-xl font-semibold text-gray-900 mb-4">
            <BiPhone className="text-green-500 mr-2" />
            Contact Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <BiInfoCircle className="text-green-500 mr-2" />
              <span className="font-medium">Office: </span>
              <span className="ml-2">{scholarship.contact.office}</span>
            </div>
            {scholarship.contact.email && (
              <div className="flex items-center">
                <BiEnvelope className="text-green-500 mr-2" />
                <span className="font-medium">Email: </span>
                <a href={`mailto:${scholarship.contact.email}`} className="ml-2 text-blue-600 hover:underline">
                  {scholarship.contact.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {scholarship.contact.applicationForm ? (
            <Link
              href={scholarship.contact.applicationForm}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Apply Now
              <BiCheckCircle className="ml-2" />
            </Link>
          ) : scholarship.contact.email ? (
            <Link
              href={`mailto:${scholarship.contact.email}`}
              className="flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Contact via Email
              <BiEnvelope className="ml-2" />
            </Link>
          ) : null}
          
          <Link
            href="/scholarships"
            className="flex items-center justify-center px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <BiArrowBack className="mr-2" />
            Back to All Scholarships
          </Link>
        </div>
      </div>
    </div>
  )
}