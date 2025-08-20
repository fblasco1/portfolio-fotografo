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
  price: number;
  isAvailable: boolean;
  order: number;
}

export interface SanityProducts {
  photos: SanityProduct[];
  postcards: SanityProduct[];
}