import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Cpu,
  Calendar,
  Building2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  X,
  FileQuestion,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types/complaint';
import { fetchComplaintById, getLocalComplaints } from '../services/complaintService';

interface TrackComplaintPageProps {
  initialComplaintId?: string;
  onNavigateReport?: () => void;
}

const STATUS_STEPS: ComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
];

export const TrackComplaintPage: React.FC<TrackComplaintPageProps> = ({
  initialComplaintId = '',
  onNavigateReport,
}) => {
  const [searchId, setSearchId] = useState(initialComplaintId);
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [demoSuggestions, setDemoSuggestions] = useState<string[]>([
    'CG-2026-DEMO1',
    'CG-2026-DEMO2',
    'CG-2026-DEMO4',
  ]);

  useEffect(() => {
    try {
      const localItems = getLocalComplaints();
      const recentIds = localItems
        .filter((c) => !c.isDemo)
        .slice(0, 3)
        .map((c) => c.complaintId);
      const combined = Array.from(
        new Set([...recentIds, 'CG-2026-DEMO1', 'CG-2026-DEMO2', 'CG-2026-DEMO4'])
      ).slice(0, 5);
      setDemoSuggestions(combined);
    } catch {
      // Fallback
    }
  }, []);

  const handleSearch = async (idToSearch?: string) => {
    const id = (idToSearch || searchId).trim().toUpperCase();
    if (!id) return;

    setLoading(true);
    setErrorNotice(null);
    setSearched(true);

    try {
      const result = await fetchComplaintById(id);
      setComplaint(result);
      if (!result) {
        setErrorNotice('Complaint not found. Please check the ID and try again.');
      }
    } catch (err) {
      console.error('Error fetching complaint:', err);
      setErrorNotice('We couldn’t load this information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialComplaintId) {
      setSearchId(initialComplaintId);
      handleSearch(initialComplaintId);
    }
  }, [initialComplaintId]);

  // Helper to determine step position
  const getStepStatus = (step: ComplaintStatus, currentStatus: ComplaintStatus) => {
    if (currentStatus === 'Rejected') {
      return step === 'Submitted' ? 'completed' : 'rejected';
    }
    if (currentStatus === 'Closed') {
      return 'completed';
    }

    const currentIndex = STATUS_STEPS.indexOf(currentStatus);
    const stepIndex = STATUS_STEPS.indexOf(step);

    if (currentIndex === -1) {
      return 'pending';
    }
    if (stepIndex < currentIndex) {
      return 'completed';
    }
    if (stepIndex === currentIndex) {
      return 'current';
    }
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Track Your Complaint
        </h1>
        <p className="text-slate-600 text-sm">
          Enter your unique complaint ID to view real-time triage, technician assignment, and repair
          progression.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.toUpperCase())}
              placeholder="Enter Complaint ID (e.g. CG-2026-8F42K)"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 font-mono text-sm tracking-wider uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchId.trim()}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-6 py-3 rounded-2xl shadow-sm transition disabled:opacity-50 text-sm whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Track Complaint'}
          </button>
        </form>

        {/* Demo Quick Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
          <span className="font-medium">Try Sample Demo IDs:</span>
          {demoSuggestions.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setSearchId(id);
                handleSearch(id);
              }}
              className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg font-mono font-medium transition border border-slate-200"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Error / Not Found Message */}
      {errorNotice && (
        <div className="max-w-2xl mx-auto p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{errorNotice}</h3>
            <p className="text-xs text-slate-600 mt-1">
              Please double check the ID format (e.g. CG-2026-XXXXX) or click a demo sample above.
            </p>
          </div>
        </div>
      )}

      {/* Complaint Detail Card */}
      {complaint && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden space-y-6">
          {/* Card Banner */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm sm:text-base font-bold text-blue-400 bg-blue-950 px-2.5 py-0.5 rounded border border-blue-800">
                  {complaint.complaintId}
                </span>
                {complaint.isDemo && (
                  <span className="text-[10px] font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                    Demo Record
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                {complaint.issueTitle}
              </h2>
              <p className="text-xs text-slate-400">
                Submitted on {new Date(complaint.createdAt).toLocaleDateString()} at{' '}
                {new Date(complaint.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider ${
                  complaint.status === 'Resolved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : complaint.status === 'In Progress'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : complaint.status === 'Rejected'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {complaint.status}
              </span>
            </div>
          </div>

          {/* Visual Lifecycle Progress Bar */}
          <div className="px-6 sm:px-8 py-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Status Progression
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {STATUS_STEPS.map((step, idx) => {
                const stepState = getStepStatus(step, complaint.status);
                return (
                  <div
                    key={step}
                    className={`p-3 rounded-2xl border text-center transition ${
                      stepState === 'completed'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : stepState === 'current'
                        ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-sm ring-1 ring-blue-400/50'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {stepState === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : stepState === 'current' ? (
                        <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 text-[10px] font-bold flex items-center justify-center text-slate-400">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold block">{step}</span>
                    <span className="text-[10px] opacity-75">
                      {stepState === 'completed'
                        ? 'Completed'
                        : stepState === 'current'
                        ? 'Active Step'
                        : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Info Columns */}
          <div className="px-6 sm:px-8 pb-8 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Description & Image */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Issue Description
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </div>
              </div>

              {/* Uploaded Photo */}
              {complaint.imageUrl && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Attached Photo
                  </h4>
                  <div
                    onClick={() => setLightboxImage(complaint.imageUrl || null)}
                    className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 cursor-pointer max-h-72"
                  >
                    <img
                      src={complaint.imageUrl}
                      alt="Complaint attachment"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-2 font-medium text-xs">
                      <Maximize2 className="w-4 h-4" />
                      <span>Click to enlarge photo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Triage Analysis Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-blue-50/50 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    Automated AI Triage Assessment
                  </span>
                  {complaint.aiConfidence && (
                    <span className="text-[11px] font-semibold bg-white text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                      {complaint.aiConfidence}% Match
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  {complaint.aiReason ||
                    'Classified and routed automatically according to facilities keywords and severity heuristics.'}
                </p>
              </div>
            </div>

            {/* Right Column: Routing & Meta Details */}
            <div className="md:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Assigned Department</span>
                  <span className="font-bold text-sm text-blue-700 block mt-0.5">
                    {complaint.department}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Category</span>
                  <span className="font-semibold text-slate-800 text-sm block mt-0.5">
                    {complaint.category}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Priority Level</span>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded font-bold ${
                      complaint.urgency === 'Critical'
                        ? 'bg-red-100 text-red-800'
                        : complaint.urgency === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {complaint.urgency}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <span className="text-slate-400 font-medium block">Location</span>
                  <div className="flex items-start gap-1.5 mt-1 text-slate-800 font-semibold">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p>{complaint.building}</p>
                      <p className="text-slate-500 font-normal">
                        {complaint.floor} • {complaint.roomArea}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <span className="text-slate-400 font-medium block">Last Updated</span>
                  <span className="text-slate-700 font-medium block mt-0.5">
                    {new Date(complaint.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status Audit History Timeline */}
              {complaint.statusHistory && complaint.statusHistory.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Activity & Audit Log
                  </h4>
                  <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {complaint.statusHistory.map((hist, idx) => (
                      <div key={idx} className="relative pl-6 text-xs space-y-0.5">
                        <div className="absolute left-1 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 -translate-x-1/2 ring-4 ring-white" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{hist.status}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(hist.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {hist.note && <p className="text-slate-600 text-[11px]">{hist.note}</p>}
                        {hist.updatedBy && (
                          <span className="text-[10px] text-slate-400 block">
                            By {hist.updatedBy}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Photo */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="relative max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden bg-black shadow-2xl">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged complaint view"
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
