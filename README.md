# Premium Salon Beauty Brand - Technical Implementation

> A modern, scalable beauty ecommerce platform combining premium design with smart customer tools

## 🎯 Project Overview

This project builds a premium beauty brand experience starting with custom press-on nails and expanding into a comprehensive beauty supply and services platform.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CUSTOMER                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  VERCEL (Frontend)                                           │
│  ├─ Next.js Application                                      │
│  ├─ Premium UI/UX                                           │
│  ├─ Product Discovery                                        │
│  ├─ Chatbot Interface                                        │
│  ├─ Booking Interface                                        │
│  └─ Custom Fit Experience                                    │
└────────────────────┬───────────────────┬────────────────────┘
                     │                   │
                     ▼                   ▼
┌──────────────────────────┐  ┌─────────────────────────────┐
│  SHOPIFY (Commerce)      │  │  RAILWAY (Backend)          │
│  ├─ Product Catalog      │  │  ├─ API Services            │
│  ├─ Checkout            │  │  ├─ Chatbot Logic           │
│  ├─ Payments            │  │  ├─ Booking System          │
│  ├─ Customer Accounts   │  │  ├─ Nail Scan Processing   │
│  ├─ Order Management    │  │  ├─ Fit Profile Storage    │
│  └─ Inventory           │  │  └─ Shopify Integration    │
└──────────────────────────┘  └─────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend (Vercel)
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI / shadcn/ui
- **Animations**: Framer Motion
- **State Management**: Zustand / React Query
- **Forms**: React Hook Form + Zod

### Commerce (Shopify)
- **Platform**: Shopify
- **Integration**: Shopify Storefront API
- **SDK**: @shopify/hydrogen-react

### Backend (Railway)
- **Runtime**: Node.js / Python
- **Framework**: Express / FastAPI
- **Database**: PostgreSQL
- **File Storage**: Railway Volumes / S3
- **AI/ML**: OpenAI API, Custom CV models

## 📋 Features by Phase

### Phase 1: Core Ecommerce (MVP)
- [ ] Premium homepage with hero imagery
- [ ] Shopify product integration
- [ ] Product listing & detail pages
- [ ] Shopping cart & checkout
- [ ] Mobile-responsive design
- [ ] Basic chatbot (FAQ)
- [ ] Appointment booking page
- [ ] Contact forms

### Phase 2: Custom Fit Technology
- [ ] Nail scan upload interface
- [ ] Image processing pipeline
- [ ] Fit profile storage
- [ ] Customer account integration
- [ ] Custom sizing in orders
- [ ] Reorder functionality

### Phase 3: Beauty Brand Expansion
- [ ] Beauty product categories
- [ ] Advanced chatbot (NLP)
- [ ] Subscription system
- [ ] Loyalty program
- [ ] Educational content
- [ ] Service booking system
- [ ] Beauty consultations

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+
npm or pnpm
Shopify store
Vercel account
Railway account
```

### Installation
```bash
# Clone the repository
git clone https://github.com/Haroldtrapier/Salon-setup.git
cd Salon-setup

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables
```env
# Shopify
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-token

# Railway Backend
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 📁 Project Structure

```
salon-setup/
├── app/                    # Next.js app directory
│   ├── (routes)/          # Route groups
│   │   ├── shop/         # Product pages
│   │   ├── custom-fit/   # Fit experience
│   │   ├── book/         # Appointments
│   │   └── about/        # Brand pages
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── shop/             # Shopping components
│   ├── chatbot/          # Chatbot components
│   └── booking/          # Booking components
├── lib/                   # Utilities
│   ├── shopify.ts        # Shopify client
│   ├── railway.ts        # Railway API client
│   └── utils.ts          # Helper functions
├── public/               # Static assets
├── styles/               # Global styles
└── types/                # TypeScript types
```

## 🎨 Design Principles

1. **Visual First**: Large, high-quality imagery drives the experience
2. **Clean & Spacious**: Generous white space, elegant typography
3. **Mobile First**: Optimized for mobile shopping
4. **Premium Feel**: Editorial layouts, luxury aesthetics
5. **Fast & Smooth**: Optimized performance, smooth animations

## 🔗 Key Integrations

- **Shopify Storefront API**: Product data, cart, checkout
- **Railway Backend**: Custom logic, chatbot, fit profiles
- **OpenAI API**: Chatbot intelligence
- **Booking System**: Calendar integration (Calendly/Acuity/Custom)
- **Analytics**: Google Analytics, Shopify Analytics

## 📖 Documentation

- [Vision Document](./Salon-setup.md) - Full project vision and requirements
- [Technical Spec](./TECHNICAL_SPEC.md) - Detailed technical specifications
- [API Documentation](./API.md) - Backend API reference
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment steps

## 🤝 Contributing

This is a private project. For questions or suggestions, contact the project owner.

## 📄 License

Private - All Rights Reserved

---

**Built with** ❤️ **for premium beauty experiences**