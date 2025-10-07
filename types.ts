export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
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

export type CheckoutPhase = 'browsing' | 'confirming' | 'processing' | 'complete';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: Date;
}
