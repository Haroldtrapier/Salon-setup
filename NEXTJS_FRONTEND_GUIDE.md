# Next.js Frontend Setup - Complete Guide

> Build the premium salon frontend with Next.js 14

## 🎯 What You'll Build

A beautiful, fast, premium beauty ecommerce frontend featuring:
- Server-side rendered product pages
- Shopify integration for products and checkout
- Chatbot interface
- Booking system
- Mobile-first responsive design
- Optimized images and performance

---

## 📁 Project Structure

Create this structure in your repository:

```
salon-setup/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   ├── globals.css               # Global styles
│   ├── shop/
│   │   ├── page.tsx              # Shop page
│   │   └── [handle]/
│   │       └── page.tsx          # Product detail
│   ├── cart/
│   │   └── page.tsx              # Cart page
│   ├── custom-fit/
│   │   └── page.tsx              # Custom fit info
│   ├── book/
│   │   └── page.tsx              # Booking page
│   ├── about/
│   │   └── page.tsx              # About page
│   └── api/
│       └── [...routes]/
│           └── route.ts          # API routes
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── shop/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── VariantSelector.tsx
│   │   └── AddToCart.tsx
│   ├── chatbot/
│   │   ├── ChatWidget.tsx
│   │   ├── ChatWindow.tsx
│   │   └── MessageBubble.tsx
│   ├── booking/
│   │   ├── BookingForm.tsx
│   │   └── ServiceSelector.tsx
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/
│   ├── shopify.ts                # Shopify client
│   ├── api.ts                    # API client (Railway)
│   ├── utils.ts                  # Utility functions
│   └── constants.ts              # Constants
├── types/
│   ├── product.ts
│   ├── cart.ts
│   └── booking.ts
├── public/
│   ├── images/
│   └── fonts/
├── styles/
├── .env.local                    # Environment variables
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🚀 Quick Start with Cursor

If using Cursor Agent to build this, provide:

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest salon-setup --typescript --tailwind --app --no-src-dir
cd salon-setup
```

### 2. Install Dependencies

```bash
npm install @shopify/hydrogen-react zustand react-query framer-motion
npm install -D @types/node
```

### 3. Set Up shadcn/ui

```bash
npx shadcn-ui@latest init
```

Add components:
```bash
npx shadcn-ui@latest add button card input dialog accordion
```

---

## 📦 Complete package.json

```json
{
  "name": "salon-setup",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "14.1.0",
    "@shopify/hydrogen-react": "^2023.10.0",
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.17.0",
    "framer-motion": "^10.16.16",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.307.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-select": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0"
  }
}
```

---

## ⚙️ Configuration Files

### `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
    NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig
```

### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f5f5f5',
          foreground: '#000000',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-playfair)'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

### `.env.example`

```env
# Shopify
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_your_token

# Railway Backend API
NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 📚 Core Files

### `lib/shopify.ts` - Shopify Client

```typescript
import { createStorefrontApiClient } from '@shopify/hydrogen-react';

const client = createStorefrontApiClient({
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!,
  storefrontAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
  storefrontApiVersion: '2024-01',
});

export const shopifyFetch = async <T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: any;
}): Promise<T> => {
  try {
    const response = await client.request(query, { variables });
    return response.data as T;
  } catch (error) {
    console.error('Shopify fetch error:', error);
    throw error;
  }
};

// Get all products
export async function getProducts() {
  const query = `
    query GetProducts {
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;
  return shopifyFetch({ query });
}

// Get product by handle
export async function getProduct(handle: string) {
  const query = `
    query GetProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        variants(first: 10) {
          edges {
            node {
              id
              title
              priceV2 {
                amount
                currencyCode
              }
              availableForSale
            }
          }
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
      }
    }
  `;
  return shopifyFetch({ query, variables: { handle } });
}

export { client };
```

### `lib/api.ts` - Railway API Client

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Chat with bot
export async function sendChatMessage(message: string, sessionId: string) {
  const response = await fetch(`${API_URL}/api/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),
  });
  return response.json();
}

