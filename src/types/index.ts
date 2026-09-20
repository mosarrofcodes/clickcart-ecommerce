export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  price: number;
  stock: number;
  sku: string | null;
  image: string | null;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  image: string;
  brand: string | null;
  rating: number;
  sku: string;
  weight: number | null;
  tags: string[];
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: ProductCategory;
  variants?: ProductVariant[];
  _count?: { reviews?: number };
}

export interface CartItem extends Product {
  quantity: number;
  variant?: ProductVariant | null;
}

export interface CartItemIdentity {
  productId: string;
  variantId?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  zipCode: string | null;
  isDefault: boolean;
}

export type CouponType = "PERCENT" | "FIXED" | "FREESHIP";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  active: boolean;
  onePerUser: boolean;
  usageLimit: number | null;
  timesUsed: number;
  validFrom: Date | null;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}