import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const img = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${w}&h=${h}&auto=format&fit=crop`;

const products: Record<string, string> = {
  "ELEC-001": img("1592750475338-74b7b21085ab", 800, 600),
  "ELEC-002": img("1610945265064-0e34e5519bbf", 800, 600),
  "ELEC-003": img("1517336714731-489689fd1ca8", 800, 600),
  "ELEC-004": img("1505740420928-5e560c06d30e", 800, 600),
  "CLO-001": img("1521572163474-6864f9cf17ab", 800, 600),
  "CLO-002": img("1542272604-787c3835535d", 800, 600),
  "CLO-003": img("1544022613-e87ca75a784a", 800, 600),
  "FUR-001": img("1592078615290-033ee584e267", 800, 600),
  "FUR-002": img("1612815154858-60aa4c59eaa6", 800, 600),
  "GRO-001": img("1447933601403-0c6688de566e", 800, 600),
  "GRO-002": img("1474979266404-7eaacbcd87c5", 800, 600),
  "BEA-001": img("1620916566398-39f1143ab7be", 800, 600),
  "SPO-001": img("1544367567-0f2fcb009e0b", 800, 600),
  "SPO-002": img("1517836357463-d25dfeac3438", 800, 600),
};

const categories: Record<string, string> = {
  electronics: img("1518770660439-4636190af475", 800, 400),
  clothing: img("1441986300917-64674bd600d8", 800, 400),
  furniture: img("1493663284031-b7e3aefcae8e", 800, 400),
  groceries: img("1542838132-92c53300491e", 800, 400),
  beauty: img("1596462502278-27bfdc403348", 800, 400),
  "sports-accessories": img("1461896836934-ffe607ba8211", 800, 400),
};

async function main() {
  let updated = 0;

  for (const [sku, image] of Object.entries(products)) {
    const res = await prisma.product.updateMany({ where: { sku }, data: { image } });
    updated += res.count;
    console.log(`Product ${sku}: ${res.count} row(s) updated`);
  }

  for (const [slug, image] of Object.entries(categories)) {
    const res = await prisma.category.updateMany({ where: { slug }, data: { image } });
    updated += res.count;
    console.log(`Category ${slug}: ${res.count} row(s) updated`);
  }

  console.log(`\nDone. ${updated} row(s) updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });