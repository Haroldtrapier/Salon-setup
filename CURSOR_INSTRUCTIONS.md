# Cursor Agent Instructions - Build Order

> Complete step-by-step instructions for Cursor Agent to build the entire Salon platform

## 🎯 Overview

You will use Cursor Agent to build **three separate parts** of the salon platform in this order:

1. **Railway Backend** (Phase 1)
2. **Next.js Frontend** (Phase 2)
3. **Integration & Testing** (Phase 3)

---

## 🟢 Phase 1: Build Railway Backend

### Step 1: Open Your Project in Cursor

```bash
cd /path/to/Salon-setup
cursor .
```

### Step 2: Tell Cursor to Build Backend

**Copy and paste this exact prompt to Cursor Agent:**

```
Read the file CURSOR_AGENT_BRIEF.md and build the complete Railway backend API.

Requirements:
1. Create a 'backend' folder in the project root
2. Implement the exact file structure specified in CURSOR_AGENT_BRIEF.md
3. Create all 19 files with complete, production-ready code
4. Include:
   - Express.js server with all routes
   - PostgreSQL database models
   - OpenAI chatbot service
   - Booking system logic
   - Shopify webhook handlers
   - All middleware (CORS, error handling, auth)
   - Database migration files
   - Package.json with all dependencies

5. Ensure all imports are correct
6. Follow the exact specifications in the brief
7. Make the code production-ready with proper error handling

After building, I will:
- Run 'npm install' in the backend folder
- Create .env file
- Test locally
- Deploy to Railway

Begin building now.
```

### Step 3: What Cursor Will Do

Cursor will create:
- `backend/` folder with complete structure
- All 19 source files
- `package.json` with dependencies
- Database migration SQL
- `.env.example`
- `README.md` for backend

**Time:** 5-10 minutes

### Step 4: After Cursor Finishes

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy env example
cp .env.example .env

# Edit .env with your credentials
# (You'll fill this in later after setting up Shopify and Railway)

# Test server starts
npm start

# Should see:
# ✅ Salon Backend API
# 🚀 Server running on port 3000
```

### Step 5: Push to GitHub

```bash
git add backend/
git commit -m "Add Railway backend API"
git push origin main
```

✅ **Backend Complete!**

---

## 🟡 Phase 2: Build Next.js Frontend

### Step 1: Tell Cursor to Build Frontend

**Copy and paste this exact prompt to Cursor Agent:**

```
Read the file NEXTJS_FRONTEND_GUIDE.md and build the complete Next.js 14 frontend.

Requirements:
1. Initialize Next.js 14 with App Router in the project root (if not already done)
2. Install all required dependencies:
   - @shopify/hydrogen-react
   - zustand
   - @tanstack/react-query
   - framer-motion
   - shadcn/ui components

3. Create the complete file structure specified in NEXTJS_FRONTEND_GUIDE.md:
   - app/ with all pages (homepage, shop, product detail, cart, custom-fit, book, about)
   - components/ for all UI components
   - lib/ for Shopify and API clients
   - types/ for TypeScript types

4. Implement:
   - Root layout with Header, Footer, ChatWidget
   - Homepage with hero section and features
   - Shop page with product grid
   - Product detail page with variants and add to cart
   - Shopify integration for fetching products
   - Railway API client for chatbot and booking
   - Chat widget component
   - Booking form component
   - Responsive mobile design

5. Configure:
   - next.config.js with Shopify image domains
   - tailwind.config.ts with theme
   - .env.example with all required variables

6. Use Tailwind CSS for styling
7. Make all components production-ready
8. Follow Next.js 14 best practices

After building, I will:
- Set up environment variables
- Test locally
- Deploy to Vercel

Begin building now.
```

### Step 2: What Cursor Will Do

Cursor will create:
- Complete Next.js 14 app structure
- All pages and components
- Shopify integration
- Railway API client
- Tailwind styling
- TypeScript types

**Time:** 10-15 minutes

### Step 3: After Cursor Finishes

```bash
# Install dependencies (if not done by Cursor)
npm install

# Copy env example
cp .env.example .env.local

# Edit .env.local with your credentials
# NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=
# NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=
# NEXT_PUBLIC_API_URL=

# Run development server
npm run dev

