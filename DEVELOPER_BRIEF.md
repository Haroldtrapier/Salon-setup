# Developer Build Brief - Premium Salon Beauty Platform

## 🎯 Project Mission

Build a premium, highly visual beauty brand ecommerce platform that feels modern, luxurious, and tech-forward. Start with custom press-on nails and architect for future expansion into comprehensive beauty services.

---

## 🏗️ System Architecture

### Three-Tier Architecture

**1. Frontend Layer (Vercel + Next.js)**
- Premium custom UI/UX
- Product discovery and shopping
- Custom fit experience
- Chatbot interface
- Booking interface

**2. Commerce Layer (Shopify)**
- Product catalog management
- Checkout and payments
- Customer accounts
- Order management
- Inventory tracking

**3. Backend Layer (Railway)**
- RESTful API services
- Chatbot logic and NLP
- Appointment booking system
- Nail scan processing
- Fit profile storage
- Shopify webhook handlers
- Integration orchestration

---

## 📋 Phase 1: MVP Requirements

### Frontend (Vercel)

#### Pages Required

**Homepage**
- Hero section with full-screen imagery
- Featured collections carousel
- "How Custom Fit Works" section
- Customer testimonials
- CTA for shopping and booking
- Mobile-optimized

**Shop Pages**
- `/shop` - Main collection grid
- `/shop/[collection]` - Filtered collection view
- `/shop/product/[handle]` - Product detail page
- `/cart` - Shopping cart
- Product filtering (shape, length, color, finish)
- Quick view modals
- Variant selector
- Add to cart functionality

**Custom Fit Pages**
- `/custom-fit` - Explainer page
- `/custom-fit/upload` - Photo upload interface (Phase 2)
- `/custom-fit/profile` - Saved fit profile (Phase 2)

**Booking Pages**
- `/book` - Service selection
- `/book/appointment` - Booking form
- Embedded calendar widget

**Informational Pages**
- `/about` - Brand story
- `/faq` - Frequently asked questions
- `/contact` - Contact form

**Legal Pages**
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/shipping` - Shipping info
- `/returns` - Return policy

#### Components Required

**Navigation**
```tsx
- Header with logo, nav menu, search, cart icon
- Mobile hamburger menu
- Sticky header on scroll
- Cart drawer/modal
```

**Product Components**
```tsx
- ProductCard: Grid item with image, title, price
- ProductGallery: Image carousel with zoom
- VariantSelector: Size/color/style picker
- AddToCart: Button with loading states
- PriceDisplay: Formatted pricing with sale support
```

**Chatbot Components**
```tsx
- ChatWidget: Floating chat button
- ChatWindow: Expandable chat interface
- MessageBubble: User and bot messages
- QuickReplies: Suggested actions
```

**Booking Components**
```tsx
- ServiceSelector: Service type picker
- DateTimePicker: Calendar and time slots
- BookingForm: Customer info collection
- ConfirmationCard: Booking summary
```

**UI Library**
- Use shadcn/ui for base components
- Radix UI primitives
- Custom theme with brand colors
- Framer Motion for animations

#### Styling Guidelines

**Design Tokens**
```css
/* Colors */
--primary: #... (brand primary)
--secondary: #... (accent color)
--background: #FFFFFF
--text: #000000
--muted: #F5F5F5

/* Typography */
--font-heading: 'Playfair Display', serif
--font-body: 'Inter', sans-serif
--font-mono: 'JetBrains Mono', monospace

/* Spacing */
--spacing-unit: 8px
--container-max: 1440px

/* Animations */
--ease-smooth: cubic-bezier(0.4, 0.0, 0.2, 1)
--transition-fast: 150ms
--transition-base: 300ms
```

**Visual Principles**
- Generous white space (min 24px between sections)
- Large, high-quality images (min 1200px width)
- Subtle animations on interactions
- Mobile-first responsive design
- Fast load times (LCP < 2.5s)

---

### Backend (Railway)

#### API Endpoints Required

**Chatbot API**
```
POST /api/chat/message
- Input: { message: string, sessionId: string }
- Output: { response: string, suggestions: string[] }

