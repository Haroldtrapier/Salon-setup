# Salon Setup - Premium Beauty Brand Vision

## Overall Vision

This should not feel like a basic salon website. It should feel like a **premium beauty brand storefront** with a strong visual identity, smooth shopping flow, and smart customer tools.

The business starts with **custom press-on nails** and later expands into a broader beauty supply and beauty services brand. So the site needs to be built in a way that looks beautiful now, but can also scale later.

### Experience Combines:
- Highly visual aesthetic storefront
- Shopify-powered ecommerce
- Custom nail-fit technology
- Chatbot for questions and appointment booking
- Room to grow into beauty products and services

---

## What the Website Needs to Do

### 1. Look Premium and Highly Visual

The site needs to be attractive, polished, and image-led.

**Design Direction:**
- Large, high-quality photography
- Clean layouts
- Strong branding
- Beauty/luxury feel
- Mobile-first shopping experience
- Elegant spacing and typography
- Polished product presentation

The reference point is the type of site that feels editorial and premium, where the visuals do most of the selling.

### 2. Let Customers Shop Nail Kits

Customers should be able to browse and buy nail sets directly on the site.

**Product pages should allow:**
- Shape selection
- Length options
- Style choices
- Color/design selection
- Finish options
- Custom fit option

### 3. Allow New Product Photos to be Uploaded Easily

For product photos, use **Shopify as the image management hub**.

**This means:**
- New product photos get uploaded in Shopify admin
- Product image galleries are managed in Shopify
- Collections can be updated in Shopify
- Seasonal drops and new designs can be added without rebuilding the whole site

**Split:**
- **Shopify**: Product photos, collection images, variant photos
- **Vercel**: Homepage hero images, branded campaigns, editorial layout sections, story-driven beauty visuals

### 4. Support Custom Nail Sizing

The long-term differentiator is the ability for customers to use an app or tool to scan or photograph their nails so nail sets can be made to fit properly.

**This feature should:**
- Let the customer scan each nail or hand
- Estimate nail dimensions
- Save a fit profile to their account
- Connect that fit profile to Shopify orders
- Allow easier reorders in the future

### 5. Support Beauty-Service Growth Later

Even though the first phase is focused on custom nails, the architecture should allow later expansion into:
- Beauty supplies
- Salon products
- Appointments/services
- Subscriptions
- Customer loyalty
- Education/content
- Beauty consultations

---

## Platform Strategy

The recommended setup is:
- **Shopify** for ecommerce
- **Vercel** for custom frontend experience
- **Railway** for backend logic and app services

This gives you a strong mix of beauty-focused presentation and scalable custom functionality.

---

## How Each Platform Fits

### Shopify - Commerce Engine

**Use Shopify for:**
- Product catalog
- Collections
- Checkout
- Payments
- Customer accounts
- Order history
- Discounts
- Product image uploads
- Inventory
- Product variants
- Store management

**Why Shopify is Important:**
Shopify is the easiest way to manage the selling side of the business without building those systems from scratch. It handles the business-critical parts while the user sees a premium brand experience.

### Vercel - Custom Frontend

**Use Vercel for:**
- Homepage
- Custom landing pages
- Lookbook/gallery pages
- Custom product discovery flow
- Educational pages
- Custom fit experience UI
- Chatbot interface
- Appointment booking UI
- Premium visual storytelling
- Future beauty supply expansion pages

**Why Use Vercel:**
Shopify themes are useful, but if you want something that looks more elevated and custom, Vercel gives much more flexibility.

**Best Use:**
Think of Vercel as the polished customer-facing layer that makes the brand feel modern, premium, custom, luxurious, and tech-enabled.

### Railway - Backend Services

**Use Railway for:**
- Chatbot backend
- Appointment booking logic
- Nail scan processing
- Storing custom fit data
- Syncing data between frontend and Shopify
- Customer profile extensions
- API endpoints
- Automation workflows
- Future AI functionality

**Why Use Railway:**
Railway is a good choice when you want a clean, deployable backend without heavy DevOps setup. It works well for APIs, background processes, AI service logic, and connecting multiple systems.

---

## Chatbot Plan

A chatbot is a strong addition. It should do two main jobs:

