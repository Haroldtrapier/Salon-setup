# Quick Start Guide

> Get your premium salon website up and running in 8 steps

## 🚀 Overview

This guide will help you set up the development environment and deploy your first version of the salon website.

**Time Required:** 2-3 hours for initial setup

**Prerequisites:**
- Node.js 18+ installed
- Git installed
- Text editor (VS Code recommended)
- Basic command line knowledge

---

## Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/Haroldtrapier/Salon-setup.git
cd Salon-setup

# Install dependencies (when Next.js project is added)
npm install
# or
pnpm install
```

---

## Step 2: Set Up Shopify Store

### Create Shopify Store
1. Go to [Shopify](https://www.shopify.com/)
2. Start free trial
3. Choose "Beauty" as your industry
4. Set up basic store info

### Create Custom App
1. In Shopify Admin, go to **Settings** → **Apps and sales channels**
2. Click **Develop apps**
3. Create new app: "Salon Frontend"
4. Configure **Storefront API** scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_customer_tags`
5. Install app and get **Storefront Access Token**

### Add Sample Products
1. Go to **Products** → **Add product**
2. Add at least 5-10 nail sets with:
   - High-quality images
   - Detailed descriptions
   - Variants (shape, length, finish)
   - Price
3. Create collections:
   - "New Arrivals"
   - "Best Sellers"
   - "French Tips"

**Save these for later:**
- Store domain: `[your-store].myshopify.com`
- Storefront Access Token: `[your-token]`

---

## Step 3: Set Up Railway (Backend)

### Create Railway Account
1. Go to [Railway](https://railway.app/)
2. Sign up with GitHub

### Create New Project
1. Click **New Project**
2. Select **Deploy from GitHub repo** (or **Empty Project** for now)
3. Name it: "salon-backend"

### Add PostgreSQL Database
1. Click **New** → **Database** → **PostgreSQL**
2. Wait for provisioning
3. Copy the **Database URL** from environment variables

### Set Environment Variables
In Railway project settings, add:
```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=your-token
OPENAI_API_KEY=sk-...
FRONTEND_URL=https://your-vercel-url.vercel.app
```

**Save the Railway app URL:**
- Backend API URL: `https://[your-app].railway.app`

---

## Step 4: Configure Environment Variables

Create `.env.local` file in project root:

```env
# Shopify
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-shopify-token

# Railway Backend
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app

# OpenAI (for chatbot)
OPENAI_API_KEY=sk-your-openai-key

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Booking (if using Calendly)
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-username
```

**⚠️ Important:** Never commit `.env.local` to Git!

---

## Step 5: Run Development Server

```bash
# Start the Next.js dev server
npm run dev

# Open browser
open http://localhost:3000
```

You should see:
- Homepage loading
- Products fetched from Shopify
- Navigation working

**Common Issues:**
- **Products not loading?** Check Shopify credentials
- **CORS errors?** Verify Railway backend is running
- **Build errors?** Run `npm install` again

---

## Step 6: Deploy to Vercel

### Connect to Vercel
1. Go to [Vercel](https://vercel.com/)
2. Click **Import Project**
3. Select your GitHub repo: `Haroldtrapier/Salon-setup`
4. Vercel will auto-detect Next.js

### Configure Deployment
1. **Framework Preset:** Next.js
2. **Root Directory:** `./` (or where package.json is)
3. **Build Command:** `npm run build`
4. **Output Directory:** `.next`

### Add Environment Variables
In Vercel project settings → **Environment Variables**, add:
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (if using)

### Deploy
1. Click **Deploy**
2. Wait 2-3 minutes
3. Visit your live URL: `https://salon-setup.vercel.app`

**Vercel auto-deploys on every push to `main` branch!**

---

## Step 7: Test Core Features

### ✅ Checklist
- [ ] Homepage loads with images
- [ ] Product catalog displays
- [ ] Product detail page works
- [ ] Add to cart functions
- [ ] Checkout redirects to Shopify
- [ ] Mobile responsive
- [ ] Navigation works
- [ ] Footer displays

### Test a Purchase
1. Add product to cart
2. Go to checkout
3. Use Shopify test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVV: Any 3 digits
4. Complete order
5. Check Shopify admin for order

---

## Step 8: Set Up Chatbot (Optional for MVP)

### Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create account or sign in
3. Go to **API Keys**
4. Create new key
5. Copy and save securely

### Add to Railway
In Railway backend, add:
```env
OPENAI_API_KEY=sk-your-key-here
```

### Test Chatbot
1. Click chat widget on site
2. Ask: "What nail sets do you offer?"
3. Bot should respond with info

---

## 📝 Next Steps

Now that your site is running:

### Immediate
1. **Add real content**
   - Brand story on About page
   - Update homepage copy
   - Add more products

2. **Customize design**
   - Update colors in Tailwind config
   - Add your logo
   - Upload hero images

3. **Set up booking**
   - Create Calendly account
   - Embed on `/book` page
   - Test booking flow

### Short-term
1. **Connect domain**
   - Purchase domain
   - Add to Vercel
   - Configure DNS

2. **Add analytics**
   - Set up Google Analytics
   - Add GA ID to env vars
   - Test tracking

3. **Improve SEO**
   - Add meta descriptions
   - Create sitemap
   - Submit to Google

### Long-term
1. **Phase 2: Custom Fit**
   - Build upload interface
   - Integrate CV model
   - Store fit profiles

2. **Phase 3: Expansion**
   - Add beauty products
   - Build subscription system
   - Add loyalty program

---

## 👥 Getting Help

### Documentation
- [Vision Document](./Salon-setup.md)
- [Developer Brief](./DEVELOPER_BRIEF.md)
- [Implementation Checklist](./IMPLEMENTATION_CHECKLIST.md)

### Common Issues

**Products not showing?**
- Verify Shopify API credentials
- Check product is published
- Look at browser console for errors

**Deployment failed?**
- Check build logs in Vercel
- Verify all env variables set
- Check for TypeScript errors

**Chatbot not responding?**
- Verify OpenAI API key
- Check Railway backend logs
- Ensure CORS configured

**Checkout not working?**
- Verify Shopify checkout URL
- Check if test mode enabled
- Ensure product has variants

### Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Shopify API Docs](https://shopify.dev/api)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)

---

## 🎉 Success!

You now have:
- ✅ Premium salon website running
- ✅ Shopify ecommerce integrated
- ✅ Deployed to production
- ✅ Auto-deployments on commits
- ✅ Backend API ready
- ✅ Chatbot foundation

**What's Next?** Start customizing the design and adding your brand content!

---

**Questions?** Check the full documentation or contact the development team.

**Last Updated:** March 10, 2026