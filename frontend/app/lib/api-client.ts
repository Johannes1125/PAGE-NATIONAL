// ── BACKEND TODO: Remove these mock interceptors once the backend
// ActivityController is live at GET /api/public/activities and
// GET /api/public/activities/{slug} ──────────────────────────────

import type {
  PaginatedActivitiesResponse,
  ActivityDetailResponse,
} from '../(landing-page)/activities/types';
import type {
  Convention,
  ConventionFull,
  ConventionSchedule,
  ConventionSpeaker,
  ConventionAttachment,
  ConventionApiResponse,
  CreateConventionPayload,
  UpdateConventionPayload,
  CreateSchedulePayload,
  UpdateSchedulePayload,
  CreateSpeakerPayload,
  UpdateSpeakerPayload,
} from '../admin-dashboard/conventions/types';

const MOCK_ACTIVITIES = [
  {
    id: 1,
    title: 'PAGE Strategic Planning Meeting for the 57th International Convention & General Assembly 2026',
    slug: 'page-strategic-planning-meeting-2026',
    description:
      'The Philippine Association for Graduate Education (PAGE), Inc. convened its Strategic Planning Meeting in preparation for the 57th International Convention and General Assembly 2026. The meeting brought together national officers, board members, and committee chairs to coordinate organizational initiatives, finalize convention preparations, assign committee responsibilities, establish implementation timelines, and reinforce PAGE’s commitment to excellence in graduate education and professional development.',
    venue: 'Lyceum of the Philippines University – Cavite',
    date: '2026-06-11',
    type: 'meeting' as const,
    status: 'published' as const,
    gallery: [
      '/57th-Images/57th-International-Convention-Image-1.jpg',
      '/57th-Images/57th-International-Convention-Image-2.jpg',
      '/57th-Images/57th-International-Convention-Image-3.jpg',
      '/57th-Images/57th-International-Convention-Image-4.jpg',
      '/57th-Images/57th-International-Convention-Image-5.jpg',
      '/57th-Images/57th-International-Convention-Image-6.jpg',
      '/57th-Images/57th-International-Convention-Image-7.jpg',
      '/57th-Images/57th-International-Convention-Image-8.jpg',
      '/57th-Images/57th-International-Convention-Image-9.jpg',
      '/57th-Images/57th-International-Convention-Image-10.jpg',
      '/57th-Images/57th-International-Convention-Image-11.jpg',
      '/57th-Images/57th-International-Convention-Image-12.jpg',
      '/57th-Images/57th-International-Convention-Image-13.jpg',
      '/57th-Images/57th-International-Convention-Image-14.jpg',
    ],
    materials: [],
  },
  {
    id: 2,
    title: 'PAGE Region II Oath-Taking Ceremony of Officers and Board Members',
    slug: 'page-region-ii-oath-taking-2026',
    description:
      'The Philippine Association for Graduate Education (PAGE) Region II conducted its Oath-Taking Ceremony of Officers and Board Members on June 22, 2026, at Isabela State University, Cauayan, Isabela. The ceremony formally inducted the newly elected regional officers and board members into their respective positions, signifying their commitment to advancing the association’s mission and strengthening graduate education in the region. The event also fostered leadership, collaboration, and organizational unity among PAGE Region II members as they embarked on a new term of service.',
    venue: 'Isabela State University, Cauayan, Isabela',
    date: '2026-06-22',
    type: 'meeting' as const,
    status: 'published' as const,
    gallery: [
      '/Region-II/Region-II-Image1.jpg',
      '/Region-II/Region-II-Image2.jpg',
      '/Region-II/Region-II-Image3.jpg',
      '/Region-II/Region-II-Image4.jpg',
      '/Region-II/Region-II-Image5.jpg',
      '/Region-II/Region-II-Image6.jpg',
      '/Region-II/Region-II-Image7.jpg',
    ],
    materials: [],
  },
];

const MOCK_YEARS = [2026];
const MOCK_ITEMS_PER_PAGE = 6;

