import { PrismaClient } from '@prisma/client';
import process from 'node:process';

const prisma = new PrismaClient();

const categories = [
  {
    name: '₹1 - ₹10 Store',
    slug: 'budget-treats',
    description: 'Chocolates, biscuits, candies and sweet treats from ₹1 to ₹10 for instant low-value test checkout',
    icon: 'Cookie',
    displayOrder: 1,
    bannerUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=1200&q=80'
  },
  {
    name: 'Mobiles',
    slug: 'mobiles',
    description: 'Latest 5G smartphones, flagship devices and accessories',
    icon: 'Smartphone',
    displayOrder: 2,
    bannerUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80'
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Smart watches, headphones, laptops, bluetooth speakers and smart gadgets',
    icon: 'Laptop',
    displayOrder: 3,
    bannerUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80'
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Ethnic wear, trendy t-shirts, kurtis, shoes and apparel',
    icon: 'Shirt',
    displayOrder: 4,
    bannerUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&q=80'
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Cookware sets, mixer grinders, air fryers and home decor',
    icon: 'UtensilsCrossed',
    displayOrder: 5,
    bannerUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80'
  },
  {
    name: 'Grocery',
    slug: 'grocery',
    description: 'Basmati rice, pure spices, cold pressed oils and pulses',
    icon: 'ShoppingBasket',
    displayOrder: 6,
    bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80'
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    description: 'Skincare, herbal face wash, organic shampoos and fragrances',
    icon: 'Sparkles',
    displayOrder: 7,
    bannerUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80'
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Waterproof backpacks, leather wallets, aviators and belts',
    icon: 'Watch',
    displayOrder: 8,
    bannerUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80'
  },
  {
    name: 'Daily Essentials',
    slug: 'daily-essentials',
    description: 'LED lights, organizers, laundry essentials and hygiene products',
    icon: 'Zap',
    displayOrder: 9,
    bannerUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=1200&q=80'
  }
];