GET /api/chat/history/:sessionId
- Output: { messages: Message[] }
```

**Booking API**
```
GET /api/booking/availability
- Query: date, service
- Output: { slots: TimeSlot[] }

POST /api/booking/create
- Input: { service, datetime, customer, notes }
- Output: { bookingId, confirmation }

GET /api/booking/:id
- Output: { booking: BookingDetails }
```

**Custom Fit API (Phase 2)**
```
POST /api/fit/upload
- Input: { images: File[], customerId }
- Output: { scanId, status }

GET /api/fit/profile/:customerId
- Output: { measurements: NailMeasurements }

POST /api/fit/save
- Input: { customerId, measurements }
- Output: { profileId }
```

**Shopify Integration**
```
POST /api/shopify/webhook/order-created
POST /api/shopify/webhook/order-updated
POST /api/shopify/webhook/customer-created
```

#### Database Schema

**PostgreSQL Tables**

```sql
-- Customers extended profile
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY,
  shopify_customer_id BIGINT UNIQUE,
  email VARCHAR(255),
  fit_profile_id UUID,
  preferences JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Fit profiles
CREATE TABLE fit_profiles (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customer_profiles(id),
  measurements JSONB,
  scan_images TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customer_profiles(id),
  service_type VARCHAR(100),
  scheduled_at TIMESTAMP,
  duration_minutes INTEGER,
  status VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Chat sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY,
  customer_id UUID,
  messages JSONB[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Tech Stack

**Backend Runtime**
- Node.js 20+ with Express.js
- OR Python 3.11+ with FastAPI

**Key Libraries**
```json
// Node.js
{
  "express": "^4.18.0",
  "@shopify/shopify-api": "^7.0.0",
  "pg": "^8.11.0",
  "openai": "^4.0.0",
  "zod": "^3.22.0",
  "cors": "^2.8.5"
}

// Python
{
  "fastapi": "^0.104.0",
  "shopify-python-api": "^12.0.0",
  "psycopg2-binary": "^2.9.0",
  "openai": "^1.0.0",
  "pydantic": "^2.0.0"
}
```

---

### Shopify Configuration

#### Required Setup

1. **Create Shopify Store**
   - Store name: [client-provided]
   - Plan: Basic or higher

2. **Enable Storefront API**
   - Create custom app
   - Enable Storefront API access
   - Required scopes:
     - `unauthenticated_read_product_listings`
     - `unauthenticated_read_product_inventory`
     - `unauthenticated_write_checkouts`
     - `unauthenticated_read_customer_tags`

3. **Product Structure**
   ```
   Product:
     - Title
     - Description (rich text)
     - Images (multiple, high-res)
     - Variants:
       - Shape (Almond, Coffin, Square, Stiletto, etc.)
       - Length (Short, Medium, Long, XL)
       - Finish (Glossy, Matte, Chrome)
     - Metafields:
       - custom_fit_available (boolean)
       - difficulty_level (string)
       - wear_duration (string)
   ```

4. **Collections Setup**
   - New Arrivals
   - Best Sellers
   - By Style (French Tip, Ombre, Solid, etc.)
   - By Occasion (Everyday, Special Event, Bridal)
   - By Color Family

5. **Webhooks Configuration**
   ```
   orders/create → https://api.railway.app/api/shopify/webhook/order-created
   orders/updated → https://api.railway.app/api/shopify/webhook/order-updated
   customers/create → https://api.railway.app/api/shopify/webhook/customer-created
   ```

---

## 🤖 Chatbot Implementation

### Chatbot Strategy

**Primary Functions**
1. Answer product questions
2. Explain custom fit process
3. Help with sizing guidance
4. Provide shipping and return info
5. Book appointments
6. Navigate to relevant pages

**Technology Options**

**Option A: OpenAI-powered (Recommended)**
- Use GPT-4 with function calling
- Custom system prompt with brand voice
- Function calls for booking, product search
- Context-aware responses

**Option B: Rule-based with AI fallback**
- Pattern matching for common questions
- Predefined response templates
- AI for complex queries
- Lower cost, less flexible

### Implementation Example (OpenAI)

```typescript
// chatbot.service.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are a helpful assistant for [Brand Name], a premium beauty brand specializing in custom-fit press-on nails.

Your role:
- Help customers find the perfect nail sets
- Explain the custom fit technology
- Provide styling advice
- Book appointments
- Answer questions about products, shipping, and returns

Brand voice: Friendly, knowledgeable, premium but approachable.

Available functions:
- search_products(query, filters)
- book_appointment(service, datetime)
- check_order_status(order_id)
`;

const functions = [
  {
    name: 'search_products',
    description: 'Search for nail products based on customer preferences',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        style: { type: 'string', enum: ['french', 'ombre', 'solid', 'art'] },
        color: { type: 'string' },
      },
    },
  },
  {
    name: 'book_appointment',
    description: 'Book a salon appointment',
    parameters: {
      type: 'object',
      properties: {
        service: { type: 'string' },
        preferred_date: { type: 'string' },
        preferred_time: { type: 'string' },
      },
      required: ['service'],
    },
  },
];