function mockActivitiesIndex(search: string): PaginatedActivitiesResponse {
  const params = new URLSearchParams(search);
  const typeFilter = params.get('type') ?? 'all';
  const yearFilter = params.get('year') ? parseInt(params.get('year')!) : null;
  const page = params.get('page') ? parseInt(params.get('page')!) : 1;
  const timeframe = params.get('timeframe'); // 'latest' (past) or 'future' (upcoming)
  const latestCutoff = new Date();
  latestCutoff.setHours(0, 0, 0, 0);

  let filtered = MOCK_ACTIVITIES.filter(a => {
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    const matchYear = !yearFilter || new Date(a.date).getFullYear() === yearFilter;
    
    let matchTimeframe = true;
    if (timeframe === 'latest') {
      matchTimeframe = new Date(a.date) < latestCutoff;
    } else if (timeframe === 'future') {
      matchTimeframe = new Date(a.date) >= latestCutoff;
    }
    return matchType && matchYear && matchTimeframe;
  });

  // Sort order: future activities sorted ascending by date (soonest first); latest/past sorted descending by date
  if (timeframe === 'future') {
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else {
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * MOCK_ITEMS_PER_PAGE, page * MOCK_ITEMS_PER_PAGE);

  return {
    success: true,
    activities: paginated,
    total,
    page,
    limit: MOCK_ITEMS_PER_PAGE,
    total_pages: Math.ceil(total / MOCK_ITEMS_PER_PAGE),
    years: MOCK_YEARS,
  };
}

function mockActivitiesShow(slug: string): ActivityDetailResponse {
  const activity = MOCK_ACTIVITIES.find(a => a.slug === slug);
  if (!activity) {
    return { success: false, activity: null };
  }
  return { success: true, activity };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
  meta: PaginationMeta;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: any;
}

export interface UserPayload {
  id?: string | number;
  name?: string;
  email: string;
  role: 'admin' | 'organization' | 'member' | string;
  [key: string]: unknown;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  token: string;
  user: UserPayload;
}

const getHeaders = (isMultipart = false) => {
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  headers['Accept'] = 'application/json';

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('page_user_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    // Response might not have JSON body
  }

  if (response.status === 401) {
    const isLoginEndpoint = response.url.endsWith('/login');
    const onLoginPage = typeof window !== 'undefined' && 
      (window.location.pathname === '/member-login' || 
       window.location.pathname === '/org-login' || 
       window.location.pathname === '/admin-login');

    if (!isLoginEndpoint && !onLoginPage) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('page_user_token');
        localStorage.removeItem('page_user_payload');
        
        const path = window.location.pathname;
        if (path.includes('admin')) {
          window.location.href = '/admin-login';
        } else if (path.includes('org')) {
          window.location.href = '/org-login';
        } else {
          window.location.href = '/member-login';
        }
      }
      throw new Error('Session expired. Please log in again.');
    } else {
      const errorMsg = data?.message || 'Invalid credentials. Please try again.';
      const err = new Error(errorMsg) as any;
      err.status = 401;
      throw err;
    }
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as any;
    err.errors = data?.errors;
    err.status = response.status;
    throw err;
  }
  return data;
};

export const api = {
  get: async <T = any>(endpoint: string): Promise<T> => {
    // ── MOCK INTERCEPTORS (remove when backend is ready) ────────────────────
    if (endpoint.startsWith('/public/activities/') && !endpoint.endsWith('/activities/')) {
      const slug = endpoint.replace('/public/activities/', '').split('?')[0];
      await new Promise(r => setTimeout(r, 300)); // simulate latency
      return mockActivitiesShow(slug) as T;
    }
    if (endpoint.startsWith('/public/activities')) {
      const qs = endpoint.includes('?') ? endpoint.split('?')[1] : '';
      await new Promise(r => setTimeout(r, 400));
      return mockActivitiesIndex(qs) as T;
    }
    // ── END MOCK INTERCEPTORS ───────────────────────────────────────────────
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },


  post: async <T = any>(endpoint: string, body: any): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  patch: async <T = any>(endpoint: string, body: any): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  put: async <T = any>(endpoint: string, body: any): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async <T = any>(endpoint: string): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * For uploading files via FormData (featured images, research papers, chat attachments)
   */
  postMultipart: async <T = any>(endpoint: string, formData: FormData): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(response);
  },

  patchMultipart: async <T = any>(endpoint: string, formData: FormData): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(response);
  },
};

// ─── Chapters API ─────────────────────────────────────────────────────────────

