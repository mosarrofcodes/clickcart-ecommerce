import { PrismaClient, CouponType, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...\n");

  // ==================== ADMIN USER ====================
  // Password comes from ADMIN_SEED_PASSWORD. The fallback is a placeholder
  // that must be changed before seeding a production database — never ship
  // a real admin with a known password.
  const adminPassword = await hash(
    process.env.ADMIN_SEED_PASSWORD ?? "changeMeOnFirstRun_9f3K!",
    12,
  );
  if (!process.env.ADMIN_SEED_PASSWORD) {
    console.warn(
      "WARNING: ADMIN_SEED_PASSWORD is not set. The seeded admin uses the insecure fallback password - set it before seeding production.",
    );
  }
  const admin = await prisma.user.upsert({
    where: { email: "admin@clickcart.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@clickcart.com",
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log(`Admin user: ${admin.email}`);

  // ==================== CATEGORIES ====================
  const categoriesData = [
    {
      name: "Electronics",
      slug: "electronics",
      description: "Gadgets, devices, and tech accessories",
      image: "https://picsum.photos/seed/clickcart-electronics/800/400",
    },
    {
      name: "Clothing",
      slug: "clothing",
      description: "Fashion apparel and accessories",
      image: "https://picsum.photos/seed/clickcart-clothing/800/400",
    },
    {
      name: "Furniture",
      slug: "furniture",
      description: "Home and office furniture",
      image: "https://picsum.photos/seed/clickcart-furniture/800/400",
    },
    {
      name: "Groceries",
      slug: "groceries",
      description: "Food, beverages, and daily essentials",
      image: "https://picsum.photos/seed/clickcart-groceries/800/400",
    },
    {
      name: "Beauty",
      slug: "beauty",
      description: "Skincare, makeup, and personal care",
      image: "https://picsum.photos/seed/clickcart-beauty/800/400",
    },
    {
      name: "Sports",
      slug: "sports-accessories",
      description: "Sports equipment and fitness gear",
      image: "https://picsum.photos/seed/clickcart-sports/800/400",
    },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, image: cat.image },
      create: cat,
    });
    categories.push(category);
    console.log(`Category: ${category.name}`);
  }

  // ==================== PRODUCTS ====================
  const productsData = [
    // Electronics
    {
      title: "iPhone 15 Pro",
      description: "Apple iPhone 15 Pro with A17 Pro chip, titanium design, and 48MP camera system.",
      price: 159999,
      stock: 50,
      image: "https://picsum.photos/seed/clickcart-iphone-15-pro/600/400",
      brand: "Apple",
      sku: "ELEC-001",
      weight: 0.187,
      tags: ["smartphone", "apple", "5g"],
      rating: 4.8,
      categorySlug: "electronics",
    },
    {
      title: "Samsung Galaxy S24 Ultra",
      description: "Samsung flagship with S Pen, 200MP camera, and AI-powered features.",
      price: 189999,
      stock: 35,
      image: "https://picsum.photos/seed/clickcart-galaxy-s24/600/400",
      brand: "Samsung",
      sku: "ELEC-002",
      weight: 0.232,
      tags: ["smartphone", "samsung", "5g"],
      rating: 4.7,
      categorySlug: "electronics",
    },
    {
      title: "MacBook Pro 14-inch",
      description: "Apple MacBook Pro with M3 Pro chip, 18GB RAM, 512GB SSD.",
      price: 219999,
      stock: 20,
      image: "https://picsum.photos/seed/clickcart-macbook-pro/600/400",
      brand: "Apple",
      sku: "ELEC-003",
      weight: 1.55,
      tags: ["laptop", "apple", "professional"],
      rating: 4.9,
      categorySlug: "electronics",
    },
    {
      title: "Sony WH-1000XM5",
      description: "Industry-leading noise canceling wireless headphones with 30-hour battery.",
      price: 48999,
      stock: 75,
      image: "https://picsum.photos/seed/clickcart-sony-headphones/600/400",
      brand: "Sony",
      sku: "ELEC-004",
      weight: 0.25,
      tags: ["headphones", "wireless", "noise-canceling"],
      rating: 4.6,
      categorySlug: "electronics",
    },
    // Clothing
    {
      title: "Classic White T-Shirt",
      description: "100% cotton comfortable everyday t-shirt.",
      price: 899,
      stock: 200,
      image: "https://picsum.photos/seed/clickcart-tshirt/600/400",
      brand: "BasicWear",
      sku: "CLO-001",
      weight: 0.2,
      tags: ["t-shirt", "cotton", "casual"],
      rating: 4.2,
      categorySlug: "clothing",
    },
    {
      title: "Slim Fit Jeans",
      description: "Modern slim fit denim jeans with stretch comfort.",
      price: 2499,
      stock: 150,
      image: "https://picsum.photos/seed/clickcart-jeans/600/400",
      brand: "DenimCo",
      sku: "CLO-002",
      weight: 0.6,
      tags: ["jeans", "denim", "slim-fit"],
      rating: 4.4,
      categorySlug: "clothing",
    },
    {
      title: "Winter Jacket",
      description: "Waterproof winter jacket with fleece lining and hood.",
      price: 4999,
      stock: 80,
      image: "https://picsum.photos/seed/clickcart-jacket/600/400",
      brand: "WinterWear",
      sku: "CLO-003",
      weight: 1.2,
      tags: ["jacket", "winter", "waterproof"],
      rating: 4.5,
      categorySlug: "clothing",
    },
    // Furniture
    {
      title: "Ergonomic Office Chair",
      description: "Adjustable lumbar support, breathable mesh, and armrests.",
      price: 15999,
      stock: 40,
      image: "https://picsum.photos/seed/clickcart-office-chair/600/400",
      brand: "ComfortPlus",
      sku: "FUR-001",
      weight: 15,
      tags: ["chair", "office", "ergonomic"],
      rating: 4.3,
      categorySlug: "furniture",
    },
    {
      title: "Standing Desk",
      description: "Electric height-adjustable standing desk with memory presets.",
      price: 24999,
      stock: 25,
      image: "https://picsum.photos/seed/clickcart-standing-desk/600/400",
      brand: "WorkFit",
      sku: "FUR-002",
      weight: 30,
      tags: ["desk", "standing", "electric"],
      rating: 4.6,
      categorySlug: "furniture",
    },
    // Groceries
    {
      title: "Organic Coffee Beans",
      description: "Premium Arabica coffee beans, 1kg pack.",
      price: 1299,
      stock: 300,
      image: "https://picsum.photos/seed/clickcart-coffee/600/400",
      brand: "BrewMaster",
      sku: "GRO-001",
      weight: 1,
      tags: ["coffee", "organic", "arabica"],
      rating: 4.7,
      categorySlug: "groceries",
    },
    {
      title: "Extra Virgin Olive Oil",
      description: "Cold-pressed extra virgin olive oil, 500ml.",
      price: 999,
      stock: 250,
      image: "https://picsum.photos/seed/clickcart-olive-oil/600/400",
      brand: "Mediterra",
      sku: "GRO-002",
      weight: 0.5,
      tags: ["olive-oil", "organic", "cooking"],
      rating: 4.5,
      categorySlug: "groceries",
    },
    // Beauty
    {
      title: "Vitamin C Serum",
      description: "Brightening vitamin C serum with hyaluronic acid, 30ml.",
      price: 1899,
      stock: 120,
      image: "https://picsum.photos/seed/clickcart-serum/600/400",
      brand: "GlowUp",
      sku: "BEA-001",
      weight: 0.05,
      tags: ["serum", "vitamin-c", "skincare"],
      rating: 4.4,
      categorySlug: "beauty",
    },
    // Sports
    {
      title: "Yoga Mat",
      description: "Non-slip exercise yoga mat, 6mm thick.",
      price: 1499,
      stock: 180,
      image: "https://picsum.photos/seed/clickcart-yoga-mat/600/400",
      brand: "FitLife",
      sku: "SPO-001",
      weight: 1,
      tags: ["yoga", "mat", "fitness"],
      rating: 4.3,
      categorySlug: "sports-accessories",
    },
    {
      title: "Adjustable Dumbbells",
      description: "Adjustable dumbbell set, 5-25kg per hand.",
      price: 9999,
      stock: 30,
      image: "https://picsum.photos/seed/clickcart-dumbbells/600/400",
      brand: "PowerLift",
      sku: "SPO-002",
      weight: 25,
      tags: ["dumbbells", "weights", "gym"],
      rating: 4.6,
      categorySlug: "sports-accessories",
    },
  ];

  for (const prod of productsData) {
    const category = categories.find((c) => c.slug === prod.categorySlug);
    if (!category) continue;

    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        title: prod.title,
        description: prod.description,
        price: prod.price,
        stock: prod.stock,
        image: prod.image,
        brand: prod.brand,
        weight: prod.weight,
        tags: prod.tags,
        rating: prod.rating,
        categoryId: category.id,
      },
      create: {
        title: prod.title,
        description: prod.description,
        price: prod.price,
        stock: prod.stock,
        image: prod.image,
        brand: prod.brand,
        sku: prod.sku,
        weight: prod.weight,
        tags: prod.tags,
        rating: prod.rating,
        categoryId: category.id,
      },
    });
    console.log(`Product: ${prod.title}`);
  }

  // ==================== COUPONS ====================
  const couponsData = [
    {
      code: "SAVE10",
      type: CouponType.PERCENT,
      value: 10,
      minOrder: 2000,
      maxDiscount: null,
      active: true,
      onePerUser: true,
    },
    {
      code: "FREESHIP",
      type: CouponType.FREESHIP,
      value: 0,
      minOrder: 0,
      maxDiscount: null,
      active: true,
      onePerUser: false,
    },
    {
      code: "WELCOME5",
      type: CouponType.FIXED,
      value: 500,
      minOrder: 3000,
      maxDiscount: null,
      active: true,
      onePerUser: true,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: { type: c.type, value: c.value, minOrder: c.minOrder, active: c.active, onePerUser: c.onePerUser },
      create: c,
    });
    console.log(`Coupon: ${c.code}`);
  }

  // ==================== SITE SETTINGS ====================
  const siteSettingsData = {
    storeName: "ClickCart",
    tagline: "Your one-stop online shop for electronics, fashion and more",
    hotline: "+880 1700-000000",
    supportEmail: "support@clickcart.example",
    announcement: "Free delivery inside Dhaka on orders over ৳5,000",
    shippingInsideDhaka: "80",
    shippingOutsideDhaka: "130",
    freeShippingThreshold: "5000",
    codEnabled: "true",
    codMaxAmount: "50000",
    deliveryEstimateInside: "1-2 working days",
    deliveryEstimateOutside: "3-5 working days",
    currency: "BDT",
    emiMonths: "12",
    emiInterestRate: "0",
  };

  for (const [key, value] of Object.entries(siteSettingsData)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log("Site settings seeded");

  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