export async function chatWithBot(message: string, history: Message[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: message },
    ],
    functions,
    function_call: 'auto',
  });

  const assistantMessage = response.choices[0].message;

  // Handle function calls
  if (assistantMessage.function_call) {
    const functionName = assistantMessage.function_call.name;
    const args = JSON.parse(assistantMessage.function_call.arguments);

    // Execute function
    const result = await executeFunctionCall(functionName, args);

    // Return result to user
    return {
      message: result.userMessage,
      action: result.action,
    };
  }

  return {
    message: assistantMessage.content,
  };
}
```

---

## 📅 Booking System Implementation

### Booking Flow

1. **Service Selection**
   - Display available services
   - Show duration and pricing

2. **Date/Time Selection**
   - Show available dates
   - Show available time slots
   - Handle timezone conversion

3. **Customer Information**
   - Name, email, phone
   - Special requests/notes

4. **Confirmation**
   - Send email confirmation
   - Add to calendar
   - Store in database

### Integration Options

**Option A: Third-party (Faster)**
- Calendly (embedded)
- Acuity Scheduling
- Square Appointments
- Pros: Quick setup, calendar sync, reminders
- Cons: Less customization, monthly cost

**Option B: Custom (More control)**
- Build with Railway backend
- Google Calendar API for availability
- Twilio for SMS reminders
- Pros: Full control, better UX, data ownership
- Cons: More development time

**Recommendation for Phase 1:** Use Calendly embedded widget, migrate to custom system in Phase 2.

---

## 🔄 Data Flow Examples

### Product Purchase Flow

```
1. Customer browses products on Vercel frontend
   ↓
2. Frontend fetches products from Shopify Storefront API
   ↓
3. Customer adds items to cart (stored in local state)
   ↓
4. Customer clicks checkout
   ↓
5. Frontend creates Shopify checkout session
   ↓
6. Customer redirected to Shopify checkout
   ↓
7. Customer completes payment
   ↓
8. Shopify sends webhook to Railway backend
   ↓
9. Backend processes order, stores custom fit data if applicable
   ↓
10. Confirmation email sent (Shopify + custom)
```

### Custom Fit Flow (Phase 2)

```
1. Customer clicks "Get Custom Fit" on frontend
   ↓
2. Frontend shows photo upload interface
   ↓
3. Customer uploads hand/nail photos
   ↓
4. Frontend sends images to Railway /api/fit/upload
   ↓
5. Backend processes images (CV model or manual review)
   ↓
6. Backend calculates measurements, stores in database
   ↓
7. Frontend displays fit profile to customer
   ↓
8. When customer orders, fit profile attached to Shopify order via metafields
```

### Chatbot Booking Flow

```
1. Customer asks "I want to book an appointment"
   ↓
2. Frontend sends to Railway /api/chat/message
   ↓
3. Backend processes with OpenAI
   ↓
4. OpenAI returns function_call: book_appointment
   ↓
5. Backend asks for date/time preferences
   ↓
