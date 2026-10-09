import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Eye,
  PlusCircle,
  Building2,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Complaint } from '../types/complaint';

interface SuccessPageProps {
  complaint: Complaint;
  onTrack: (complaintId: string) => void;
  onReportAnother: () => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({
  complaint,
  onTrack,
  onReportAnother,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(complaint.complaintId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8 text-center sm:text-left">
        {/* Success Icon & Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-1">
              <span>Status: {complaint.status}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Complaint Submitted Successfully
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Your report has been logged and forwarded to campus authorities.
            </p>
          </div>
        </div>

        {/* Complaint ID Card */}
        <div className="p-5 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 rounded-2xl border border-blue-200 text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Your Tracking Complaint ID
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 tracking-wider">
              {complaint.complaintId}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-blue-200 text-slate-700 shadow-sm transition active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
              title="Copy Complaint ID"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-blue-600" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Save or screenshot this ID to monitor real-time repair progress anytime.
          </p>
        </div>

        {/* Summary Details */}
        <div className="space-y-4 text-sm text-slate-700 border-t border-slate-100 pt-6">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-left">
            Submission Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Issue</span>
              <span className="font-semibold text-slate-900">{complaint.issueTitle}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Assigned Department</span>
              <span className="font-semibold text-blue-700">{complaint.department}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Category</span>
              <span className="font-semibold text-slate-900">{complaint.category}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Priority / Urgency</span>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-bold ${
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
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-left">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs text-slate-400 block font-medium">Location</span>
              <span className="font-semibold text-slate-800 text-xs">
                {complaint.building} • {complaint.floor} • {complaint.roomArea}
              </span>
            </div>
          </div>

          {complaint.aiReason && (
            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 text-left text-xs text-slate-600 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-blue-900 block">AI Triage Note:</span>
                <p className="mt-0.5">{complaint.aiReason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => onTrack(complaint.complaintId)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-blue-500/25 transition text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Track Complaint</span>
          </button>

          <button
            onClick={onReportAnother}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold px-6 py-3 rounded-xl shadow-sm transition text-sm"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" />
            <span>Report Another Issue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
