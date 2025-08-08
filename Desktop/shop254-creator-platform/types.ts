export enum ProductType {
  PRODUCT = 'product',
  SERVICE = 'service',
  EVENT = 'event',
}

export enum CreatorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrls: string[];
  type: ProductType;
  stock?: number; // For physical products
  eventDate?: string; // For events
}

export interface Creator {
  id: string;
  name:string;
  idNumber: string;
  telephoneNumber: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  mpesaNumber: string;
  status: CreatorStatus;
  businessCategory: string;
  rejectionReason?: string;
  instagramHandle?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
    id: string;
    items: CartItem[];
    total: number;
    customerPhone: string;
    paymentMethod: 'M-Pesa' | 'Airtel Money';
    date: Date;
}

export interface AnalyticsData {
    views: number;
    clicks: number;
    sales: number;
    revenue: number; // Represents Gross Revenue
    platformFee: number;
    netRevenue: number;
}