### 1. Answer Customer Questions

**Questions like:**
- What nail sets do you offer?
- How does custom sizing work?
- How long does shipping take?
- Do you offer appointments?
- Can I upload my own design?
- What if my set doesn't fit?
- Do you sell beauty products too?
- What are your salon hours?
- How do I reorder my last set?

### 2. Book Appointments

**Possible bookings:**
- In-person salon appointments
- Consultations
- Custom nail fitting appointments
- Beauty service appointments in future phases

**Chatbot Flow:**
- Greet user clearly
- Understand common questions
- Guide user to products or services
- Collect appointment info
- Suggest booking options
- Escalate to human if needed

**Recommended Booking Features:**
Collect service needed, preferred date/time, customer name, phone/email, notes. Then push into booking system, store in backend, and send confirmation.

---

## Appointment Booking Strategy

**Option 1: Simple booking integration**
Use an existing booking service and connect it into the site (faster).

**Option 2: Custom booking flow**
Use Vercel frontend + Railway backend to create a custom booking system (more control).

For phase 1, a simple integrated system is usually faster. Then later, build more custom scheduling logic if needed.

---

## Website Strategy for Aesthetic Beauty Brand

### 1. Use Photography as the Main Selling Tool

**You will want:**
- Close-up nail shots
- Lifestyle imagery
- Hand model photography
- Beauty editorial shots
- Consistent lighting and background style

### 2. Keep Layout Clean

**Beauty brands perform better with:**
- More white space
- Large image blocks
- Fewer cluttered menus
- Strong section hierarchy

### 3. Make Navigation Simple

**Main navigation:**
- Shop Nails
- Custom Fit
- Book Appointment
- Beauty
- About
- FAQ

### 4. Make Homepage Conversion-Focused

**Homepage should quickly communicate:**
- What the brand is
- Why the fit is better
- How to shop
- How to book
- Why the brand feels premium

### 5. Build for Mobile First

**Mobile UX requirements:**
- Fast load
- Large images
- Easy buttons
- Smooth checkout
- Easy chatbot access
- Easy booking flow

---

## Recommended Phased Build

### Phase 1: Core Premium Ecommerce Site

**Build:**
- Visual homepage
- Shopify product catalog
- Collections
- Product photos
- Booking page
- Chatbot basics
- FAQ
- Mobile optimization

### Phase 2: Smart Custom-Fit Layer

**Build:**
- Customer account enhancements
- Nail scan/photo upload flow
- Fit profile storage
- Custom order notes
- Shopify order linkage

### Phase 3: Beauty Brand Expansion

**Build:**
- Beauty supply product lines
- Subscriptions
- Loyalty/referrals
- More advanced chatbot
- More advanced appointment booking
- Educational content
- Beauty consultations

---

## Recommended Final Architecture

### Frontend: Vercel
- Next.js site
- Premium custom UI
- Mobile-first pages
- Chatbot frontend
- Booking frontend
- Fit profile pages

### Commerce: Shopify
- Store management
- Checkout
- Products
- Orders
- Customer accounts
- Product photos
- Inventory

### Backend: Railway
- APIs
- Chatbot logic
- Booking backend
- Scan processing
- Customer fit profile storage
- Shopify sync logic

---

## Strategic Recommendation

If the goal is a really beautiful, scalable, premium beauty site, the best route is:

**Use Shopify as the ecommerce engine, Vercel as the visual custom frontend, and Railway as the backend for custom functionality.**

This gives you:
- Beautiful design freedom
- Easier product management
- Scalable custom features
- Support for chatbot and booking
- Long-term flexibility for the beauty supply expansion

---

## Summary

The salon website should be built as a premium, highly visual beauty brand experience, starting with custom nails and later expanding into a broader beauty supply and service platform. Shopify should handle ecommerce, product management, checkout, customer accounts, and product photo uploads. Vercel should power the custom frontend so the site can look more polished, modern, and visually elevated than a standard theme-based store. Railway should run the backend for custom features like the chatbot, appointment booking logic, nail scan processing, fit-profile storage, and Shopify integrations. The chatbot should answer customer questions, guide shopping, and support appointment booking, making the site both beautiful and functional.