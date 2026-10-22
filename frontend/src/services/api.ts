import {
  User,
  Subject,
  DoubtListItem,
  DoubtDetail,
  AppNotification,
  DashboardStats
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('doubtbox_token');
  }

  public setToken(token: string) {
    localStorage.setItem('doubtbox_token', token);
  }

  public clearToken() {
    localStorage.removeItem('doubtbox_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let errorMessage = 'An unexpected error occurred.';
      if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      } else if (typeof data.message === 'string') {
        errorMessage = data.message;
      } else if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const val = data[firstKey];
          errorMessage = Array.isArray(val) ? `${firstKey}: ${val[0]}` : `${firstKey}: ${val}`;
        }
      }
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).data = data;
      throw error;
    }

    return data as T;
  }

  // --- Authentication Endpoints ---
  async registerStudent(data: any) {
    return this.request<{ message: string; token: string; user: User }>('/accounts/register/student/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async registerTeacher(data: any) {
    return this.request<{ message: string; token: string; user: User; is_approved: boolean }>(
      '/accounts/register/teacher/',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async loginStudent(data: { email: string; password: string }) {
    return this.request<{ message: string; token: string; user: User }>('/accounts/login/student/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async loginTeacher(data: { email: string; password: string }) {
    return this.request<{ message: string; token: string; user: User; is_approved: boolean; approval_note?: string }>(
      '/accounts/login/teacher/',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getCurrentUser() {
    return this.request<{ user: User; is_approved: boolean }>('/accounts/me/');
  }

  async logout() {
    try {
      await this.request('/accounts/logout/', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  // --- Subjects ---
  async getSubjects(department?: string) {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    return this.request<Subject[]>(`/subjects/${query}`);
  }

  // --- Student Doubt Endpoints ---
  async getStudentStats() {
    return this.request<DashboardStats>('/doubts/student/stats/');
  }

  async getStudentDoubts(params?: { subject?: string; status?: string; search?: string; priority?: string }) {
    const q = new URLSearchParams();
    if (params?.subject) q.set('subject', params.subject);
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    if (params?.priority) q.set('priority', params.priority);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return this.request<DoubtListItem[]>(`/doubts/student/${queryString}`);
  }

  async getStudentDoubtDetail(doubtId: string) {
    return this.request<DoubtDetail>(`/doubts/student/${doubtId}/`);
  }

  async submitDoubt(data: { subject_id: number; title: string; description: string; priority: string }) {
    return this.request<DoubtDetail>('/doubts/student/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Teacher Doubt Endpoints ---
  async getTeacherStats() {
    return this.request<DashboardStats>('/doubts/teacher/stats/');
  }

  async getTeacherDoubts(params?: { subject?: string; status?: string; search?: string; priority?: string }) {
    const q = new URLSearchParams();
    if (params?.subject) q.set('subject', params.subject);
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    if (params?.priority) q.set('priority', params.priority);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return this.request<DoubtListItem[]>(`/doubts/teacher/${queryString}`);
  }

  async getTeacherDoubtDetail(doubtId: string) {
    return this.request<DoubtDetail>(`/doubts/teacher/${doubtId}/`);
  }

  async answerDoubt(doubtId: string, data: { content: string; is_clarification_request: boolean; new_status?: string }) {
    return this.request<DoubtDetail>(`/doubts/teacher/${doubtId}/answer/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDoubtStatus(doubtId: string, data: { status: string; comment?: string }) {
    return this.request<{ message: string; doubt: DoubtDetail }>(`/doubts/teacher/${doubtId}/status/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Notifications ---
  async getNotifications(unreadOnly?: boolean) {
    const q = unreadOnly ? '?unread=true' : '';
    return this.request<AppNotification[]>(`/notifications/${q}`);
  }

  async getUnreadNotificationCount() {
    return this.request<{ unread_count: number }>('/notifications/unread-count/');
  }

  async markNotificationRead(id: number) {
    return this.request<{ message: string; id: number }>(`/notifications/${id}/mark-read/`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ message: string; count: number }>('/notifications/mark-all-read/', {
      method: 'POST',
    });
  }

  // --- Admin Teacher Approvals ---
  async getAdminTeachers(statusFilter?: string) {
    const q = statusFilter ? `?status=${statusFilter}` : '';
    return this.request<any[]>(`/accounts/admin/teachers/${q}`);
  }

  async takeTeacherAction(teacherId: number, action: 'approve' | 'reject', reason?: string) {
    return this.request<any>(`/accounts/admin/teachers/${teacherId}/action/`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
  }
}

export const api = new ApiService();
