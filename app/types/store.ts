export interface StoreItem {
    id: number,
    titleKey: string,
    subtitle: string,
    url: string
}

// Tipos para Sanity
export interface SanityProductContent {
  title: string;
  subtitle: string;
}

export interface SanityProduct {
  _id: string;
  _type: 'product';
  category: 'photo' | 'postcard';
  image: any; // Sanity image reference
  content: {
    es: SanityProductContent;
    en: SanityProductContent;
  };
  description?: {
    es?: string;
    en?: string;
  };
  pricing: {
    argentina?: {
      price: number;
      enabled: boolean;
    };
    brazil?: {
      price: number;
      enabled: boolean;
    };
    chile?: {
      price: number;
      enabled: boolean;
    };
    colombia?: {
      price: number;
      enabled: boolean;
    };
    mexico?: {
      price: number;
      enabled: boolean;
    };
    peru?: {
      price: number;
      enabled: boolean;
    };
    uruguay?: {
      price: number;
      enabled: boolean;
    };
  };
  isAvailable: boolean;
  order: number;
  tags?: string[];
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    featured?: boolean;
  };
}

export interface SanityProducts {
  photos: SanityProduct[];
  postcards: SanityProduct[];
}