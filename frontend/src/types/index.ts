export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface StudentProfile {
  register_number: string;
  department: string;
  year_of_study: number;
  created_at: string;
}

export interface TeacherProfile {
  employee_id: string;
  department: string;
  is_approved: boolean;
  approved_at: string | null;
  rejection_reason?: string;
  assigned_subjects: Subject[];
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  student_profile?: StudentProfile;
  teacher_profile?: TeacherProfile;
  created_at: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  department: string;
  description?: string;
  is_active?: boolean;
}

export type DoubtPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type DoubtStatus = 'PENDING' | 'IN_PROGRESS' | 'ANSWERED' | 'RESOLVED' | 'CLOSED';

export interface DoubtAnswer {
  id: number;
  teacher_name: string;
  teacher_department: string;
  content: string;
  is_clarification_request: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoubtStatusHistory {
  id: number;
  changed_by_name: string;
  old_status: string;
  new_status: string;
  comment: string;
  created_at: string;
}

export interface DoubtListItem {
  id: number;
  doubt_id: string;
  title: string;
  priority: DoubtPriority;
  status: DoubtStatus;
  subject_code: string;
  subject_name: string;
  student_name: string;
  student_register_number?: string | null;
  answers_count: number;
  created_at: string;
  updated_at: string;
}

export interface DoubtDetail {
  id: number;
  doubt_id: string;
  title: string;
  description: string;
  priority: DoubtPriority;
  status: DoubtStatus;
  subject: Subject;
  student_name: string;
  student_register_number?: string | null;
  student_department: string;
  student_year: number;
  answers: DoubtAnswer[];
  status_history: DoubtStatusHistory[];
  created_at: string;
  updated_at: string;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  notification_type: 'NEW_DOUBT' | 'DOUBT_ANSWERED' | 'CLARIFICATION_REQUESTED' | 'STATUS_UPDATED' | 'TEACHER_APPROVED' | 'SYSTEM';
  related_doubt_id?: string | null;
  related_doubt_title?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  in_progress: number;
  answered: number;
  resolved: number;
  recent_doubts: DoubtListItem[];
  subject_breakdown?: Array<{
    subject__code: string;
    subject__name: string;
    count: number;
  }>;
}
