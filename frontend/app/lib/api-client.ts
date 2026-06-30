// ── BACKEND TODO: Remove these mock interceptors once the backend
// ActivityController is live at GET /api/public/activities and
// GET /api/public/activities/{slug} ──────────────────────────────

import type {
  PaginatedActivitiesResponse,
  ActivityDetailResponse,
} from '../(landing-page)/activities/types';

const MOCK_GALLERY_BASE = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80',
  'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
];

const MOCK_ACTIVITIES = [
  {
    id: 1,
    title: 'PAGE National Conference 2026: Innovation in Graduate Education',
    slug: 'page-national-conference-2026',
    description: 'The Philippine Association for Graduate Education proudly presents its flagship annual conference themed "Innovation in Graduate Education." Over three days, graduate school administrators, faculty, researchers, and students from over 120 member institutions will convene to share groundbreaking research, explore best practices, and shape the future of Philippine graduate education.\n\nThis year\'s event features distinguished keynote speakers from academia, government, and international organizations, covering topics such as AI in graduate research, internationalization, and student mental health. Special breakout sessions, workshops, and a graduate student research forum round out the program.',
    venue: 'SMX Convention Center, Pasay City, Metro Manila',
    date: '2026-04-14',
    type: 'conference' as const,
    status: 'published' as const,
    gallery: MOCK_GALLERY_BASE.slice(0, 4),
    materials: [
      { file_name: 'Conference_Program_2026.pdf', file_path: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf' },
      { file_name: 'Abstract_Booklet_2026.pdf', file_path: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf' },
      { file_name: 'Registration_Form.docx', file_path: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf' },
    ],
  },
  {
    id: 2,
    title: 'Seminar on Hybrid Learning Models in Graduate Programs',
    slug: 'seminar-hybrid-learning-2026',
    description: 'This half-day seminar explores the efficacy of hybrid and blended educational models within graduate programs across Philippine universities. Speakers from leading institutions share insights on student retention, satisfaction, and academic outcomes in post-pandemic learning environments.',
    venue: 'University of the Philippines, Diliman',
    date: '2026-03-20',
    type: 'seminar' as const,
    status: 'published' as const,
    gallery: MOCK_GALLERY_BASE.slice(1, 4),
    materials: [
      { file_name: 'Seminar_Slides_Hybrid_Learning.pdf', file_path: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf' },
    ],
  },
  {
    id: 3,
    title: 'Workshop on Research Methodology for Graduate Faculty',
    slug: 'workshop-research-methodology-2026',
    description: 'A two-day intensive workshop designed for graduate faculty members seeking to deepen their expertise in contemporary research methodologies. Topics include qualitative and quantitative approaches, ethical research practices, and publishing in peer-reviewed journals.',
    venue: 'De La Salle University, Manila',
    date: '2026-02-10',
    type: 'workshop' as const,
    status: 'published' as const,
    gallery: MOCK_GALLERY_BASE.slice(2, 5),
    materials: [
      { file_name: 'Workshop_Guide_Research_Methods.pdf', file_path: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf' },
      { file_name: 'Participant_Workbook.pdf', file_path: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf' },
    ],
  },
  {
    id: 4,
    title: 'International Collaboration Summit 2026',
    slug: 'international-collaboration-summit-2026',
    description: 'PAGE facilitates a landmark collaboration summit connecting Philippine graduate schools with partner institutions across Asia, Europe, and North America. This summit builds pathways for joint research, student exchange, and faculty development programs.',
    venue: 'Sofitel Philippine Plaza, Pasay City',
    date: '2026-01-28',
    type: 'conference' as const,
    status: 'published' as const,
    gallery: [MOCK_GALLERY_BASE[0], MOCK_GALLERY_BASE[3], MOCK_GALLERY_BASE[5]],
    materials: [
      { file_name: 'Summit_Agenda_2026.pdf', file_path: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf' },
    ],
  },
  {
    id: 5,
    title: 'Graduate Education Policy Forum 2025',
    slug: 'graduate-education-policy-forum-2025',
    description: 'A policy forum bringing together CHED officials, university presidents, and graduate school deans to discuss emerging policies affecting Philippine graduate education. Key agenda items include new accreditation guidelines and research funding mechanisms.',
    venue: 'CHED Central Office, Quezon City',
    date: '2025-11-15',
    type: 'seminar' as const,
    status: 'published' as const,
    gallery: MOCK_GALLERY_BASE.slice(0, 3),
    materials: [
      { file_name: 'Policy_Forum_Proceedings_2025.pdf', file_path: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf' },
    ],
  },
  {
    id: 6,
    title: 'Writing for Publication: Workshop for Graduate Scholars',
    slug: 'writing-for-publication-workshop-2025',
    description: 'A targeted workshop for graduate students and junior faculty on academic writing for high-impact publication. Topics include structuring arguments, navigating peer review, and selecting appropriate journals for research output.',
    venue: 'Ateneo de Manila University, Quezon City',
    date: '2025-10-05',
    type: 'workshop' as const,
    status: 'published' as const,
    gallery: [MOCK_GALLERY_BASE[1], MOCK_GALLERY_BASE[4]],
    materials: [
      { file_name: 'Writing_Workshop_Handout.pdf', file_path: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf' },
      { file_name: 'Sample_Manuscript_Template.docx', file_path: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf' },
    ],
  },
  {
    id: 7,
    title: 'PAGE Regional Summit — Visayas Cluster',
    slug: 'regional-summit-visayas-2025',
    description: 'The first regional summit for PAGE member institutions in the Visayas region, focusing on strengthening inter-institutional research collaborations and graduate program quality assurance within the cluster.',
    venue: 'University of San Carlos, Cebu City',
    date: '2025-08-22',
    type: 'other' as const,
    status: 'published' as const,
    gallery: [MOCK_GALLERY_BASE[2], MOCK_GALLERY_BASE[5]],
    materials: [],
  },
  {
    id: 8,
    title: 'PAGE Annual Convention 2024: Graduate Education Excellence',
    slug: 'annual-convention-2024',
    description: 'The PAGE Annual Convention 2024 brought together over 500 graduate education professionals for three days of keynote addresses, research presentations, and networking sessions highlighting excellence in Philippine graduate education.',
    venue: 'Waterfront Hotel, Cebu City',
    date: '2024-05-08',
    type: 'conference' as const,
    status: 'published' as const,
    gallery: MOCK_GALLERY_BASE,
    materials: [
      { file_name: 'Convention_Souvenir_Program_2024.pdf', file_path: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf' },
      { file_name: 'Research_Abstracts_2024.pdf', file_path: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf' },
    ],
  },
  {
    id: 9,
    title: 'PAGE National Conference 2027: Reimagining Graduate Research',
    slug: 'page-national-conference-2027',
    description: 'The upcoming 2027 PAGE National Conference will examine how cyber-physical systems and advanced computing technologies interface with qualitative and quantitative graduate research projects in the digital age.',
    venue: 'Boracay Regency Convention Center, Aklan',
    date: '2027-04-14',
    type: 'conference' as const,
    status: 'published' as const,
    gallery: [MOCK_GALLERY_BASE[0], MOCK_GALLERY_BASE[2], MOCK_GALLERY_BASE[4]],
    materials: [],
  },
  {
    id: 10,
    title: 'Seminar on Transnational Research Collaborations and Grants',
    slug: 'seminar-transnational-research-2026',
    description: 'This seminar focuses on the administrative pathways for establishing credit transfer agreements and research linkages with ASEAN and European partner universities under CHED initiatives.',
    venue: 'University of San Carlos, Cebu City',
    date: '2026-08-20',
    type: 'seminar' as const,
    status: 'published' as const,
    gallery: [MOCK_GALLERY_BASE[1], MOCK_GALLERY_BASE[3]],
    materials: [],
  },
  {
    id: 11,
    title: 'Workshop on Advanced Thesis Advising & Mentorship Standards',
    slug: 'workshop-thesis-advising-2026',
    description: 'A dedicated capacity-building session for graduate school thesis mentors. This workshop details best practices in dissertation guidance, preventing citation issues, and tracking research progress.',
    venue: 'Notre Dame of Marbel University, Koronadal City',
    date: '2026-11-12',
    type: 'workshop' as const,
    status: 'published' as const,
    gallery: [MOCK_GALLERY_BASE[4], MOCK_GALLERY_BASE[5]],
    materials: [],
  },
];

const MOCK_YEARS = [2027, 2026, 2025, 2024];
const MOCK_ITEMS_PER_PAGE = 6;

function mockActivitiesIndex(search: string): PaginatedActivitiesResponse {
  const params = new URLSearchParams(search);
  const typeFilter = params.get('type') ?? 'all';
  const yearFilter = params.get('year') ? parseInt(params.get('year')!) : null;
  const page = params.get('page') ? parseInt(params.get('page')!) : 1;
  const timeframe = params.get('timeframe'); // 'latest' (past) or 'future' (upcoming)

  let filtered = MOCK_ACTIVITIES.filter(a => {
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    const matchYear = !yearFilter || new Date(a.date).getFullYear() === yearFilter;
    
    let matchTimeframe = true;
    if (timeframe === 'latest') {
      matchTimeframe = new Date(a.date) < new Date('2026-06-09');
    } else if (timeframe === 'future') {
      matchTimeframe = new Date(a.date) >= new Date('2026-06-09');
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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: any;
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

