export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ChatMessage {
  sender: 'user' | 'agent';
  content: string;
}

export type CheckoutPhase = 'browsing' | 'confirming' | 'authorizing' | 'processing' | 'complete';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: Date;
}