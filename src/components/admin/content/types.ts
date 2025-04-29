
export interface Section {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface ContentData {
  title: string;
  subtitle?: string;
  description: string;
  heroImage?: string;
  sections: Section[];
}
