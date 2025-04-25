
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  category: string;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