const products = [
  // ₹1 - ₹10 Store (Chocolates, Biscuits, Candies)
  {
    name: 'Cadbury Dairy Milk Chocolate Bar (13g)',
    slug: 'cadbury-dairy-milk-13g',
    description: 'Rich, smooth and creamy classic milk chocolate bar from Cadbury. The quintessential sweet treat for every celebration.',
    price: 10,
    originalPrice: 10,
    discountPercent: 0,
    categorySlug: 'budget-treats',
    imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&q=80',
    rating: 4.9,
    ratingCount: 8420,
    featured: true,
    brand: 'Cadbury',
    tags: ['Chocolate', 'Cadbury', 'Dairy Milk', '₹10']
  },
  {
    name: 'Nestle KitKat 2-Finger Wafer Bar (12.8g)',
    slug: 'nestle-kitkat-2-finger',
    description: 'Crispy wafer fingers covered in delicious smooth milk chocolate. Have a break, have a KitKat!',
    price: 10,
    originalPrice: 10,
    discountPercent: 0,
    categorySlug: 'budget-treats',
    imageUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=800&q=80',
    rating: 4.8,
    ratingCount: 6540,
    featured: true,
    brand: 'Nestle',
    tags: ['Chocolate', 'KitKat', 'Wafer', '₹10']
  },
  {
    name: 'Britannia Bourbon Chocolate Cream Biscuits (50g)',
    slug: 'britannia-bourbon-biscuits-50g',
    description: 'Crunchy chocolate biscuits filled with decadent chocolate cream and sprinkled with sparkling sugar crystals.',
    price: 10,
    originalPrice: 12,
    discountPercent: 17,
    categorySlug: 'budget-treats',
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&q=80',
    rating: 4.7,
    ratingCount: 5120,
    featured: true,
    brand: 'Britannia',
    tags: ['Biscuits', 'Bourbon', 'Chocolate', '₹10']
  },
  {
    name: 'Nestle Munch Crunchy Chocolate Wafer (9.5g)',
    slug: 'nestle-munch-wafer-9g',
    description: 'Crunchy wafer bar coated with rich chocolate coating for the ultimate crunch and delight.',
    price: 5,
    originalPrice: 5,
    discountPercent: 0,
    categorySlug: 'budget-treats',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80',
    rating: 4.6,
    ratingCount: 7890,
    featured: true,
    brand: 'Nestle',
    tags: ['Chocolate', 'Munch', 'Wafer', '₹5']
  },
  {
    name: 'Cadbury 5 Star Chocolate Bar (10.1g)',
    slug: 'cadbury-5-star-10g',
    description: 'Delicious mix of chewy caramel, soft nougat center, and smooth milk chocolate.',
    price: 5,
    originalPrice: 5,
    discountPercent: 0,
    categorySlug: 'budget-treats',
    imageUrl: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=800&q=80',
    rating: 4.6,
    ratingCount: 4320,
    featured: false,
    brand: 'Cadbury',
    tags: ['Chocolate', '5 Star', 'Caramel', '₹5']
  },
  {
    name: 'Parle-G Original Glucose Biscuits (50g)',
    slug: 'parle-g-glucose-biscuits-50g',
    description: 'India\'s largest selling biscuit brand packed with the wholesome goodness of wheat and milk. The perfect chai companion.',
    price: 5,
    originalPrice: 5,
    discountPercent: 0,
    categorySlug: 'budget-treats',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80',
    rating: 4.9,
    ratingCount: 15800,
    featured: true,
    brand: 'Parle',
    tags: ['Biscuits', 'Parle-G', 'Glucose', '₹5']
  },
  {
    name: 'Britannia Good Day Butter Cookies (30g)',
    slug: 'britannia-good-day-butter-30g',
    description: 'Rich butter cookies with delightful aroma and smile pattern design that brightens every moment.',
    price: 5,
    originalPrice: 5,
    discountPercent: 0,
    categorySlug: 'budget-treats',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80',
    rating: 4.7,
    ratingCount: 6200,
    featured: false,
    brand: 'Britannia',
    tags: ['Cookies', 'Good Day', 'Butter', '₹5']
  },
  {
    name: 'Pass Pass Pulse Tangy Mango Candy (Pack of 5)',
    slug: 'pulse-tangy-mango-candy-pack5',
    description: 'Tangy kaccha aam raw mango hard candy filled with an electrifying burst of spicy amchur masala.',
    price: 5,
    originalPrice: 5,
    discountPercent: 0,
    categorySlug: 'budget-treats',
    imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=800&q=80',
    rating: 4.8,
    ratingCount: 9340,
    featured: false,
    brand: 'DS Group',
    tags: ['Candy', 'Pulse', 'Tangy', '₹5']
  },
  {
    name: 'Center Fresh Spearmint Chewing Gum (Pack of 2)',
    slug: 'center-fresh-spearmint-pack2',
    description: 'Delicious liquid-filled spearmint gum that delivers an instant burst of cooling fresh breath.',
    price: 2,
    originalPrice: 2,
    discountPercent: 0,
    categorySlug: 'budget-treats',
    imageUrl: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=800&q=80',
    rating: 4.5,
    ratingCount: 3900,
    featured: false,
    brand: 'Perfetti',
    tags: ['Chewing Gum', 'Mint', 'Fresh', '₹2']
  },
  {
    name: 'Chlormint Ice Mint Herbal Drop Candy',
    slug: 'chlormint-ice-mint-drop',
    description: 'Classic cooling Ayurvedic herbal mint candy for soothing freshness — Dobara Mat Poochna!',
    price: 1,
    originalPrice: 1,
    discountPercent: 0,
    categorySlug: 'budget-treats',
    imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=800&q=80',
    rating: 4.6,
    ratingCount: 4800,
    featured: false,
    brand: 'Perfetti',
    tags: ['Candy', 'Mint', '₹1', 'Herbal']
  },

  // Mobiles
  {
    name: 'Samsung Galaxy S24 5G (Onyx Black, 256GB)',
    slug: 'samsung-galaxy-s24-5g-256gb',
    description: 'Experience flagship Galaxy AI capabilities, 50MP Pro-grade camera, Snapdragon 8 Gen 3 processor, and dynamic AMOLED 2X 120Hz display with all-day battery.',
    price: 74999,
    originalPrice: 79999,
    discountPercent: 6,
    categorySlug: 'mobiles',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
    rating: 4.8,
    ratingCount: 3420,
    featured: true,
    brand: 'Samsung',
    tags: ['5G', 'Smartphone', 'Flagship', 'Galaxy AI']
  },
  {
    name: 'OnePlus 12 5G (Silky Black, 16GB RAM, 512GB)',
    slug: 'oneplus-12-5g-512gb',
    description: '4th Gen Hasselblad Camera system, Snapdragon 8 Gen 3, 5400mAh battery with 100W SUPERVOOC ultra-fast charging and 2K 120Hz ProXDR display.',
    price: 64999,
    originalPrice: 69999,
    discountPercent: 7,
    categorySlug: 'mobiles',
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    rating: 4.7,
    ratingCount: 1890,
    featured: true,
    brand: 'OnePlus',
    tags: ['OnePlus', 'Flagship', 'Fast Charging']
  },
  {
    name: 'Redmi Note 13 Pro+ 5G (Fusion Purple, 256GB)',
    slug: 'redmi-note-13-pro-plus-5g',
    description: '200MP OIS Camera with 4X in-sensor lossless zoom, 1.5K 120Hz Curved AMOLED display, IP68 water resistance and 120W HyperCharge.',
    price: 29999,
    originalPrice: 33999,
    discountPercent: 12,
    categorySlug: 'mobiles',
    imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80',
    rating: 4.5,
    ratingCount: 5120,
    featured: false,
    brand: 'Xiaomi',
    tags: ['Camera Phone', 'Redmi', '200MP']
  },
  {
    name: 'Realme 12 Pro 5G (Submarine Blue, 128GB)',
    slug: 'realme-12-pro-5g-128gb',
    description: 'Luxury watch design by Ollivier Saveo, 32MP Sony telephoto portrait camera, 120Hz curved vision display and 67W SUPERVOOC charging.',
    price: 23999,
    originalPrice: 28999,
    discountPercent: 17,
    categorySlug: 'mobiles',
    imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80',
    rating: 4.4,
    ratingCount: 2210,
    featured: false,
    brand: 'Realme',
    tags: ['Realme', 'Budget Flagship', 'Portrait']
  },

  // Electronics
  {
    name: 'Sony WH-1000XM5 Wireless ANC Headphones',
    slug: 'sony-wh-1000xm5-noise-cancelling-headphones',
    description: 'Industry leading active noise cancellation with 8 microphones, 30 hours battery life, ultra-comfortable lightweight design, and Hi-Res wireless audio.',
    price: 26990,
    originalPrice: 34990,
    discountPercent: 23,
    categorySlug: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    rating: 4.9,
    ratingCount: 4210,
    featured: true,
    brand: 'Sony',
    tags: ['Audio', 'ANC', 'Headphones', 'Premium']
  },
  {
    name: 'boAt Airdopes 141 True Wireless Earbuds',
    slug: 'boat-airdopes-141-tws',
    description: '42 hours total playback time, Beast mode for low latency gaming, ENx technology for crystal clear calls, ASAP charge (5 min = 75 min play), and IPX4 rating.',
    price: 1299,
    originalPrice: 4490,
    discountPercent: 71,
    categorySlug: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    rating: 4.3,
    ratingCount: 14500,
    featured: true,
    brand: 'boAt',
    tags: ['TWS', 'Earbuds', 'boAt', 'Bestseller']
  },
  {
    name: 'Noise ColorFit Ultra 3 Smartwatch (1.96" AMOLED)',
    slug: 'noise-colorfit-ultra-3-smartwatch',
    description: 'Metallic premium finish with functional crown, 1.96" AMOLED Always-on display, Bluetooth calling with Tru Sync, 100+ sports modes and health suite.',
    price: 3499,
    originalPrice: 8999,
    discountPercent: 61,
    categorySlug: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    rating: 4.5,
    ratingCount: 8940,
    featured: false,
    brand: 'Noise',
    tags: ['Smartwatch', 'AMOLED', 'Fitness']
  },
  {
    name: 'JBL Flip 6 Portable Waterproof Bluetooth Speaker',
    slug: 'jbl-flip-6-bluetooth-speaker',
    description: 'Bold JBL Original Pro Sound with 2-way speaker system, racetrack-shaped woofer, IP67 waterproof and dustproof, up to 12 hours of party playtime.',
    price: 9999,
    originalPrice: 13999,
    discountPercent: 29,
    categorySlug: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
    rating: 4.7,
    ratingCount: 3100,
    featured: false,
    brand: 'JBL',
    tags: ['Speaker', 'Bluetooth', 'Waterproof']
  },
  {
    name: 'Logitech MX Master 3S Wireless Performance Mouse',
    slug: 'logitech-mx-master-3s-mouse',
    description: 'Quiet clicks, 8K DPI tracking on any surface including glass, MagSpeed electromagnetic scrolling wheel, ergonomic thumb rest, and multi-device connectivity.',
    price: 8995,
    originalPrice: 10995,
    discountPercent: 18,
    categorySlug: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
    rating: 4.9,
    ratingCount: 2780,
    featured: false,
    brand: 'Logitech',
    tags: ['Mouse', 'Productivity', 'Wireless']
  },
  {
    name: 'Keychron K2 V2 Wireless Mechanical Keyboard (RGB)',
    slug: 'keychron-k2-v2-mechanical-keyboard',
    description: 'Compact 75% layout mechanical keyboard with Gateron G Pro Brown switches, Mac/Windows layout toggle, Bluetooth 5.1 connect up to 3 devices, and dynamic RGB.',
    price: 7499,
    originalPrice: 9499,
    discountPercent: 21,
    categorySlug: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    rating: 4.8,
    ratingCount: 1650,
    featured: false,
    brand: 'Keychron',
    tags: ['Keyboard', 'Mechanical', 'Gaming']
  },

  // Fashion
  {
    name: 'Men\'s Pure Cotton Oxford Casual Shirt (Navy Blue)',
    slug: 'mens-pure-cotton-oxford-shirt-navy',
    description: 'Tailored regular-fit shirt crafted from breathable 100% pre-washed cotton, button-down collar, perfect for both formal meetings and weekend casual outings.',
    price: 1199,
    originalPrice: 2499,
    discountPercent: 52,
    categorySlug: 'fashion',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
    rating: 4.4,
    ratingCount: 3820,
    featured: true,
    brand: 'UrbanCraft',
    tags: ['Men', 'Shirt', 'Cotton', 'Casual']
  },
  {
    name: 'Women\'s Handcrafted Anarkali Kurti with Dupatta',
    slug: 'womens-handcrafted-anarkali-kurti-dupatta',
    description: 'Elegant flared Anarkali silhouette with traditional Zari embroidery work, paired with pure chiffon dupatta. Ideal for weddings, festivals and family gatherings.',
    price: 2499,
    originalPrice: 5999,
    discountPercent: 58,
    categorySlug: 'fashion',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    rating: 4.6,
    ratingCount: 2950,
    featured: true,
    brand: 'Biba Vibes',
    tags: ['Ethnic', 'Kurti', 'Festive', 'Women']
  },
  {
    name: 'Puma Men\'s Nitro Lightweight Running Sneakers',
    slug: 'puma-nitro-running-sneakers',
    description: 'Advanced Nitro foam cushioning offering superior responsiveness and lightweight propulsion. Breathable engineered mesh upper and durable rubber outsole.',
    price: 3999,
    originalPrice: 7999,
    discountPercent: 50,
    categorySlug: 'fashion',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    rating: 4.7,
    ratingCount: 5410,
    featured: false,
    brand: 'Puma',
    tags: ['Footwear', 'Running', 'Sneakers']
  },
  {
    name: 'Women\'s Solid Wide Leg High-Waist Denim Jeans',
    slug: 'womens-high-waist-wide-leg-jeans',
    description: 'Vintage high-rise wide-leg cut made with stretch denim for maximum comfort and an effortlessly chic silhouette.',
    price: 1499,
    originalPrice: 2999,
    discountPercent: 50,
    categorySlug: 'fashion',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
    rating: 4.5,
    ratingCount: 1890,
    featured: false,
    brand: 'DenimCo',
    tags: ['Jeans', 'Denim', 'Women']
  },

  // Home & Kitchen
  {
    name: 'Prestige Iris 750W Mixer Grinder (3 Jars + 1 Juicer)',
    slug: 'prestige-iris-750w-mixer-grinder',
    description: 'Heavy duty 750 watt motor with overload protection, 3 stainless steel multipurpose jars and transparent juicer jar with stainless steel mesh sieve.',
    price: 3199,
    originalPrice: 6295,
    discountPercent: 49,
    categorySlug: 'home-kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800&q=80',
    rating: 4.5,
    ratingCount: 9800,
    featured: true,
    brand: 'Prestige',
    tags: ['Kitchen', 'Mixer Grinder', 'Appliances']
  },
  {
    name: 'Philips Digital Air Fryer 4.1L (Rapid Air Tech)',
    slug: 'philips-digital-air-fryer-4l',
    description: 'Fry with up to 90% less oil using patented Rapid Air Technology. 7 preset cooking programs with touch screen digital display and dishwasher-safe basket.',
    price: 6999,
    originalPrice: 11995,
    discountPercent: 42,
    categorySlug: 'home-kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80',
    rating: 4.8,
    ratingCount: 4120,
    featured: true,
    brand: 'Philips',
    tags: ['Air Fryer', 'Healthy', 'Kitchen']
  },
  {
    name: 'Hawkins Futura Hard Anodised Cookware Set (3 Pcs)',
    slug: 'hawkins-futura-cookware-set',
    description: 'Includes 26cm Frying Pan, 3L Deep Kadhai with lid, and 1.5L Saucepan. Scratch resistant hard anodised aluminium body for even heating.',
    price: 3650,
    originalPrice: 4750,
    discountPercent: 23,
    categorySlug: 'home-kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80',
    rating: 4.7,
    ratingCount: 3200,
    featured: false,
    brand: 'Hawkins',
    tags: ['Cookware', 'Kadhai', 'Utensils']
  },
  {
    name: 'Solimo 100% Cotton King Size Bedsheet with 2 Pillow Covers',
    slug: 'solimo-cotton-king-size-bedsheet',
    description: 'Super soft 210 TC pure cotton fabric in elegant ethnic floral print, large dimensions (274 x 274 cm) for easy tuck-in under mattress.',
    price: 999,
    originalPrice: 1999,
    discountPercent: 50,
    categorySlug: 'home-kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
    rating: 4.3,
    ratingCount: 6540,
    featured: false,
    brand: 'Solimo',
    tags: ['Home', 'Bedsheet', 'Cotton']
  },

  // Grocery
  {
    name: 'India Gate Royal Basmati Rice (5 Kg)',
    slug: 'india-gate-royal-basmati-rice-5kg',
    description: 'Aged for 2 years for authentic aroma, slender pearls, fluffy texture and sweet taste. Ideal for royal Biryani, Pulao and fried rice.',
    price: 549,
    originalPrice: 750,
    discountPercent: 27,
    categorySlug: 'grocery',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
    rating: 4.8,
    ratingCount: 11200,
    featured: true,
    brand: 'India Gate',
    tags: ['Rice', 'Basmati', 'Staple', 'Grocery']
  },
  {
    name: 'Fortune Sunlite Refined Sunflower Oil (5L Can)',
    slug: 'fortune-sunflower-oil-5l',
    description: 'Light and easy to digest cooking oil enriched with Vitamin A and Vitamin D, maintains natural food flavors with high smoke point.',
    price: 689,
    originalPrice: 850,
    discountPercent: 19,
    categorySlug: 'grocery',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
    rating: 4.6,
    ratingCount: 8900,
    featured: false,
    brand: 'Fortune',
    tags: ['Oil', 'Cooking', 'Grocery']
  },
  {
    name: 'Tata Sampann Unpolished Toor Dal (1 Kg)',
    slug: 'tata-sampann-toor-dal-1kg',
    description: '100% unpolished nutritious arhar toor dal rich in natural dietary fiber and plant protein without any artificial water, oil, or stone polishing.',
    price: 175,
    originalPrice: 220,
    discountPercent: 20,
    categorySlug: 'grocery',
    imageUrl: 'https://images.unsplash.com/photo-1585994192730-9886b17425b7?w=800&q=80',
    rating: 4.7,
    ratingCount: 4500,
    featured: false,
    brand: 'Tata Sampann',
    tags: ['Dal', 'Pulses', 'Organic']
  },
  {
    name: 'MDH Deggi Mirch & Garam Masala Spice Combo (100g each)',
    slug: 'mdh-masala-combo-pack',
    description: 'Traditional blend of authentic whole spices ground to perfection for deep aroma, vibrant natural red color and savory flavor.',
    price: 160,
    originalPrice: 190,
    discountPercent: 16,
    categorySlug: 'grocery',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    rating: 4.8,
    ratingCount: 6700,
    featured: false,
    brand: 'MDH',
    tags: ['Spices', 'Masala', 'Indian Cooking']
  },

  // Beauty
  {
    name: 'Mamaearth Onion Hair Fall Control Shampoo (600ml)',
    slug: 'mamaearth-onion-hair-fall-shampoo',
    description: 'Enriched with Onion oil and Plant Keratin, reduces hair fall, strengthens hair strands and stimulates scalp micro-circulation. Free of sulfates and parabens.',
    price: 499,
    originalPrice: 699,
    discountPercent: 29,
    categorySlug: 'beauty',
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&q=80',
    rating: 4.4,
    ratingCount: 8120,
    featured: true,
    brand: 'Mamaearth',
    tags: ['Haircare', 'Organic', 'Shampoo']
  },
  {
    name: 'The Derma Co 1% Hyaluronic Sunscreen Aqua Gel (50g)',
    slug: 'derma-co-1-percent-hyaluronic-sunscreen',
    description: 'Broad spectrum SPF 50 PA++++ protection with ultra-light water-like consistency. Leaves zero white cast and protects from blue light damage.',
    price: 449,
    originalPrice: 499,
    discountPercent: 10,
    categorySlug: 'beauty',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
    rating: 4.7,
    ratingCount: 9400,
    featured: true,
    brand: 'The Derma Co',
    tags: ['Skincare', 'Sunscreen', 'SPF50']
  },
  {
    name: 'Himalaya Purifying Neem Face Wash (400ml Pump Pack)',
    slug: 'himalaya-purifying-neem-face-wash-400ml',
    description: 'Soap-free herbal formula combining Neem and Turmeric to cleanse impurities, prevent pimples, and soothe acne-prone skin naturally.',
    price: 299,
    originalPrice: 425,
    discountPercent: 30,
    categorySlug: 'beauty',
    imageUrl: 'https://images.unsplash.com/photo-1556228722-d0b5de70b774?w=800&q=80',
    rating: 4.6,
    ratingCount: 16200,
    featured: false,
    brand: 'Himalaya',
    tags: ['Facewash', 'Neem', 'Herbal']
  },
  {
    name: 'Fogg Scent Xtremo Long-Lasting Eau De Parfum (100ml)',
    slug: 'fogg-scent-xtremo-edp-100ml',
    description: 'Rich woody and citrus aromatic notes with remarkable sillage that lasts all day through tropical Indian climate.',
    price: 399,
    originalPrice: 650,
    discountPercent: 39,
    categorySlug: 'beauty',
    imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80',
    rating: 4.3,
    ratingCount: 5120,
    featured: false,
    brand: 'Fogg',
    tags: ['Perfume', 'Fragrance', 'Men']
  },

  // Accessories
  {
    name: 'Wildcraft 35L Water-Resistant Laptop Backpack',
    slug: 'wildcraft-35l-laptop-backpack',
    description: 'Ergonomic padded back with multi-level airflow ventilation, 15.6" padded laptop sleeve, quick-access organizer pockets, and abrasion-resistant fabric.',
    price: 1499,
    originalPrice: 2799,
    discountPercent: 46,
    categorySlug: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    rating: 4.6,
    ratingCount: 7890,
    featured: true,
    brand: 'Wildcraft',
    tags: ['Bag', 'Backpack', 'Laptop Bag']
  },
  {
    name: 'Titan Brown Genuine Leather RFID Blocking Wallet',
    slug: 'titan-genuine-leather-rfid-wallet',
    description: 'Handcrafted top grain genuine leather with built-in RFID shielding to protect against contactless card theft. 6 card slots and dual currency compartments.',
    price: 995,
    originalPrice: 1695,
    discountPercent: 41,
    categorySlug: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
    rating: 4.5,
    ratingCount: 4320,
    featured: false,
    brand: 'Titan',
    tags: ['Wallet', 'Leather', 'Accessories']
  },
  {
    name: 'Fastrack Polarized Aviator Sunglasses (Gunmetal)',
    slug: 'fastrack-polarized-aviator-sunglasses',
    description: 'Classic teardrop aviator frame with UV400 polarized lenses that eliminate harsh glare and deliver crisp optical clarity in sunlight.',
    price: 1299,
    originalPrice: 2299,
    discountPercent: 43,
    categorySlug: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
    rating: 4.4,
    ratingCount: 2980,
    featured: false,
    brand: 'Fastrack',
    tags: ['Sunglasses', 'Eyewear', 'Fashion']
  },

  // Daily Essentials
  {
    name: 'Wipro 9W Smart LED RGB Bulb (WiFi + Alexa/Google Support)',
    slug: 'wipro-9w-smart-led-rgb-bulb',
    description: '16 million colors with dimmable warm-to-cool white light, music sync mode, schedule timers and hands-free voice control without any external hub.',
    price: 499,
    originalPrice: 1299,
    discountPercent: 62,
    categorySlug: 'daily-essentials',
    imageUrl: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&q=80',
    rating: 4.4,
    ratingCount: 11400,
    featured: true,
    brand: 'Wipro',
    tags: ['Smart Home', 'LED', 'Lighting']
  },
  {
    name: 'Dettol Disinfectant Multi-Surface Cleaner (1L Lemon)',
    slug: 'dettol-disinfectant-cleaner-1l',
    description: 'Kills 99.9% of illness-causing germs, removes tough stains on tiles and marble floors, leaving a refreshing citrus lemon fragrance.',
    price: 199,
    originalPrice: 250,
    discountPercent: 20,
    categorySlug: 'daily-essentials',
    imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&q=80',
    rating: 4.8,
    ratingCount: 15400,
    featured: false,
    brand: 'Dettol',
    tags: ['Cleaning', 'Hygiene', 'Essentials']
  },
  {
    name: 'Duracell Ultra Alkaline AA Batteries (Pack of 8)',
    slug: 'duracell-ultra-aa-batteries-pack-8',
    description: 'Up to 100% extra life power with Powercheck indicator and Duralock technology that keeps unused batteries fresh for up to 10 years.',
    price: 349,
    originalPrice: 480,
    discountPercent: 27,
    categorySlug: 'daily-essentials',
    imageUrl: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=800&q=80',
    rating: 4.9,
    ratingCount: 9200,
    featured: false,
    brand: 'Duracell',
    tags: ['Battery', 'Electronics', 'Essentials']
  }
];

async function main() {
  console.log('🌱 Starting database seed for PRASANTH BAZAR...');

  // 1. Seed Categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat
    });
  }
  console.log(`✅ Seeded ${categories.length} categories.`);

  // 2. Seed Products
  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: prod,
      create: prod
    });
  }
  console.log(`✅ Seeded ${products.length} realistic Indian commerce products.`);

  console.log('🚀 PRASANTH BAZAR Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
