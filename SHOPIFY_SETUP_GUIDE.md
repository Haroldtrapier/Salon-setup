# Shopify Store Setup - Complete Guide

> Step-by-step guide to set up your Shopify store for the Salon platform

## 🎯 What You'll Accomplish

- Create Shopify store
- Configure store settings
- Add product structure
- Set up custom app for API access
- Configure webhooks
- Upload sample products

**Time Required:** 1-2 hours

---

## Step 1: Create Your Shopify Store

### Sign Up

1. **Go to Shopify**
   - Visit [shopify.com](https://www.shopify.com)
   - Click **Start free trial**

2. **Enter Business Information**
   - Email address
   - Password
   - Store name: `[YourBrandName]`
   - Store URL: `[yourbrand].myshopify.com`

3. **Complete Onboarding**
   - Business type: **Beauty & Personal Care**
   - Currently selling: **Just getting started**
   - Skip optional questions

4. **Choose Plan (Later)**
   - Start with free trial
   - Upgrade to **Basic** ($39/month) or higher when ready to go live

---

## Step 2: Configure Store Settings

### General Settings

1. **Go to Settings** (bottom left)
   - Click **General**

2. **Store Details**
   - Store name: Your brand name
   - Store contact email
   - Store phone number

3. **Store Address**
   - Complete business address
   - Required for tax calculations

4. **Store Currency**
   - Select USD (or your currency)

5. **Standards & Formats**
   - Timezone: Your timezone
   - Weight unit: Ounces/Pounds or Grams/Kilograms

### Checkout Settings

1. **Settings → Checkout**

2. **Customer Contact**
   - ✅ Email and SMS marketing

3. **Customer Information**
   - ✅ Require first and last name

4. **Marketing**
   - ✅ Allow pre-selected marketing opt-in

5. **Order Processing**
   - ✅ Automatically fulfill non-gift orders
   - ✅ Archive orders automatically after fulfillment

### Shipping Settings

1. **Settings → Shipping and delivery**

2. **Shipping Zones**
   - Add shipping zone: **United States**
   - Add rates:
     - Standard Shipping: $5.99 (5-7 business days)
     - Express Shipping: $12.99 (2-3 business days)
     - Free Shipping: $0 (on orders $50+)

3. **International Shipping** (Optional)
   - Add zones as needed

### Tax Settings

1. **Settings → Taxes and duties**

2. **United States**
   - ✅ Automatically charge taxes
   - Set up tax nexus (where you have presence)

3. **Tax Calculations**
   - Let Shopify calculate taxes automatically

---

## Step 3: Create Custom App for API Access

### Enable Custom App Development

1. **Go to Settings → Apps and sales channels**

2. **Click "Develop apps"**
   - If you don't see it, enable custom app development

3. **Allow custom app development**
   - Click **Allow custom app development**
   - Confirm

### Create Custom App

1. **Click "Create an app"**
   - App name: `Salon Frontend`
   - App developer: Your email

2. **Configure API Scopes**
   - Click **Configure Storefront API scopes**

3. **Select Required Scopes:**
   ```
   ✅ unauthenticated_read_product_listings
   ✅ unauthenticated_read_product_inventory
   ✅ unauthenticated_read_product_tags
   ✅ unauthenticated_write_checkouts
   ✅ unauthenticated_read_checkouts
   ✅ unauthenticated_write_customers
   ✅ unauthenticated_read_customer_tags
   ```

4. **Configure Admin API Scopes** (for webhooks):
   ```
   ✅ read_orders
   ✅ read_customers
   ✅ read_products
   ```

5. **Save Configuration**

### Install Custom App

1. **Click "Install app"**
   - Review permissions
   - Click **Install**

2. **Copy API Credentials**
   - **Storefront API access token** (starts with `shpat_`)
   - **Admin API access token** (starts with `shpat_`)
   - **API key**
   - **API secret key**

   ⚠️ **SAVE THESE SECURELY** - You'll need them for:
   - Vercel environment variables
   - Railway backend

---

## Step 4: Set Up Product Structure

### Create Product Metafields

1. **Go to Settings → Custom data**

2. **Products → Add definition**

3. **Create Metafields:**

   **Metafield 1: Custom Fit Available**
   - Name: `Custom Fit Available`
   - Namespace: `custom`
   - Key: `fit_available`
   - Type: `True or false`

   **Metafield 2: Difficulty Level**
   - Name: `Difficulty Level`
   - Namespace: `custom`
   - Key: `difficulty`
   - Type: `Single line text`
   - Values: Easy, Medium, Advanced

   **Metafield 3: Wear Duration**
   - Name: `Wear Duration`
   - Namespace: `custom`
   - Key: `wear_duration`
   - Type: `Single line text`
   - Example: "1-2 weeks"

### Create Product Variants Structure

1. **Shape Options:**
   - Almond
   - Coffin
   - Square
   - Stiletto
   - Oval
   - Round

2. **Length Options:**
   - Short
   - Medium
   - Long
   - XL

3. **Finish Options:**
   - Glossy
   - Matte
   - Chrome
   - Shimmer

---

## Step 5: Create Collections

### Main Collections

1. **Go to Products → Collections**

2. **Create Collections:**

   **Collection 1: New Arrivals**
   - Title: `New Arrivals`
   - Description: "Discover our latest nail set designs"
   - Type: Manual
   - Image: Upload hero image

   **Collection 2: Best Sellers**
   - Title: `Best Sellers`
   - Description: "Our most popular nail sets"
   - Type: Manual

   **Collection 3: French Tips**
   - Title: `French Tips`
   - Description: "Classic and modern French tip designs"
   - Type: Automated
   - Conditions: Product tag equals `french-tip`

   **Collection 4: Solid Colors**
   - Title: `Solid Colors`
   - Description: "Elegant solid color nail sets"
   - Type: Automated
   - Conditions: Product tag equals `solid`

   **Collection 5: Nail Art**
   - Title: `Nail Art`
   - Description: "Intricate designs and patterns"
   - Type: Automated
   - Conditions: Product tag equals `nail-art`

   **Collection 6: Special Occasions**
   - Title: `Special Occasions`
   - Description: "Perfect for weddings, parties, and events"
   - Type: Manual

---

## Step 6: Add Sample Products

### Create Your First Product

1. **Go to Products → All products**

2. **Click "Add product"**

3. **Product Information:**

   **Example Product: Classic French Tips**
   
   ```
   Title: Classic French Tips - Almond
   
   Description:
   Timeless elegance meets modern style. Our Classic French Tips
   feature a pristine white tip on a natural nude base, perfect
   for any occasion.
   
   ✨ Features:
   • Premium quality press-on nails
   • Reusable and durable
   • Easy 5-minute application
   • Lasts 1-2 weeks
   • Includes glue and application kit
   
   📏 Available in:
   • Multiple shapes (Almond, Coffin, Square, Stiletto)
   • Four lengths (Short, Medium, Long, XL)
   • 24 nails per set (12 sizes)
   
   💅 Application:
   1. Clean and prep natural nails
   2. Select perfect size for each nail
   3. Apply with included adhesive
   4. Press and hold for 10 seconds
   5. Enjoy beautiful nails!
   
   🌟 Pro Tip: For longer wear, apply a top coat every few days.
   ```

4. **Media:**
   - Upload 4-6 high-quality images
   - Different angles
   - Close-ups
   - Lifestyle shots

5. **Pricing:**
   - Price: $24.99
   - Compare at price: $34.99 (optional)
   - Cost per item: $8.00 (your cost)
   - Profit: $16.99

6. **Inventory:**
   - SKU: `FT-ALM-001`
   - Barcode: (if you have one)
   - Track quantity: ✅
   - Quantity: 100

7. **Variants:**
   - Add variant: Shape
     - Almond
     - Coffin
     - Square
     - Stiletto
   - Add variant: Length
     - Short
     - Medium
     - Long
     - XL
   - Each combination = unique variant

8. **Product Organization:**
   - Product type: `Press-on Nails`
   - Vendor: Your brand name
   - Collections: `New Arrivals`, `French Tips`
   - Tags: `french-tip`, `classic`, `nude`, `white`

9. **Search Engine Listing:**
   - Page title: `Classic French Tips Almond Press-On Nails | [YourBrand]`
   - Description: SEO-optimized description
   - URL handle: `classic-french-tips-almond`

10. **Metafields:**
    - Custom Fit Available: ✅ True
    - Difficulty Level: Easy
    - Wear Duration: 1-2 weeks

11. **Click "Save"**

### Create 5-10 More Products

Follow the same structure for:
- Solid color sets (Red Elegance, Pink Perfection, Black Luxury)
- Ombre designs
- Glitter sets
- Seasonal designs
- Nail art designs

---

## Step 7: Configure Webhooks

### Set Up Webhooks for Railway Backend

1. **Go to Settings → Notifications**

2. **Scroll to "Webhooks"**

3. **Create Webhook 1: Order Creation**
   - Event: `Order creation`
   - Format: `JSON`
   - URL: `https://your-railway-app.up.railway.app/api/shopify/webhook/order-created`
   - Webhook API version: Latest

4. **Create Webhook 2: Order Update**
   - Event: `Order updated`
   - Format: `JSON`
   - URL: `https://your-railway-app.up.railway.app/api/shopify/webhook/order-updated`

5. **Create Webhook 3: Customer Creation**
   - Event: `Customer creation`
   - Format: `JSON`
   - URL: `https://your-railway-app.up.railway.app/api/shopify/webhook/customer-created`

⚠️ **Note:** You'll update these URLs after deploying Railway backend

### Get Webhook Secret

1. After creating webhooks, note the signing secret
2. Save for Railway environment variables

---

## Step 8: Set Up Payment Processing

### Shopify Payments (Recommended)

1. **Go to Settings → Payments**

2. **Activate Shopify Payments**
   - Complete business information
   - Bank account details
   - Tax information
   - Identity verification

3. **Payment Methods Accepted:**
   - ✅ Visa, Mastercard, Amex, Discover
   - ✅ Apple Pay
   - ✅ Google Pay
   - ✅ Shop Pay

### Alternative Payment Gateways

If not using Shopify Payments:
- PayPal
- Stripe
- Square

⚠️ **Note:** Third-party gateways have additional transaction fees

---

## Step 9: Configure Domain (Optional - Do Later)

### After Purchasing Domain

1. **Settings → Domains**

2. **Connect existing domain**
   - Add your domain: `www.yourdomain.com`
   - Follow DNS configuration steps

3. **Set as primary domain**

⚠️ **For Now:** Use `yourbrand.myshopify.com` for development

---

## Step 10: Test Order Flow

### Create Test Order

1. **Enable Test Mode**
   - Settings → Payments
   - Enable test mode

2. **Place Test Order**
   - Go to your store
   - Add product to cart
   - Checkout
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVV: Any 3 digits

3. **Verify Order Created**
   - Check Shopify Orders
   - Verify webhook fired (check Railway logs later)

4. **Test Customer Experience**
   - Order confirmation email
   - Customer account creation
   - Order tracking

---

## ✅ Setup Complete Checklist

### Store Configuration
- [ ] Shopify account created
- [ ] Store settings configured
- [ ] Shipping rates set up
- [ ] Tax settings configured
- [ ] Payment processing activated

### API Access
- [ ] Custom app created
- [ ] Storefront API token generated
- [ ] Admin API token generated
- [ ] API credentials saved securely

### Products
- [ ] Product metafields created
- [ ] Collections created (6+)
- [ ] Sample products added (5-10)
- [ ] Product images uploaded
- [ ] Variants configured

### Integration
- [ ] Webhooks configured (3)
- [ ] Webhook secret saved
- [ ] Test order completed

---

## 📝 Save These Credentials

Create a secure note with:

```
SHOPIFY CREDENTIALS
===================

Store URL: [yourbrand].myshopify.com
Admin URL: https://admin.shopify.com/store/[yourbrand]

API Credentials:
- Storefront Access Token: shpat_...
- Admin API Access Token: shpat_...
- API Key: ...
- API Secret: ...
- Webhook Secret: ...

Store ID: ...
```

⚠️ **Store securely** - Never commit to Git!

---

## 🔗 Next Steps

### Update Vercel Environment Variables

1. Go to Vercel project → Settings → Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=yourbrand.myshopify.com
   NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_...
   ```
3. Redeploy

### Update Railway Environment Variables

1. Go to Railway project → Variables
2. Add:
   ```
   SHOPIFY_STORE_DOMAIN=yourbrand.myshopify.com
   SHOPIFY_API_KEY=...
   SHOPIFY_API_SECRET=...
   SHOPIFY_STOREFRONT_TOKEN=shpat_...
   SHOPIFY_WEBHOOK_SECRET=...
   ```

### Test Integration

1. Frontend fetches products from Shopify
2. Checkout redirects to Shopify
3. Webhooks fire to Railway
4. Customer data syncs

---

## 📚 Resources

- [Shopify Help Center](https://help.shopify.com)
- [Shopify API Docs](https://shopify.dev/docs)
- [Storefront API Reference](https://shopify.dev/api/storefront)
- [Webhook Documentation](https://shopify.dev/docs/apps/webhooks)

---

## 🆘 Troubleshooting

**Can't create custom app?**
- Ensure you're on a paid plan (after trial)
- Check account permissions

**Webhooks not firing?**
- Verify URL is correct
- Check Railway is deployed and accessible
- Verify webhook signature in Railway logs

**Products not showing in API?**
- Ensure products are "Active"
- Check product availability in Online Store channel
- Verify API scopes include product read

---

**Your Shopify store is now ready to power your salon platform!** 🛍️✨