# Open http://localhost:3000
```

### Step 4: Push to GitHub

```bash
git add .
git commit -m "Add Next.js frontend"
git push origin main
```

✅ **Frontend Complete!**

Vercel will auto-deploy!

---

## 🟢 Phase 3: Integration & Setup

### Step 1: Set Up Shopify Store

Follow **SHOPIFY_SETUP_GUIDE.md**:

1. Create Shopify store
2. Configure settings
3. Create custom app for API access
4. Add sample products
5. Configure webhooks
6. Get API credentials

**Time:** 1-2 hours

### Step 2: Deploy Railway Backend

Follow **RAILWAY_SETUP_GUIDE.md**:

1. Create Railway account
2. Create new project
3. Add PostgreSQL database
4. Set environment variables
5. Deploy backend code
6. Run migrations
7. Generate public domain

**Time:** 30 minutes

### Step 3: Connect Everything

#### Update Vercel Environment Variables

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add/Update:
   ```
   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_...
   NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app
   ```
3. Redeploy Vercel

#### Update Railway Environment Variables

1. Go to Railway → Your Service → Variables
2. Add all from backend/.env.example:
   ```
   DATABASE_URL (auto-populated)
   SHOPIFY_STORE_DOMAIN=
   SHOPIFY_API_KEY=
   SHOPIFY_API_SECRET=
   SHOPIFY_STOREFRONT_TOKEN=
   SHOPIFY_WEBHOOK_SECRET=
   OPENAI_API_KEY=
   FRONTEND_URL=https://salon-setup.vercel.app
   ```
3. Redeploy Railway

#### Update Shopify Webhooks

1. Go to Shopify Admin → Settings → Notifications → Webhooks
2. Update webhook URLs to:
   ```
   https://your-railway-app.up.railway.app/api/shopify/webhook/order-created
   https://your-railway-app.up.railway.app/api/shopify/webhook/order-updated
   https://your-railway-app.up.railway.app/api/shopify/webhook/customer-created
   ```

### Step 4: Test End-to-End

#### Test Frontend
- [ ] Visit your Vercel URL
- [ ] Homepage loads
- [ ] Shop page shows products from Shopify
- [ ] Product detail page works
- [ ] Add to cart functions

#### Test Chatbot
- [ ] Click chat widget
- [ ] Send message
- [ ] Get response from OpenAI

#### Test Booking
- [ ] Go to /book page
- [ ] Fill booking form
- [ ] Submit booking
- [ ] Check Railway logs for booking creation

#### Test Shopify Integration
- [ ] Create test order in Shopify
- [ ] Check Railway logs for webhook
- [ ] Verify customer created in Railway database

---

## 📝 Cursor Agent Tips

### If Cursor Gets Stuck

**Prompt:** "Continue building from where you left off. Show me what's remaining."

### If You See Errors

**Prompt:** "Fix the errors in [filename]. The error is: [error message]"

### To Add Missing Features

**Prompt:** "Add [feature name] according to the specification in [guide file]."

### To Refactor Code

**Prompt:** "Refactor [component/service] to follow best practices and improve [performance/readability/etc]."

### To Add Tests

**Prompt:** "Add unit tests for [service/component] using Jest."

---

## ✅ Complete Build Checklist

### Backend (Railway)
- [ ] Backend folder created
- [ ] All 19 files present
- [ ] Dependencies installed
- [ ] Server starts locally
- [ ] Pushed to GitHub
- [ ] Deployed to Railway
- [ ] Database migrated
- [ ] Environment variables set
- [ ] Health check endpoint works

### Frontend (Next.js)
- [ ] Next.js app created
- [ ] All pages implemented
- [ ] All components built
- [ ] Shopify client works
- [ ] Railway API client works
- [ ] Dependencies installed
- [ ] Runs locally
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables set

### Integration
- [ ] Shopify store configured
- [ ] Products added
- [ ] API credentials obtained
- [ ] Webhooks configured
- [ ] Frontend fetches Shopify products
- [ ] Chatbot works end-to-end
- [ ] Booking system works
- [ ] Test order completed

### Production Ready
- [ ] All features tested
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] SEO configured
- [ ] Error handling implemented
- [ ] Analytics set up
- [ ] Domain connected (optional)

---

## 🚀 Quick Reference Commands

### Backend Development
```bash
cd backend
npm install
npm run dev          # Start dev server
npm run migrate      # Run migrations
```

### Frontend Development
```bash
npm install
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
```

### Deployment
```bash
# Push to GitHub (auto-deploys)
git add .
git commit -m "Your message"
git push origin main

# Railway CLI
railway login
railway link
railway up           # Manual deploy
railway logs         # View logs

# Vercel CLI
vercel login
vercel               # Deploy
vercel --prod        # Deploy to production
```

---

## 📚 Documentation Reference

Keep these docs handy:

1. **CURSOR_AGENT_BRIEF.md** - Backend build spec
2. **NEXTJS_FRONTEND_GUIDE.md** - Frontend build spec
3. **SHOPIFY_SETUP_GUIDE.md** - Shopify configuration
4. **RAILWAY_SETUP_GUIDE.md** - Railway deployment
5. **DEVELOPER_BRIEF.md** - Complete technical specs
6. **QUICK_START.md** - Quick setup guide

---

## 🆘 Troubleshooting

### Backend Issues

**Server won't start:**
- Check `.env` file exists and has all variables
- Verify DATABASE_URL is correct
- Check for syntax errors in code

**Database connection fails:**
- Verify Railway PostgreSQL is provisioned
- Check DATABASE_URL format
- Ensure SSL is configured for production

### Frontend Issues

**Products not loading:**
- Check Shopify credentials in `.env.local`
- Verify Shopify custom app has correct scopes
- Check browser console for errors

**Build fails on Vercel:**
- Check all environment variables are set in Vercel
- Verify no TypeScript errors
- Check build logs for specific errors

### Integration Issues

**Webhooks not firing:**
- Verify Railway backend is deployed and accessible
- Check webhook URLs are correct in Shopify
- View Railway logs for incoming requests

**Chatbot not responding:**
- Verify OpenAI API key is set
- Check Railway backend logs for errors
- Ensure Railway API URL is correct in Vercel

---

## 🎉 Success!

Once complete, you'll have:
- ✅ Premium salon website live on Vercel
- ✅ Backend API running on Railway
- ✅ Shopify store configured
- ✅ Products integrated
- ✅ Chatbot working
- ✅ Booking system functional
- ✅ Ready for customers!

---

**Follow this guide step-by-step and you'll have a complete, production-ready salon platform!** 🚀

**Estimated Total Time:** 4-6 hours
- Backend build: 30 mins
- Frontend build: 1 hour
- Shopify setup: 1-2 hours
- Railway deploy: 30 mins
- Integration & testing: 1-2 hours