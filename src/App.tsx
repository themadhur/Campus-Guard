import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ReportPage } from './components/ReportPage';
import { SuccessPage } from './components/SuccessPage';
import { TrackComplaintPage } from './components/TrackComplaintPage';
import { AdminDashboard } from './components/AdminDashboard';
import { MyReportsPage } from './components/MyReportsPage';
import { AuthModal } from './components/AuthModal';
import { Complaint } from './types/complaint';
import { testConnection } from './lib/firebase';
import { ShieldAlert } from 'lucide-react';

function CampusGuardApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [trackInitialId, setTrackInitialId] = useState<string>('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    // Test connection to Firestore on initial boot
    testConnection();
  }, []);

  const handleReportSuccess = (complaint: Complaint) => {
    setSubmittedComplaint(complaint);
  };

  const handleTrackFromSuccess = (complaintId: string) => {
    setSubmittedComplaint(null);
    setTrackInitialId(complaintId);
    setActiveTab('track');
  };

  const handleReportAnother = () => {
    setSubmittedComplaint(null);
    setActiveTab('report');
  };

  const handleNavigateWithTrackId = (id: string) => {
    setSubmittedComplaint(null);
    setTrackInitialId(id);
    setActiveTab('track');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSubmittedComplaint(null);
          setActiveTab(tab);
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {submittedComplaint ? (
          <SuccessPage
            complaint={submittedComplaint}
            onTrack={handleTrackFromSuccess}
            onReportAnother={handleReportAnother}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <LandingPage
                onNavigate={(tab) => {
                  setSubmittedComplaint(null);
                  setActiveTab(tab);
                }}
                onTrackWithId={handleNavigateWithTrackId}
              />
            )}

            {activeTab === 'report' && (
              <ReportPage onSuccess={handleReportSuccess} />
            )}

            {activeTab === 'track' && (
              <TrackComplaintPage
                initialComplaintId={trackInitialId}
                onNavigateReport={() => setActiveTab('report')}
              />
            )}

            {activeTab === 'my-reports' && (
              <MyReportsPage
                onTrackComplaint={handleNavigateWithTrackId}
                onNewReport={() => setActiveTab('report')}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            )}

            {activeTab === 'admin' && <AdminDashboard />}
          </>
        )}
      </main>

      {/* Campus Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Campus Guard</p>
                <p className="text-[11px] text-slate-500">Report. Track. Improve.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600 font-medium">
              <button
                onClick={() => {
                  setSubmittedComplaint(null);
                  setActiveTab('home');
                }}
                className="hover:text-blue-600 transition"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setSubmittedComplaint(null);
                  setActiveTab('report');
                }}
                className="hover:text-blue-600 transition"
              >
                Report Issue
              </button>
              <button
                onClick={() => {
                  setSubmittedComplaint(null);
                  setActiveTab('track');
                }}
                className="hover:text-blue-600 transition"
              >
                Track Complaint
              </button>
              <button
                onClick={() => {
                  setSubmittedComplaint(null);
                  setActiveTab('my-reports');
                }}
                className="hover:text-blue-600 transition"
              >
                My Reports
              </button>
              <button
                onClick={() => {
                  setSubmittedComplaint(null);
                  setActiveTab('admin');
                }}
                className="hover:text-blue-600 transition"
              >
                Admin Portal
              </button>
            </div>

            <div className="text-center sm:text-right text-[11px] text-slate-400">
              <p>Designed for Smart University Campus Management.</p>
              <p className="mt-0.5">Automated AI Triage & Real-Time Facilities Dispatch.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CampusGuardApp />
    </AuthProvider>
  );
}
