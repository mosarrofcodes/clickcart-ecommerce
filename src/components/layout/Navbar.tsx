"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Search, User, Menu, Heart, X, LogOut, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore, selectCartCount } from "@/store/cart";
import { useWishlistStore, selectWishlistCount } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import SearchBar from "@/components/search/SearchBar";
import NotificationBell from "@/components/layout/NotificationBell";
import MobileNotificationsLink from "@/components/layout/MobileNotificationsLink";
import { type FormEvent, useState } from "react";

export default function Navbar() {
  const cartItems = useCartStore((s) => s.items);
  const cartCount = selectCartCount(cartItems);
  const wishlistItems = useWishlistStore((s) => s.items);
  const wishlistCount = selectWishlistCount(wishlistItems);
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const menuOpen = useUIStore((s) => s.mobileMenuOpen);
  const searchOpen = useUIStore((s) => s.searchOpen);
  const setMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/categories", label: "Categories" },
    { href: "/offers", label: "Offers" },
  ];

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${searchQuery}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <nav className="border-b bg-orange-50 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-primary" />
            <span className="text-2xl font-bold text-primary">ClickCart</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive(link.href)
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-muted-foreground hover:text-primary transition-colors"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <div className="flex items-center gap-2 w-64 md:w-80">
              <SearchBar
                autoFocus
                onClose={() => setSearchOpen(false)}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setSearchOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex flex-col items-center h-auto py-1"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
                <span className="text-xs">Search</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex flex-col items-center h-auto py-1"
              >
                <Link href="/wishlist" className="relative flex flex-col items-center">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs">
                      {wishlistCount}
                    </Badge>
                  )}
                  <span className="text-xs">Wishlist</span>
                </Link>
              </Button>

              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex flex-col items-center h-auto py-1"
                >
                  <Link href="/admin" className="flex flex-col items-center">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs">Admin</span>
                  </Link>
                </Button>
              )}

              {session ? (
                <div className="hidden md:flex items-center gap-2">
                  <NotificationBell />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex flex-col items-center h-auto py-1"
                  >
                    <Link href="/profile" className="flex flex-col items-center">
                      <User className="w-5 h-5" />
                      <span className="text-xs">{session.user?.name?.split(" ")[0] || "Account"}</span>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex flex-col items-center h-auto py-1"
                    onClick={() => signOut()}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-xs">Sign Out</span>
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex flex-col items-center h-auto py-1"
                >
                  <Link href="/signin" className="flex flex-col items-center">
                    <User className="w-5 h-5" />
                    <span className="text-xs">Account</span>
                  </Link>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col items-center h-auto py-1"
              >
                <Link
                  href="/cart"
                  className="relative flex flex-col items-center"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs">
                      {cartCount}
                    </Badge>
                  )}
                  <span className="text-xs">Cart</span>
                </Link>
              </Button>
            </>
          )}

          {/* Hamburger — mobile only */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t mt-4 pt-4 flex flex-col gap-4 px-2">
          {/* Nav Links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={
                isActive(link.href)
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-primary transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="border-t pt-4 flex flex-col gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" variant="ghost">
                <Search className="w-5 h-5" />
              </Button>
            </form>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span>Wishlist</span>
            </Link>

            <MobileNotificationsLink />

            {/* Account */}
            {session ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>{session.user?.name || "Profile"}</span>
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/signin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Account</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
