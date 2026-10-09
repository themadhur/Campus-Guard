export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Rejected';

export type IssueCategory =
  | 'Electrical'
  | 'Plumbing'
  | 'Furniture'
  | 'Cleanliness'
  | 'Infrastructure'
  | 'Ventilation'
  | 'Classroom'
  | 'Laboratory'
  | 'Washroom'
  | 'Security'
  | 'Network / Internet'
  | 'Other';

export interface StatusHistoryItem {
  status: ComplaintStatus;
  timestamp: string; // ISO 8601 string
  note?: string;
  updatedBy?: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  studentId?: string;
  department?: string;
  role: 'student' | 'staff' | 'admin';
  createdAt: string;
  updatedAt?: string;
}

export interface Complaint {
  id?: string; // Firestore document ID
  complaintId: string; // e.g. CG-2026-8F42K
  userId?: string; // Authenticated user ID
  issueTitle: string;
  description: string;
  imageUrl?: string;
  category: IssueCategory | string;
  aiCategory?: string;
  urgency: UrgencyLevel;
  department: string;
  aiReason?: string;
  aiConfidence?: number;
  building: string;
  floor: string;
  roomArea: string;
  status: ComplaintStatus;
  studentName?: string;
  studentEmail?: string;
  studentRollNo?: string;
  isDemo?: boolean;
  statusHistory?: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysisResult {
  category: IssueCategory | string;
  urgency: UrgencyLevel;
  department: string;
  reason: string;
  confidence: number;
  isFallback?: boolean;
}
