export type Store = {
  id: number;
  nama: string;
  alamat: string | null;
  jam_buka: string | null;
  jam_tutup: string | null;
  rating: number;
  ulasan_count: number;
  sort_order: number;
  image_url: string | null;
  approval_status: string;
};

export type MenuItem = {
  id: number;
  nama: string;
  deskripsi: string | null;
  harga: string | null;
  sort_order: number;
  image_url: string | null;
  store_id: number | null;
  store_nama?: string | null;
  store_alamat?: string | null;
};

export type Testimonial = {
  id: number;
  nama: string;
  ulasan: string | null;
  waktu: string | null;
  stars: number;
  approved: number;
  target_type?: string | null;
  target_id?: number | null;
  target_nama?: string | null;
  sort_order?: number;
};

export type Faq = { id: number; question: string; answer: string | null; sort_order: number };

export type ContentBlock = Record<string, string | string[]>;
export type SiteContent = Record<string, ContentBlock>;

export type SiteData = {
  content: SiteContent;
  stores: Store[];
  menu: MenuItem[];
  testimonials: Testimonial[];
  faqs: Faq[];
};

export type User = {
  loggedIn: boolean;
  nama?: string;
  email?: string;
  role?: string;
  status?: string;
  store_id?: number | null;
};
