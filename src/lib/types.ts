export interface DocumentMeta {
  title: string;
  slug: string;
  category: string;
  order: number;
  tags: string[];
  api_method?: string;
  api_path?: string;
  updatedAt?: string;
}

export interface Document extends DocumentMeta {
  content: string;
  filePath: string;
}

export interface DocumentListItem {
  title: string;
  slug: string;
  category: string;
  order: number;
  tags: string[];
  api_method?: string;
  api_path?: string;
  updatedAt?: string;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
}

export interface DocumentHistory {
  id: number;
  file_path: string;
  content: string;
  edited_by: number;
  version: number;
  created_at: string;
  username?: string;
}

export interface SearchResult {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  api_method?: string;
  api_path?: string;
}

export interface SidebarItem {
  title: string;
  slug: string;
  order: number;
  api_method?: string;
}

export interface SidebarCategory {
  name: string;
  items: SidebarItem[];
}
