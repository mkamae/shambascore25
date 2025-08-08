import { Product, Creator, AnalyticsData, ProductType, CreatorStatus } from './types';

export const MOCK_APPROVED_CREATOR: Creator = {
  id: 'creator-1',
  name: "Aisha's Closet",
  idNumber: '31234567',
  telephoneNumber: '0712345678',
  handle: '@aishaclosetke',
  avatarUrl: 'https://picsum.photos/seed/creator_avatar/100/100',
  bio: 'Curated thrift finds & custom jewelry. Delivering style across Nairobi. 🇰🇪',
  mpesaNumber: '0712 345 678',
  status: CreatorStatus.APPROVED,
  businessCategory: 'Fashion & Apparel',
  instagramHandle: 'aishascloset.ke',
};

export const MOCK_PENDING_APPLICATIONS: Creator[] = [
    {
        id: 'creator-2',
        name: "Ken's Kicks",
        idNumber: '32345678',
        telephoneNumber: '0723456789',
        handle: '@kenskicks',
        avatarUrl: 'https://picsum.photos/seed/creator_ken/100/100',
        bio: 'Exclusive sneakers and streetwear.',
        mpesaNumber: '0723 456 789',
        status: CreatorStatus.PENDING,
        businessCategory: 'Footwear',
        instagramHandle: 'kenskicks',
    },
    {
        id: 'creator-3',
        name: 'Sanaa Fest',
        idNumber: 'P1234567',
        telephoneNumber: '0798765432',
        handle: '@sanaafest',
        avatarUrl: 'https://picsum.photos/seed/creator_sanaa/100/100',
        bio: 'The biggest art and music festival in the city.',
        mpesaNumber: '987654', // Till Number
        status: CreatorStatus.PENDING,
        businessCategory: 'Events & Entertainment',
        instagramHandle: 'sanaafestival',
    },
];


export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Vintage Denim Jacket',
    price: 2500,
    description: 'Classic 90s oversized denim jacket. Perfect condition.',
    imageUrls: ['https://picsum.photos/seed/denim_jacket/400/400'],
    type: ProductType.PRODUCT,
    stock: 5,
  },
  {
    id: 'prod-2',
    name: 'Afro-Jazz Night Ticket',
    price: 1500,
    description: 'Entry to our exclusive live music event. One night only!',
    imageUrls: ['https://picsum.photos/seed/jazz_night/400/400'],
    type: ProductType.EVENT,
    eventDate: '2024-08-15T19:00:00',
  },
  {
    id: 'prod-3',
    name: 'Handmade Beaded Earrings',
    price: 800,
    description: 'Colorful Maasai-inspired beaded earrings. Handcrafted with love.',
    imageUrls: [
        'https://picsum.photos/seed/earrings/400/400',
        'https://picsum.photos/seed/earrings_detail/400/400',
        'https://picsum.photos/seed/earrings_model/400/400'
    ],
    type: ProductType.PRODUCT,
    stock: 20,
  },
  {
    id: 'prod-4',
    name: 'Styling Consultation',
    price: 5000,
    description: 'A one-hour personal styling session with Aisha. Virtual or in-person.',
    imageUrls: ['https://picsum.photos/seed/styling/400/400'],
    type: ProductType.SERVICE,
  },
];

export const MOCK_ANALYTICS: AnalyticsData = {
    views: 12450,
    clicks: 3890,
    sales: 128,
    revenue: 185600, // Gross Revenue
    platformFee: 18560, // 10% platform fee
    netRevenue: 167040, // Gross - Fee
}