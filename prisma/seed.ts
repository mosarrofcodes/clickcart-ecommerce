import { PrismaClient, CouponType, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...\n");

  // ==================== ADMIN USER ====================
  const adminPassword = await hash("admin123", 12);
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
      image: "https://cdn.dummyjson.com/products/images/Electronics/featured.png",
    },
    {
      name: "Clothing",
      slug: "clothing",
      description: "Fashion apparel and accessories",
      image: "https://cdn.dummyjson.com/products/images/Clothing/featured.png",
    },
    {
      name: "Furniture",
      slug: "furniture",
      description: "Home and office furniture",
      image: "https://cdn.dummyjson.com/products/images/Furniture/featured.png",
    },
    {
      name: "Groceries",
      slug: "groceries",
      description: "Food, beverages, and daily essentials",
      image: "https://cdn.dummyjson.com/products/images/Groceries/featured.png",
    },
    {
      name: "Beauty",
      slug: "beauty",
      description: "Skincare, makeup, and personal care",
      image: "https://cdn.dummyjson.com/products/images/Beauty/featured.png",
    },
    {
      name: "Sports",
      slug: "sports-accessories",
      description: "Sports equipment and fitness gear",
      image: "https://cdn.dummyjson.com/products/images/Sports%20Accessories/featured.png",
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
      price: 999.99,
      stock: 50,
      image: "https://cdn.dummyjson.com/products/images/smartphones/1.jpg",
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
      price: 1199.99,
      stock: 35,
      image: "https://cdn.dummyjson.com/products/images/smartphones/2.jpg",
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
      price: 1999.99,
      stock: 20,
      image: "https://cdn.dummyjson.com/products/images/laptops/1.jpg",
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
      price: 349.99,
      stock: 75,
      image: "https://cdn.dummyjson.com/products/images/headphones/1.jpg",
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
      price: 24.99,
      stock: 200,
      image: "https://cdn.dummyjson.com/products/images/mens-shirts/1.jpg",
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
      price: 59.99,
      stock: 150,
      image: "https://cdn.dummyjson.com/products/images/mens-shirts/2.jpg",
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
      price: 129.99,
      stock: 80,
      image: "https://cdn.dummyjson.com/products/images/mens-shirts/3.jpg",
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
      price: 299.99,
      stock: 40,
      image: "https://cdn.dummyjson.com/products/images/furniture/1.jpg",
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
      price: 499.99,
      stock: 25,
      image: "https://cdn.dummyjson.com/products/images/furniture/2.jpg",
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
      price: 18.99,
      stock: 300,
      image: "https://cdn.dummyjson.com/products/images/groceries/1.jpg",
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
      price: 12.99,
      stock: 250,
      image: "https://cdn.dummyjson.com/products/images/groceries/2.jpg",
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
      price: 34.99,
      stock: 120,
      image: "https://cdn.dummyjson.com/products/images/fragrances/1.jpg",
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
      price: 29.99,
      stock: 180,
      image: "https://cdn.dummyjson.com/products/images/sports-accessories/1.jpg",
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
      price: 199.99,
      stock: 30,
      image: "https://cdn.dummyjson.com/products/images/sports-accessories/2.jpg",
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
      minOrder: 20,
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
      value: 5,
      minOrder: 30,
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
