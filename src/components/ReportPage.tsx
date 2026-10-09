import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  AlertCircle,
  Building,
  Layers,
  MapPin,
  CheckCircle2,
  Cpu,
  Loader2,
  RefreshCw,
  Info,
  ChevronDown,
  UserCheck,
  LogIn,
  UserPlus,
  Lock,
  Mail,
  GraduationCap,
} from 'lucide-react';
import { Complaint, IssueCategory, UrgencyLevel, AIAnalysisResult } from '../types/complaint';
import { validateImageFile, uploadComplaintImage, compressImageToDataUrl } from '../services/storageService';
import { submitComplaint } from '../services/complaintService';
import { classifyIssueLocally, DEPARTMENT_MAPPING } from '../lib/classifier';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface ReportPageProps {
  onSuccess: (complaint: Complaint) => void;
}

const BUILDINGS = [
  'Academic Block',
  'Administrative Block',
  'Library',
  'Computer Lab',
  'Mechanical Lab',
  'Electrical Lab',
  'Hostel',
  'Cafeteria',
  'Auditorium',
  'Sports Complex',
  'Other',
];

const FLOORS = [
  'Ground Floor',
  'First Floor',
  'Second Floor',
  'Third Floor',
  'Fourth Floor',
  'Other',
];

const CATEGORIES: IssueCategory[] = [
  'Electrical',
  'Plumbing',
  'Furniture',
  'Cleanliness',
  'Infrastructure',
  'Ventilation',
  'Classroom',
  'Laboratory',
  'Washroom',
  'Security',
  'Network / Internet',
  'Other',
];

