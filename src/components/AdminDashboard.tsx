import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ChevronDown,
  RefreshCw,
  Eye,
  Edit3,
  X,
  PlusCircle,
  Building2,
  UserCheck,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Sparkles,
  BarChart3,
  SlidersHorizontal,
  MapPin,
  Save,
  Check,
  LogOut,
  LogIn,
} from 'lucide-react';
import { Complaint, ComplaintStatus, UrgencyLevel } from '../types/complaint';
import {
  fetchAllComplaints,
  updateComplaintState,
  seedDemoComplaints,
  subscribeToComplaints,
} from '../services/complaintService';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENT_MAPPING } from '../lib/classifier';

export const AdminDashboard: React.FC = () => {
  const { isAdmin, isDemoAdmin, user, signInWithGoogle, signOut, enableDemoAdmin, disableDemoAdmin } =
    useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Edit State in Details Modal
  const [editStatus, setEditStatus] = useState<ComplaintStatus>('Submitted');
  const [editDepartment, setEditDepartment] = useState<string>('');
  const [editUrgency, setEditUrgency] = useState<UrgencyLevel>('Medium');
  const [adminNote, setAdminNote] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  // Realtime subscription
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToComplaints(
      (items) => {
        setComplaints(items);
        setLoading(false);
      },
      (err) => {
        console.warn('Realtime listener failed, falling back to one-time fetch:', err);
        fetchAllComplaints()
          .then((items) => setComplaints(items))
          .finally(() => setLoading(false));
      }
    );

    return () => unsubscribe();
  }, []);

  const handleOpenDetails = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setEditStatus(comp.status);
    setEditDepartment(comp.department);
    setEditUrgency(comp.urgency);
    setAdminNote('');
    setUpdateFeedback(null);
  };

  const handleSaveStatusChange = async () => {
    if (!selectedComplaint) return;
    setIsUpdating(true);
    setUpdateFeedback(null);

    try {
      await updateComplaintState(selectedComplaint.complaintId, {
        status: editStatus,
        department: editDepartment,
        urgency: editUrgency,
        note: adminNote.trim() || undefined,
        updatedBy: user?.displayName || user?.email || (isDemoAdmin ? 'Demo Admin' : 'Campus Admin'),
      });

      setUpdateFeedback('Complaint updated successfully!');

      // Update local selected state
      const now = new Date().toISOString();
      const updatedHistory = [
        ...(selectedComplaint.statusHistory || []),
        {
          status: editStatus,
          timestamp: now,
          note: adminNote.trim() || `Status updated to ${editStatus}`,
          updatedBy: user?.displayName || user?.email || (isDemoAdmin ? 'Demo Admin' : 'Campus Admin'),
        },
      ];

      setSelectedComplaint({
        ...selectedComplaint,
        status: editStatus,
        department: editDepartment,
        urgency: editUrgency,
        statusHistory: updatedHistory,
        updatedAt: now,
      });

      // Update complaints table and dashboard KPI cards immediately
      setComplaints((prev) =>
        prev.map((c) =>
          c.complaintId === selectedComplaint.complaintId
            ? {
                ...c,
                status: editStatus,
                department: editDepartment,
                urgency: editUrgency,
                statusHistory: updatedHistory,
                updatedAt: now,
              }
            : c
        )
      );

      setAdminNote('');
    } catch (err: any) {
      console.error('Update failed:', err);
      alert('Failed to update complaint. Please verify permissions.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedDemoComplaints();
      const fresh = await fetchAllComplaints();
      setComplaints(fresh);
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setSeeding(false);
    }
  };

  // Filter & Sort Logic
  const filteredComplaints = complaints.filter((comp) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      comp.complaintId.toLowerCase().includes(q) ||
      comp.issueTitle.toLowerCase().includes(q) ||
      comp.building.toLowerCase().includes(q) ||
      comp.roomArea.toLowerCase().includes(q) ||
      (comp.studentName && comp.studentName.toLowerCase().includes(q));

    const matchesCategory = filterCategory === 'all' || comp.category === filterCategory;
    const matchesDepartment = filterDepartment === 'all' || comp.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || comp.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || comp.urgency === filterPriority;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesDepartment &&
      matchesStatus &&
      matchesPriority
    );
  });

  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
  });

  // Analytics Computations
  const totalCount = complaints.length;
  const submittedCount = complaints.filter((c) => c.status === 'Submitted').length;
  const underReviewCount = complaints.filter((c) => c.status === 'Under Review').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const highPriorityCount = complaints.filter(
    (c) => c.urgency === 'High' || c.urgency === 'Critical'
  ).length;

  // Breakdown by Category
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  // Breakdown by Department
  const departmentCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    departmentCounts[c.department] = (departmentCounts[c.department] || 0) + 1;
  });

  // Unique lists for filter dropdowns
  const availableCategories = Array.from(new Set(complaints.map((c) => c.category))).filter(Boolean);
  const availableDepartments = Array.from(new Set(complaints.map((c) => c.department))).filter(Boolean);

  // If user is not admin
  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Administrator Portal Access
          </h2>
          <p className="text-slate-600 text-sm">
            Sign in with your authorized administrator Google account, or enable the hackathon demo
            evaluation mode.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold px-4 py-3 rounded-xl shadow-sm transition active:scale-[0.99] text-sm"
          >
            <LogIn className="w-4 h-4 text-slate-500" />
            <span>Sign in with Google</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-50 px-3 text-slate-400 font-medium">Or for testing</span>
            </div>
          </div>

          <button
            onClick={() => enableDemoAdmin()}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold px-4 py-3 rounded-xl shadow-md shadow-blue-500/20 transition text-sm flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Enable Hackathon Demo Admin Mode</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Designated admin: <span className="font-mono text-slate-600">madhurnous@gmail.com</span>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demo Mode Notice Banner */}
      {isDemoAdmin && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <p>
              <strong>Demo Evaluation Mode Active:</strong> You have temporary administrator
              privileges for testing status transitions and triage.
            </p>
          </div>
          <button
            onClick={() => disableDemoAdmin()}
            className="text-amber-800 font-semibold hover:underline shrink-0"
          >
            Exit Demo Mode
          </button>
        </div>
      )}

      {/* Header and Quick Seed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Campus Facilities Dashboard
            </h1>
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              Live Triage
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage incoming student complaints, assign technicians, and track resolution timelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition active:scale-[0.98] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Seeding...' : 'Seed Sample Complaints'}</span>
          </button>

          {isDemoAdmin && (
            <button
              onClick={() => disableDemoAdmin()}
              className="text-xs text-slate-500 hover:text-red-600 font-medium px-2 py-1"
            >
              Sign out
            </button>
          )}
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium block">Total Complaints</span>
          <span className="text-2xl font-black text-slate-900">{totalCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium block">Submitted</span>
          <span className="text-2xl font-black text-amber-600">{submittedCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium block">Under Review</span>
          <span className="text-2xl font-black text-blue-600">{underReviewCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium block">In Progress</span>
          <span className="text-2xl font-black text-indigo-600">{inProgressCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium block">Resolved</span>
          <span className="text-2xl font-black text-emerald-600">{resolvedCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium block">High / Critical</span>
          <span className="text-2xl font-black text-red-600">{highPriorityCount}</span>
        </div>
      </div>

      {/* Category & Department Distribution Charts / Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
            <span>Complaints by Category</span>
            <span className="text-slate-400 font-normal">{Object.keys(categoryCounts).length} types</span>
          </h4>
          <div className="space-y-2">
            {Object.entries(categoryCounts).slice(0, 5).map(([cat, count]) => {
              const pct = totalCount ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span className="font-semibold">{cat}</span>
                    <span>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
            <span>Complaints by Department</span>
            <span className="text-slate-400 font-normal">Workload distribution</span>
          </h4>
          <div className="space-y-2">
            {Object.entries(departmentCounts).slice(0, 5).map(([dept, count]) => {
              const pct = totalCount ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={dept} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span className="font-semibold">{dept}</span>
                    <span>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Issue Title, Room, Building, or Student..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Sort By Date */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none"
          >
            <option value="all">All Departments</option>
            {availableDepartments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p className="text-xs">Loading campus complaints registry...</p>
          </div>
        ) : sortedComplaints.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">No complaints found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {complaints.length === 0
                  ? 'There are currently no complaints in the system. Click "Seed Sample Complaints" above to load test data.'
                  : 'Try adjusting your search queries or filter dropdowns.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Issue Title</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedComplaints.map((comp) => (
                  <tr key={comp.complaintId} className="hover:bg-slate-50/70 transition">
                    {/* ID */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {comp.complaintId}
                      {comp.isDemo && (
                        <span className="ml-1 text-[9px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded font-sans">
                          demo
                        </span>
                      )}
                    </td>

                    {/* Issue Title & Thumbnail */}
                    <td className="px-4 py-3 max-w-[220px]">
                      <div className="flex items-center gap-2">
                        {comp.imageUrl && (
                          <img
                            src={comp.imageUrl}
                            alt="thumb"
                            className="w-7 h-7 rounded object-cover shrink-0 border border-slate-200"
                          />
                        )}
                        <span className="font-semibold text-slate-900 truncate block" title={comp.issueTitle}>
                          {comp.issueTitle}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {comp.category}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3 whitespace-nowrap text-blue-700 font-medium">
                      {comp.department}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      {comp.building} ({comp.roomArea})
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          comp.urgency === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : comp.urgency === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {comp.urgency}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold ${
                          comp.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : comp.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : comp.status === 'Under Review'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : comp.status === 'Rejected'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {comp.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(comp.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDetails(comp)}
                        className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-2.5 py-1.5 rounded-lg transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Complaint Details Drawer / Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-6 p-6 sm:p-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {selectedComplaint.complaintId}
                  </span>
                  <span className="text-xs text-slate-400">
                    Reported on {new Date(selectedComplaint.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedComplaint.issueTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success update notification */}
            {updateFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{updateFeedback}</span>
              </div>
            )}

            {/* Media & Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Image & Description */}
              <div className="space-y-4">
                {selectedComplaint.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-56 bg-slate-900">
                    <img
                      src={selectedComplaint.imageUrl}
                      alt="Complaint"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Student Description
                  </h4>
                  <p className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800 whitespace-pre-wrap border border-slate-100">
                    {selectedComplaint.description}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedComplaint.building} • {selectedComplaint.floor} •{' '}
                      {selectedComplaint.roomArea}
                    </span>
                  </div>
                  {selectedComplaint.studentName && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reporter:</span>
                      <span className="font-medium text-slate-800">
                        {selectedComplaint.studentName} ({selectedComplaint.studentEmail || 'No email'})
                      </span>
                    </div>
                  )}
                </div>

                {/* AI Reasoning card */}
                {selectedComplaint.aiReason && (
                  <div className="p-3 bg-blue-50/60 rounded-xl text-xs text-slate-700 border border-blue-100 space-y-1">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      AI Triage Analysis ({selectedComplaint.aiConfidence || 85}% confidence)
                    </span>
                    <p className="text-[11px] text-slate-600">{selectedComplaint.aiReason}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Admin State Management */}
              <div className="space-y-5 bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Administrative Action & Status Controls
                </h4>

                {/* Change Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Update Lifecycle Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ComplaintStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Re-route Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Handling Department
                  </label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {Object.values(DEPARTMENT_MAPPING).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority / Urgency
                  </label>
                  <select
                    value={editUrgency}
                    onChange={(e) => setEditUrgency(e.target.value as UrgencyLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {/* Internal Admin Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Activity Log Note / Technician Remark
                  </label>
                  <textarea
                    rows={2}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="e.g. Dispatched Electrician M. Kumar with spare capacitor..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={handleSaveStatusChange}
                  disabled={isUpdating}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUpdating ? 'Saving Update...' : 'Commit Status & Department Changes'}</span>
                </button>
              </div>
            </div>

            {/* Audit History Log */}
            {selectedComplaint.statusHistory && selectedComplaint.statusHistory.length > 0 && (
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Full Status Audit Trail
                </h4>
                <div className="space-y-2">
                  {selectedComplaint.statusHistory.map((h, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-50 rounded-xl text-xs flex items-center justify-between text-slate-700 border border-slate-100"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{h.status}</span>
                        {h.note && <span className="text-slate-500 ml-2">— {h.note}</span>}
                      </div>
                      <div className="text-[11px] text-slate-400 text-right">
                        <span>{new Date(h.timestamp).toLocaleString()}</span>
                        {h.updatedBy && <span className="block text-slate-500">by {h.updatedBy}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
