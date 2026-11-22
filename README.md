# SKWIRREL — Born From Odisha. Made For The World.

> Premium cultural streetwear e-commerce platform built with Next.js 15, TypeScript, Prisma, and Framer Motion.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/SubhraS-G/skwirrel-store.git
cd skwirrel
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Database Setup
```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed initial data
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Static Assets

`public/` ships with generated placeholder images (favicon, OG image, hero
poster, seed product/blog covers) and a placeholder hero video. Regenerate
or replace them with:

```bash
node scripts/generate-assets.mjs      # images + manifest
node scripts/generate-hero-video.mjs  # hero background video (needs ffmpeg)
```

### Checks

```bash
npm run lint   # ESLint
npx tsc --noEmit  # type check
npm run build  # production build
```

---

## 📁 Project Structure

```
skwirrel/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth pages (login, signup)
│   │   ├── login/
│   │   └── signup/
│   ├── account/                # Protected account pages
│   │   ├── orders/
│   │   ├── wishlist/
│   │   └── addresses/
│   ├── admin/                  # Admin dashboard (role-protected)
│   │   ├── products/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── blog/
│   │   ├── coupons/
│   │   └── analytics/
│   ├── api/                    # API Routes
│   │   ├── auth/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── checkout/
│   │   ├── newsletter/
│   │   ├── contact/
│   │   ├── reviews/
│   │   ├── coupons/
│   │   ├── upload/
│   │   └── webhooks/
│   ├── blog/                   # Blog pages
│   ├── cart/
│   ├── checkout/
│   ├── lookbook/
│   ├── our-roots/
│   ├── about/
│   ├── sustainability/
│   ├── shop/                   # Shop + product detail
│   ├── track-order/
│   ├── privacy-policy/
│   ├── terms/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── not-found.tsx
│   ├── global-error.tsx
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/
│   ├── layout/                 # Navbar, Footer
│   ├── home/                   # All home page sections
│   ├── shop/                   # Shop filters, grid, search
│   ├── product/                # Product card, gallery, info, reviews
│   ├── cart/                   # Cart items, summary, mini cart
│   ├── checkout/               # Checkout form, order summary, steps
│   ├── account/                # Account sidebar, overview, order history
│   ├── auth/                   # Login/signup forms
│   ├── blog/                   # Blog grid, post, related
│   ├── lookbook/               # Gallery, filters
│   ├── contact/                # Contact form, info
│   ├── admin/                  # Admin sidebar, stats, tables
│   └── shared/                 # Cursor, progress bar, providers, search
│
├── hooks/                      # Custom React hooks
│   ├── useCartStore.ts         # Zustand cart store
│   ├── useWishlistStore.ts     # Zustand wishlist store
│   ├── useScrollAnimation.ts
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
│
├── lib/
│   ├── auth.ts                 # NextAuth config
│   ├── prisma.ts               # Prisma client singleton
│   ├── stripe/                 # Stripe client
│   ├── razorpay/               # Razorpay client
│   ├── cloudinary/             # Cloudinary client
│   ├── email/                  # Nodemailer email templates
│   ├── supabase/               # Data query helpers
│   ├── seo/                    # Schema.org helpers
│   └── validations/            # Zod schemas
│
├── types/                      # TypeScript type definitions
├── styles/                     # globals.css
├── prisma/
│   ├── schema.prisma           # Complete DB schema
│   └── seed.ts                 # Seed data
├── public/                     # Static assets
├── middleware.ts               # Auth route protection
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| GSAP + ScrollTrigger | Advanced scroll animations |
| Lenis | Smooth scrolling |
| Prisma + PostgreSQL | Database ORM |
| NextAuth.js | Authentication |
| Stripe | International payments |
| Razorpay | Indian payments (UPI/Cards/Netbanking) |
| Cloudinary | Image storage & CDN |
| Nodemailer | Transactional emails |
| Zustand | Client state management |
| React Hook Form + Zod | Form validation |
| shadcn/ui | UI components |
| Lucide React | Icons |

---

## 💳 Payment Setup

### Stripe
1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard → Developers
3. Set webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Add `checkout.session.completed` webhook event

### Razorpay
1. Create account at [razorpay.com](https://razorpay.com)
2. Get Key ID and Secret from Settings → API Keys
3. Add `<Script src="https://checkout.razorpay.com/v1/checkout.js" />` in layout

---

## 🗄️ Database

The Prisma schema includes all tables:
- `users`, `accounts`, `sessions` — Auth
- `products`, `product_variants`, `categories` — Catalog
- `orders`, `order_items`, `payments` — Commerce
- `cart_items`, `wishlists`, `addresses` — User data
- `reviews`, `coupons`, `blog_posts` — Content
- `lookbook_images`, `newsletter_subscribers`, `contact_messages` — Marketing

---

## 🚢 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add all environment variables in Vercel Dashboard → Settings → Environment Variables.

---

## 📧 Email Templates

Three email templates included:
- **Order Confirmation** — sent on successful order
- **Newsletter Welcome** — sent on subscription (includes WELCOME10 coupon)
- **Contact Notification** — sent to admin on contact form submission

---

## 🔐 Admin Access

Create an admin user:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```
Admin panel: `yourdomain.com/admin`

---

## 🌿 Brand

**SKWIRREL** — Born from Odisha. Made for the world.

> *Wear your culture with pride.*

Instagram: [@skwirrelindia](https://instagram.com/skwirrelindia)
