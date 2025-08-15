import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

// --- SVG Icons & Reusable Components ---
const InboxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);
const ApproveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);
const DeclineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);
const FlagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
  </svg>
);

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      active ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'
    }`}
  >
    {children}
  </button>
);

const DetailRow = ({ label, value }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{String(value)}</dd>
  </div>
);

const ApplicationInbox = ({ onSelectApplication, applications }) => {
  const [activeTab, setActiveTab] = useState('review');

  const filteredApps = {
    review: applications.filter((app) => app.decision === 'Manual Review'),
    approved: applications.filter((app) => app.decision === 'Approved'),
    declined: applications.filter((app) => app.decision === 'Rejected'),
    completed: applications.filter((app) => app.status && app.status.startsWith('Completed')),
  };

  const renderTable = (apps) => (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {apps.map((app) => (
            <tr key={app.id} onClick={() => onSelectApplication(app.id)} className="hover:bg-gray-100 cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{app.applicant_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {new Date(app.submitted_at).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    app.status?.includes('Approved')
                      ? 'bg-green-100 text-green-800'
                      : app.status?.includes('Declined') || app.status?.includes('Rejected')
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {app.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <InboxIcon /> Application Inbox
      </h2>
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-2 sm:space-x-4" aria-label="Tabs">
          <TabButton active={activeTab === 'review'} onClick={() => setActiveTab('review')}>
            Needs Review ({filteredApps.review.length})
          </TabButton>
          <TabButton active={activeTab === 'approved'} onClick={() => setActiveTab('approved')}>
            AI Approved ({filteredApps.approved.length})
          </TabButton>
          <TabButton active={activeTab === 'declined'} onClick={() => setActiveTab('declined')}>
            AI Declined ({filteredApps.declined.length})
          </TabButton>
          <TabButton active={activeTab === 'completed'} onClick={() => setActiveTab('completed')}>
            Completed ({filteredApps.completed.length})
          </TabButton>
        </nav>
      </div>
      {renderTable(filteredApps[activeTab])}
    </div>
  );
};

const ApplicationDetail = ({ applicationId, onBack }) => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ai_analysis');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8000/applications/${applicationId}`);
        if (!response.ok) throw new Error('Failed to fetch application details.');
        const data = await response.json();
        setApplication(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [applicationId]);

  const handleReviewSubmit = async (decision) => {
    setIsSubmitting(true);
    try {
      await fetch(
        `http://127.0.0.1:8000/applications/${applicationId}/review?final_decision=${decision}`,
        { method: 'POST' }
      );
      onBack();
    } catch (err) {
      alert(`Failed to submit review: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendToReview = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`http://127.0.0.1:8000/applications/${applicationId}/request_manual_review`, {
        method: 'POST',
      });
      onBack();
    } catch (err) {
      alert(`Failed to move to review queue: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading application details...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  if (!application) return null;

  const showFinalDecisionButtons = application.decision === 'Manual Review';

  // NEW: pull fields used by AI Analysis
  const { decision, risk_score, explanation, doc_extracted } = application || {};

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
      >
        <BackIcon /> Back to Inbox
      </button>

      <h2 className="text-3xl font-bold text-gray-800">
        Application #{application.id} - {application.applicant_name}
      </h2>
      <p className="text-gray-500 mt-1">Submitted: {new Date(application.submitted_at).toLocaleString()}</p>

      <div className="mt-6 border-b border-gray-200">
        <nav className="flex space-x-2" aria-label="Tabs">
          <TabButton active={activeTab === 'ai_analysis'} onClick={() => setActiveTab('ai_analysis')}>
            AI Analysis
          </TabButton>
          <TabButton active={activeTab === 'applicant_data'} onClick={() => setActiveTab('applicant_data')}>
            Applicant Data
          </TabButton>
          <TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')}>
            Documents
          </TabButton>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'ai_analysis' && (
          <div className="bg-white shadow-md rounded-lg p-6">
            {/* NEW: summary line */}
            <p className="text-sm text-gray-600 mb-4">
              Decision: <b>{decision ?? '—'}</b>
              {typeof risk_score === 'number' && (
                <> • Risk: {(risk_score * 100).toFixed(2)}%</>
              )}
            </p>

            {/* NEW: render markdown explanation nicely */}
            <div className="prose max-w-none">
              <ReactMarkdown>{explanation || 'No AI analysis available yet.'}</ReactMarkdown>
            </div>

            {/* NEW: optional doc-only fields */}
            {doc_extracted?.verified_income && (
              <p className="text-sm text-gray-700 mt-3">
                Verified income: ${Number(doc_extracted.verified_income).toLocaleString()}
              </p>
            )}
            {doc_extracted?.tax_form_type && (
              <p className="text-xs text-gray-500 mt-1">Tax form: {doc_extracted.tax_form_type}</p>
            )}

            <div className="mt-8 pt-6 border-t flex justify-end space-x-3">
              {showFinalDecisionButtons ? (
                <>
                  <button
                    onClick={() => handleReviewSubmit('Declined')}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                  >
                    <DeclineIcon /> Decline Loan
                  </button>
                  <button
                    onClick={() => handleReviewSubmit('Approved')}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    <ApproveIcon /> Approve Loan
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSendToReview}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-800 bg-white hover:bg-yellow-50 disabled:opacity-50"
                >
                  <FlagIcon /> Send to Manual Review
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'applicant_data' && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <dl className="divide-y divide-gray-200">
              {Object.entries(application.application_data || {}).map(([key, value]) => (
                <DetailRow
                  key={key}
                  label={key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  value={value}
                />
              ))}
            </dl>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h3>
            <ul className="divide-y divide-gray-200">
              {(application.document_urls || []).map((url, index) => (
                <li key={index} className="py-3">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {url.split('/').pop().substring(37)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default function UnderwriterDashboard() {
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/applications/inbox');
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      setError('Connection failed. Please ensure the backend API server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleBackAndRefresh = () => {
    setSelectedApplicationId(null);
    fetchApps();
  };

  if (loading) return <div className="text-center p-8">Loading Dashboard...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen font-sans p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Underwriter Dashboard</h1>
          <p className="text-gray-500 mt-2">Review and process incoming loan applications.</p>
        </header>
        <main>
          {selectedApplicationId ? (
            <ApplicationDetail applicationId={selectedApplicationId} onBack={handleBackAndRefresh} />
          ) : (
            <ApplicationInbox onSelectApplication={setSelectedApplicationId} applications={applications} />
          )}
        </main>
      </div>
    </div>
  );
}