export const ReportPage: React.FC<ReportPageProps> = ({ onSuccess }) => {
  const { user, profile, signOut, loginAsDemoStudent } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Form fields
  const [issueTitle, setIssueTitle] = useState('');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [roomArea, setRoomArea] = useState('');
  const [category, setCategory] = useState<string>('Auto Detect Category');

  // Pre-fill student info if signed in
  const [studentName, setStudentName] = useState(profile?.displayName || user?.displayName || '');
  const [studentEmail, setStudentEmail] = useState(profile?.email || user?.email || '');
  const [studentRollNo, setStudentRollNo] = useState(profile?.studentId || '');

  useEffect(() => {
    if (profile || user) {
      setStudentName(profile?.displayName || user?.displayName || '');
      setStudentEmail(profile?.email || user?.email || '');
      setStudentRollNo(profile?.studentId || '');
    }
  }, [profile, user]);

  // Image handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiErrorNotice, setAiErrorNotice] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAuthenticated = Boolean(user || profile);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Perform AI or Fallback analysis
  const handleTriggerAnalysis = async () => {
    if (!issueTitle.trim() && !description.trim()) {
      setErrors((prev) => ({
        ...prev,
        title: !issueTitle.trim() ? 'Please provide an issue title first.' : '',
      }));
      return;
    }

    setIsAnalyzing(true);
    setAiErrorNotice(null);

    let base64Image: string | null = null;
    if (selectedFile) {
      try {
        base64Image = await compressImageToDataUrl(selectedFile, 800, 0.7);
      } catch (e) {
        console.warn('Could not compress image for AI analysis:', e);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch('/api/classify', {
        signal: controller.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueTitle,
          description,
          selectedCategory: category !== 'Auto Detect Category' ? category : undefined,
          imageBase64: base64Image,
          mimeType: selectedFile?.type || 'image/jpeg',
        }),
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result: AIAnalysisResult = await response.json();
      setAiAnalysis(result);
      if (category === 'Auto Detect Category') {
        setCategory(result.category);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('AI classification request failed or timed out, triggering local classifier:', err);
      const localResult = classifyIssueLocally(issueTitle, description, category);
      setAiAnalysis(localResult);
      if (category === 'Auto Detect Category') {
        setCategory(localResult.category);
      }
      setAiErrorNotice(
        'AI classification took longer than expected. Applied instant local smart rule classification.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!issueTitle.trim()) newErrors.title = 'Issue Title is required';
    if (!description.trim()) newErrors.description = 'Please describe the issue in detail';
    if (!building) newErrors.building = 'Please select a building or block';
    if (!floor) newErrors.floor = 'Please select a floor';
    if (!roomArea.trim()) newErrors.roomArea = 'Please enter room or specific area';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated first
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      setSubmissionStep('Preparing your report...');
      await new Promise((r) => setTimeout(r, 200));

      // 1. Determine classification (if not already run)
      setSubmissionStep('Analyzing issue and routing...');
      let finalAnalysis = aiAnalysis;
      if (!finalAnalysis) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const res = await fetch('/api/classify', {
            signal: controller.signal,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              issueTitle,
              description,
              selectedCategory: category !== 'Auto Detect Category' ? category : undefined,
            }),
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            finalAnalysis = await res.json();
          } else {
            finalAnalysis = classifyIssueLocally(issueTitle, description, category);
          }
        } catch {
          finalAnalysis = classifyIssueLocally(issueTitle, description, category);
        }
      }

      const resolvedAnalysis =
        finalAnalysis || classifyIssueLocally(issueTitle, description, category);

      const effectiveCategory =
        category !== 'Auto Detect Category' ? category : resolvedAnalysis.category;
      const effectiveDepartment =
        DEPARTMENT_MAPPING[effectiveCategory] || resolvedAnalysis.department;
      const effectiveUrgency = resolvedAnalysis.urgency || ('Medium' as UrgencyLevel);

      // 2. Upload image if selected
      let uploadedImageUrl: string | undefined = undefined;
      if (selectedFile) {
        setSubmissionStep('Uploading photo to secure storage...');
        try {
          const uploadResult = await uploadComplaintImage(
            selectedFile,
            `temp_${Date.now()}`
          );
          uploadedImageUrl = uploadResult.url;
        } catch (uploadErr) {
          console.warn('Image upload failed, continuing with report:', uploadErr);
        }
      }

      // 3. Save complaint in Firestore linked to user profile
      setSubmissionStep('Saving complaint to campus registry...');
      const effectiveUserId = user?.uid || profile?.userId || `guest_${Date.now()}`;

      const complaintData = {
        userId: effectiveUserId,
        issueTitle: issueTitle.trim(),
        description: description.trim(),
        imageUrl: uploadedImageUrl,
        category: effectiveCategory,
        aiCategory: resolvedAnalysis?.category,
        urgency: effectiveUrgency,
        department: effectiveDepartment,
        aiReason: resolvedAnalysis?.reason,
        aiConfidence: resolvedAnalysis?.confidence,
        building,
        floor,
        roomArea: roomArea.trim(),
        studentName: studentName.trim() || profile?.displayName || user?.displayName || 'Student',
        studentEmail: studentEmail.trim() || profile?.email || user?.email || undefined,
        studentRollNo: studentRollNo.trim() || profile?.studentId || undefined,
      };

      setSubmissionStep('Generating complaint tracking ID...');
      const savedComplaint = await submitComplaint(complaintData);

      // Navigate to success
      onSuccess(savedComplaint);
    } catch (err: any) {
      console.error('Submission failed:', err);
      let friendlyMsg = 'Failed to submit complaint. Your input has been preserved. Please check network and retry.';
      const raw = err?.message || String(err);
      try {
        const parsed = JSON.parse(raw);
        if (parsed.error) friendlyMsg = `Notice: ${parsed.error}`;
      } catch {}
      if (raw.includes('permission-denied') || raw.includes('insufficient permissions')) {
        friendlyMsg = 'Report saved in local session. Verify Firestore rules in Firebase console for cloud synchronization.';
      }
      setSubmissionError(friendlyMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Auth Modal Trigger */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In to Submit Report"
        subtitle="Creating an account links this issue to your student record so facilities staff can notify you when resolved."
      />

      {/* Page Header */}
      <div className="mb-8 space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Student Incident Intake</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Report an Issue
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Help us improve the campus by reporting a problem. Our AI will automatically analyze your
          report and route it to the right department.
        </p>
      </div>

      {/* User Authentication Status Banner */}
      {!isAuthenticated ? (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-start gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Sign In Required Before Submitting
              </h3>
              <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
                Sign in with your student email or Google account to link complaints to your profile,
                receive live repair progress, and avoid duplicate reports.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
            <button
              type="button"
              onClick={() => loginAsDemoStudent()}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition"
            >
              1-Click Demo Login
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">
                Logged in as {profile?.displayName || user?.displayName || user?.email}
              </p>
              <p className="text-[11px] text-slate-500">
                {profile?.studentId ? `Student ID: ${profile.studentId} • ` : ''}
                {profile?.department || 'Campus Student'} • {profile?.email || user?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut()}
            className="text-xs text-slate-500 hover:text-red-600 font-medium self-end sm:self-center"
          >
            Switch Account
          </button>
        </div>
      )}

      {/* Submission Error Banner (Preserves Form) */}
      {submissionError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="space-y-1">
            <p className="font-semibold">Submission Encountered an Issue</p>
            <p className="text-red-700">{submissionError}</p>
            <p className="text-xs text-red-600 font-medium">
              Don't worry, your form data has been preserved. Click "Submit Report" below to retry.
            </p>
          </div>
        </div>
      )}

      {/* Main Report Form */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        {/* Section 1: Problem Overview */}
        <div className="space-y-5">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span>Issue Details</span>
          </h3>

          {/* Issue Title */}
          <div>
            <label htmlFor="issueTitle" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              id="issueTitle"
              type="text"
              value={issueTitle}
              onChange={(e) => {
                setIssueTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Ceiling fan not working, Water leaking under sink"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                errors.title ? 'border-red-400 bg-red-50/20' : 'border-slate-300 focus:border-blue-500'
              }`}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>

          {/* Detailed Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Be as specific as possible</span>
            </div>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              placeholder="Describe the problem in detail (e.g. Speed regulator does not respond, blades make scraping noise, sparks noticed when turning switch on)..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-y ${
                errors.description ? 'border-red-400 bg-red-50/20' : 'border-slate-300 focus:border-blue-500'
              }`}
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Upload Photo <span className="text-slate-400 text-[11px] font-normal lowercase">(optional but recommended)</span>
            </label>

            {!imagePreviewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600 text-slate-500 flex items-center justify-center transition">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Click to upload photo or drag & drop
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    JPG, JPEG, PNG, WEBP (Max 5MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                  <img
                    src={imagePreviewUrl}
                    alt="Problem Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <p className="text-xs font-semibold text-slate-800 truncate" title={selectedFile?.name}>
                    {selectedFile?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Size: {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} MB • Ready for AI inspection
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Change Photo
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Section 2: Location */}
        <div className="space-y-5">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <span>Campus Location</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Building */}
            <div>
              <label htmlFor="buildingSelect" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Building / Block <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="buildingSelect"
                  value={building}
                  onChange={(e) => {
                    setBuilding(e.target.value);
                    if (errors.building) setErrors((prev) => ({ ...prev, building: '' }));
                  }}
                  className={`w-full appearance-none px-4 py-2.5 rounded-xl border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition pr-10 ${
                    errors.building ? 'border-red-400 bg-red-50/20' : 'border-slate-300 focus:border-blue-500'
                  }`}
                >
                  <option value="">Select Building / Block</option>
                  {BUILDINGS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.building && <p className="text-xs text-red-600 mt-1">{errors.building}</p>}
            </div>

            {/* Floor */}
            <div>
              <label htmlFor="floorSelect" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Floor <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="floorSelect"
                  value={floor}
                  onChange={(e) => {
                    setFloor(e.target.value);
                    if (errors.floor) setErrors((prev) => ({ ...prev, floor: '' }));
                  }}
                  className={`w-full appearance-none px-4 py-2.5 rounded-xl border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition pr-10 ${
                    errors.floor ? 'border-red-400 bg-red-50/20' : 'border-slate-300 focus:border-blue-500'
                  }`}
                >
                  <option value="">Select Floor</option>
                  {FLOORS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.floor && <p className="text-xs text-red-600 mt-1">{errors.floor}</p>}
            </div>
          </div>

          {/* Room / Area */}
          <div>
            <label htmlFor="roomArea" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Room / Specific Area <span className="text-red-500">*</span>
            </label>
            <input
              id="roomArea"
              type="text"
              value={roomArea}
              onChange={(e) => {
                setRoomArea(e.target.value);
                if (errors.roomArea) setErrors((prev) => ({ ...prev, roomArea: '' }));
              }}
              placeholder="e.g. Room 204, Computer Lab 2, Girls Washroom, Main Corridor"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                errors.roomArea ? 'border-red-400 bg-red-50/20' : 'border-slate-300 focus:border-blue-500'
              }`}
            />
            {errors.roomArea && <p className="text-xs text-red-600 mt-1">{errors.roomArea}</p>}
          </div>
        </div>

        {/* Section 3: Smart Category & AI Assistance */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span>Category & AI Classification</span>
            </h3>

            {/* Run AI Analysis Button */}
            <button
              type="button"
              onClick={handleTriggerAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Run AI Analysis Preview</span>
                </>
              )}
            </button>
          </div>

          {/* Category Dropdown */}
          <div>
            <label htmlFor="categorySelect" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Issue Category
            </label>
            <div className="relative">
              <select
                id="categorySelect"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition pr-10"
              >
                <option value="Auto Detect Category">✨ Auto Detect Category (AI Assisted)</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select a category manually or let Campus Guard AI automatically classify it from your
              description and photo.
            </p>
          </div>

          {/* AI Notice if fallback was used */}
          {aiErrorNotice && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{aiErrorNotice}</span>
            </div>
          )}

          {/* AI Live Analysis Card */}
          {aiAnalysis && (
            <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 rounded-2xl border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                      AI Issue Triage Preview
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      {aiAnalysis.isFallback ? 'Engine: Local Smart Classifier' : 'Engine: Gemini AI Multimodal'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      aiAnalysis.urgency === 'Critical'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : aiAnalysis.urgency === 'High'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {aiAnalysis.urgency} Urgency
                  </span>
                  <span className="text-xs font-semibold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {aiAnalysis.confidence}% Match
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/80 p-3 rounded-xl border border-indigo-100">
                <div>
                  <span className="text-slate-400 font-medium">Assigned Department:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{aiAnalysis.department}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Predicted Category:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{aiAnalysis.category}</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-white/80 p-3 rounded-xl border border-indigo-100">
                <span className="font-semibold text-slate-700">Reasoning: </span>
                {aiAnalysis.reason}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Reporter Profile Details */}
        <div className="space-y-5">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                4
              </span>
              <span>Reporter Profile Information</span>
            </div>
            {!isAuthenticated && (
              <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                Sign in required
              </span>
            )}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="studentName" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Your Name
              </label>
              <input
                id="studentName"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Rohan Sharma"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label htmlFor="studentRollNo" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Student ID / Roll No
              </label>
              <input
                id="studentRollNo"
                type="text"
                value={studentRollNo}
                onChange={(e) => setStudentRollNo(e.target.value)}
                placeholder="e.g. 22CS084"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label htmlFor="studentEmail" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                College Email
              </label>
              <input
                id="studentEmail"
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@campus.edu"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            {isAuthenticated
              ? 'Your report will be recorded and linked to your campus profile.'
              : 'You will be prompted to sign in before finalizing submission.'}
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition disabled:opacity-60 flex items-center justify-center gap-2 text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{submissionStep || 'Submitting Report...'}</span>
              </>
            ) : !isAuthenticated ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In & Submit Report</span>
              </>
            ) : (
              <span>Submit Report</span>
            )}
          </button>
        </div>
      </form>

      {/* Submission Loading Modal / Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 border border-slate-100">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900">Submitting to Campus Guard</h4>
              <p className="text-sm font-semibold text-blue-600 animate-pulse">
                {submissionStep || 'Processing your request...'}
              </p>
            </div>
            <p className="text-xs text-slate-400">
              Please wait while your report is analyzed and registered.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