6. Customer provides details
   ↓
7. Backend checks availability via booking system API
   ↓
8. Backend creates booking
   ↓
9. Frontend shows confirmation, sends email
```

---

## 🚀 Deployment Strategy

### Vercel Deployment

1. **Connect GitHub Repo**
   - Auto-deploy on push to `main`
   - Preview deployments for PRs

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=
   NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=
   NEXT_PUBLIC_RAILWAY_API_URL=
   NEXT_PUBLIC_GA_ID=
   ```

3. **Build Configuration**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "framework": "nextjs"
   }
   ```

### Railway Deployment

1. **Create New Project**
   - Connect GitHub repo
   - Or deploy from Railway CLI

2. **Add PostgreSQL Database**
   - Provision database
   - Get connection string

3. **Environment Variables**
   ```env
   DATABASE_URL=
   SHOPIFY_API_KEY=
   SHOPIFY_API_SECRET=
   SHOPIFY_WEBHOOK_SECRET=
   OPENAI_API_KEY=
   FRONTEND_URL=
   ```

4. **Run Migrations**
   ```bash
   railway run npm run migrate
   ```

### Domain Setup

- **Frontend**: `www.yourdomain.com` → Vercel
- **API**: `api.yourdomain.com` → Railway
- **Shopify**: Keep on `store.yourdomain.com` or headless only

---

## 📊 Success Metrics

### Performance
- Lighthouse score > 90
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

### Business
- Conversion rate tracking
- Average order value
- Booking completion rate
- Chatbot resolution rate

### User Experience
- Mobile traffic %
- Bounce rate < 40%
- Session duration > 3min
- Pages per session > 3

---

## 🔐 Security Considerations

1. **API Security**
   - Rate limiting
   - CORS configuration
   - API key rotation
   - Webhook signature verification

2. **Data Protection**
   - HTTPS only
   - Encrypt sensitive data at rest
   - PCI compliance via Shopify
   - GDPR compliance for EU customers

3. **User Privacy**
   - Clear privacy policy
   - Cookie consent
   - Data deletion requests
   - Secure customer data handling

---

## ✅ Phase 1 Definition of Done

- [ ] Homepage deployed and responsive
- [ ] Product catalog integrated with Shopify
- [ ] Shopping cart and checkout functional
- [ ] Chatbot answering basic questions
- [ ] Booking page with embedded calendar
- [ ] All pages mobile-optimized
- [ ] Performance metrics met
- [ ] Analytics tracking implemented
- [ ] SEO meta tags configured
- [ ] Shopify webhooks configured
- [ ] Railway API deployed and stable
- [ ] Domain configured and SSL active

---

## 📚 Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Shopify Storefront API](https://shopify.dev/api/storefront)
- [Railway Docs](https://docs.railway.app)
- [OpenAI API](https://platform.openai.com/docs)

### Design References
- Luxury beauty brands for inspiration
- Editorial ecommerce layouts
- Premium product photography examples

### Development Tools
- Shopify CLI for local development
- Railway CLI for backend deployment
- Vercel CLI for preview deployments
- Postman for API testing

---

## 🤝 Team Communication

**Developer should provide:**
- Weekly progress updates
- Staging environment for review
- Technical documentation
- Deployment runbooks

**Client should provide:**
- Brand assets (logo, colors, fonts)
- Product photos and content
- Shopify store access
- Feedback within 48 hours

---

## 🎬 Next Steps

1. **Immediate (Week 1)**
   - Set up Shopify store
   - Initialize Next.js project
   - Set up Railway project
   - Create initial design mockups

2. **Short-term (Weeks 2-4)**
   - Build core frontend pages
   - Implement Shopify integration
   - Set up basic chatbot
   - Integrate booking widget

3. **Medium-term (Weeks 5-8)**
   - Polish UI/UX
   - Performance optimization
   - Testing and QA
   - Production deployment

4. **Future (Phase 2)**
   - Custom fit technology
   - Advanced chatbot
   - Custom booking system
   - Beauty services expansion

---

**Questions? Contact project owner for clarifications.**