// Get booking availability
export async function getAvailability(date: string) {
  const response = await fetch(`${API_URL}/api/booking/availability?date=${date}`);
  return response.json();
}

// Create booking
export async function createBooking(bookingData: any) {
  const response = await fetch(`${API_URL}/api/booking/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
  return response.json();
}
```

### `app/layout.tsx` - Root Layout

```typescript
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ChatWidget from '@/components/chatbot/ChatWidget'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Salon - Premium Press-On Nails',
  description: 'Custom-fit press-on nails designed for your unique style',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  )
}
```

### `app/page.tsx` - Homepage

```typescript
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.jpg"
            alt="Premium nail sets"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="font-serif text-6xl md:text-8xl mb-4">
            Your Nails, Perfected
          </h1>
          <p className="text-xl mb-8">Custom-fit press-on nails designed for you</p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/shop">Shop Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/custom-fit">Learn About Custom Fit</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Custom Fit</h3>
              <p className="text-gray-600">
                Upload photos of your nails for a perfect fit every time
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                Salon-quality nails that last 1-2 weeks
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Easy Application</h3>
              <p className="text-gray-600">
                5-minute application, no salon visit needed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8">Discover your perfect nail set today</p>
          <Button asChild size="lg" variant="outline">
            <Link href="/shop">Browse Collections</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
```

### `app/shop/page.tsx` - Shop Page

```typescript
import { getProducts } from '@/lib/shopify'
import ProductGrid from '@/components/shop/ProductGrid'

export default async function ShopPage() {
  const data = await getProducts()
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="font-serif text-5xl mb-8">Shop All Nails</h1>
      <ProductGrid products={data.products.edges} />
    </div>
  )
}
```

### `components/shop/ProductCard.tsx`

```typescript
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

interface ProductCardProps {
  product: any
}

export default function ProductCard({ product }: ProductCardProps) {
  const { node } = product
  const image = node.images.edges[0]?.node
  const price = node.priceRange.minVariantPrice

  return (
    <Link href={`/shop/${node.handle}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square relative overflow-hidden">
          {image && (
            <Image
              src={image.url}
              alt={image.altText || node.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold mb-2">{node.title}</h3>
          <p className="text-gray-600">
            ${parseFloat(price.amount).toFixed(2)} {price.currencyCode}
          </p>
        </div>
      </Card>
    </Link>
  )
}
```

### `components/chatbot/ChatWidget.tsx`

```typescript
'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ChatWindow from './ChatWindow'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-96 h-[500px] z-50">
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Chat Button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full w-16 h-16 shadow-lg z-40"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>
    </>
  )
}
```

---

## 🚀 Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Add Next.js frontend"
git push origin main
```

### 2. Vercel Auto-Deploys

- Vercel detects changes
- Builds and deploys automatically
- Available at your Vercel URL

### 3. Add Environment Variables in Vercel

1. Go to Vercel project → Settings → Environment Variables
2. Add all variables from `.env.example`
3. Redeploy

---

## ✅ Development Checklist

### Setup
- [ ] Next.js 14 initialized
- [ ] TypeScript configured
- [ ] Tailwind CSS installed
- [ ] shadcn/ui components added
- [ ] Environment variables set

### Pages
- [ ] Homepage created
- [ ] Shop page with product grid
- [ ] Product detail page
- [ ] Cart page
- [ ] Custom fit page
- [ ] Booking page
- [ ] About page

### Components
- [ ] Header with navigation
- [ ] Footer
- [ ] Product card
- [ ] Add to cart button
- [ ] Chat widget
- [ ] Booking form

### Integration
- [ ] Shopify products fetching
- [ ] Cart functionality
- [ ] Checkout redirect
- [ ] Railway API connected
- [ ] Chatbot working

### Optimization
- [ ] Images optimized
- [ ] Mobile responsive
- [ ] SEO meta tags
- [ ] Loading states
- [ ] Error handling

---

**Your Next.js frontend is ready to build!** 🎉