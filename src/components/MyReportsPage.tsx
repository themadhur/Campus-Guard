import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  PlusCircle,
  Calendar,
  MapPin,
  RefreshCw,
  Building2,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Complaint } from '../types/complaint';
import { fetchComplaintsByUserId } from '../services/userService';
import { useAuth } from '../context/AuthContext';

interface MyReportsPageProps {
  onTrackComplaint: (complaintId: string) => void;
  onNewReport: () => void;
  onOpenAuth: () => void;
}

export const MyReportsPage: React.FC<MyReportsPageProps> = ({
  onTrackComplaint,
  onNewReport,
  onOpenAuth,
}) => {
  const { user, profile } = useAuth();
  const [reports, setReports] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const effectiveUserId = user?.uid || profile?.userId;

  const loadReports = async () => {
    if (!effectiveUserId) {
      setReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const items = await fetchComplaintsByUserId(effectiveUserId);
      setReports(items);
    } catch (err) {
      console.warn('Could not load user reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [effectiveUserId]);

  if (!effectiveUserId) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
          <UserCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-slate-900">Sign In to View Your Reports</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            View all campus issues you have submitted, monitor technician assignment, and check
            resolution timestamps.
          </p>
        </div>
        <button
          onClick={onOpenAuth}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-blue-500/20 text-xs transition"
        >
          Sign In or Register
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Submitted Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking reports filed by{' '}
            <strong className="text-slate-700">
              {profile?.displayName || user?.displayName || user?.email}
            </strong>
            {profile?.studentId ? ` (${profile.studentId})` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadReports}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={onNewReport}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
          <p className="text-xs">Loading your submitted complaints...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">No complaints submitted yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't reported any problems on campus yet. See something broken or damaged?
            </p>
          </div>
          <button
            onClick={onNewReport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
          >
            Report an Issue Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.complaintId}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {report.complaintId}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      report.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : report.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : report.status === 'Under Review'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : report.status === 'Rejected'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {report.status}
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-[11px] text-slate-500 font-medium">{report.category}</span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm truncate">{report.issueTitle}</h4>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {report.building} • {report.roomArea}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </span>
                  <span className="text-blue-700 font-medium">{report.department}</span>
                </div>
              </div>

              <button
                onClick={() => onTrackComplaint(report.complaintId)}
                className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs border border-slate-200 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Track Progress</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
