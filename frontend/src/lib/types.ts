export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  images: ProductImage[];
  variants: ProductVariant[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  tags: string[];
  availableForSale: boolean;
}

export interface ProductImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: Money;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface CartItem {
  id: string;
  variantId: string;
  title: string;
  variantTitle: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface BookingSlot {
  time: string;
  available: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}