export interface ChapterListParams {
  search?: string;
  island_group?: string;
  region?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const chaptersApi = {
  /** GET /chapters — list with filters/sort/pagination */
  list: (params?: ChapterListParams) => {
    const qs = new URLSearchParams();
    if (params?.search)        qs.set('search', params.search);
    if (params?.island_group && params.island_group !== 'All') qs.set('island_group', params.island_group);
    if (params?.region && params.region !== 'All')             qs.set('region', params.region);
    if (params?.status && params.status !== 'All')             qs.set('status', params.status);
    if (params?.sort)          qs.set('sort', params.sort);
    if (params?.page)          qs.set('page', String(params.page));
    if (params?.limit)         qs.set('limit', String(params.limit));
    const query = qs.toString();
    return api.get(`/chapters${query ? `?${query}` : ''}`);
  },

  /** GET /chapters/stats — total/luzon/visayas/mindanao counts */
  stats: () => api.get('/chapters/stats'),

  /** GET /chapters/:id — full chapter with all relations */
  get: (id: string) => api.get(`/chapters/${id}`),

  /** POST /chapters — create chapter */
  create: (dto: Record<string, unknown>) => api.post('/chapters', dto),

  /** PATCH /chapters/:id — update chapter data */
  update: (id: string, dto: Record<string, unknown>) => api.patch(`/chapters/${id}`, dto),

  /** PATCH /chapters/:id/status — update chapter status */
  updateStatus: (id: string, status: 'draft' | 'published' | 'archived') =>
    api.patch(`/chapters/${id}/status`, { status }),

  /** DELETE /chapters/:id */
  delete: (id: string) => api.delete(`/chapters/${id}`),

  /** POST /chapters/upload/image — upload single image, returns { url, fileName } */
  uploadImage: (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.postMultipart('/chapters/upload/image', fd);
  },

  /** POST /chapters/upload/document — upload single document, returns { url, fileName } */
  uploadDocument: (file: File) => {
    const fd = new FormData();
    fd.append('document', file);
    return api.postMultipart('/chapters/upload/document', fd);
  },
};

// ─── Conventions API ──────────────────────────────────────────────────────────

export const conventionsApi = {
  /** GET /conventions — list all, optionally filtered by status */
  list: (status?: string) =>
    api.get<ConventionApiResponse<Convention[]>>(`/conventions${status ? `?status=${status}` : ''}`),

  /** GET /conventions/:id — single convention */
  get: (id: string) =>
    api.get<ConventionApiResponse<Convention>>(`/conventions/${id}`),

  /** GET /conventions/:id/full — convention with schedules, speakers, attachments */
  getFull: (id: string) =>
    api.get<ConventionApiResponse<ConventionFull>>(`/conventions/${id}/full`),

  /** POST /conventions — create base record (Step 1) */
  create: (payload: CreateConventionPayload) =>
    api.post<ConventionApiResponse<Convention>>('/conventions', payload),

  /** PATCH /conventions/:id — update Step 1 fields */
  update: (id: string, payload: UpdateConventionPayload) =>
    api.patch<ConventionApiResponse<Convention>>(`/conventions/${id}`, payload),

  /** POST /conventions/:id/schedules */
  addSchedule: (conventionId: string, payload: CreateSchedulePayload) =>
    api.post<ConventionApiResponse<ConventionSchedule>>(`/conventions/${conventionId}/schedules`, payload),

  /** PATCH /conventions/:id/schedules/:scheduleId */
  updateSchedule: (conventionId: string, scheduleId: string, payload: UpdateSchedulePayload) =>
    api.patch<ConventionApiResponse<ConventionSchedule>>(
      `/conventions/${conventionId}/schedules/${scheduleId}`,
      payload,
    ),

  /** DELETE /conventions/:id/schedules/:scheduleId */
  removeSchedule: (conventionId: string, scheduleId: string) =>
    api.delete<ConventionApiResponse<ConventionSchedule>>(
      `/conventions/${conventionId}/schedules/${scheduleId}`,
    ),

  /** POST /conventions/:id/speakers */
  addSpeaker: (conventionId: string, payload: CreateSpeakerPayload) =>
    api.post<ConventionApiResponse<ConventionSpeaker>>(`/conventions/${conventionId}/speakers`, payload),

  /** PATCH /conventions/:id/speakers/:speakerId */
  updateSpeaker: (conventionId: string, speakerId: string, payload: UpdateSpeakerPayload) =>
    api.patch<ConventionApiResponse<ConventionSpeaker>>(
      `/conventions/${conventionId}/speakers/${speakerId}`,
      payload,
    ),

  /** DELETE /conventions/:id/speakers/:speakerId */
  removeSpeaker: (conventionId: string, speakerId: string) =>
    api.delete<ConventionApiResponse<ConventionSpeaker>>(
      `/conventions/${conventionId}/speakers/${speakerId}`,
    ),

  /** POST /conventions/:id/attachments — multipart file upload */
  addAttachment: (conventionId: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.postMultipart<ConventionApiResponse<ConventionAttachment>>(
      `/conventions/${conventionId}/attachments`,
      fd,
    );
  },

  /** DELETE /conventions/:id/attachments/:attachmentId */
  removeAttachment: (conventionId: string, attachmentId: string) =>
    api.delete<ConventionApiResponse<ConventionAttachment>>(
      `/conventions/${conventionId}/attachments/${attachmentId}`,
    ),

  /** PATCH /conventions/:id/publish */
  publish: (id: string) =>
    api.patch<ConventionApiResponse<Convention>>(`/conventions/${id}/publish`, {}),

  /** PATCH /conventions/:id/unpublish */
  unpublish: (id: string) =>
    api.patch<ConventionApiResponse<Convention>>(`/conventions/${id}/unpublish`, {}),

  /** DELETE /conventions/:id */
  delete: (id: string) => api.delete<ConventionApiResponse<Convention>>(`/conventions/${id}`),
};

