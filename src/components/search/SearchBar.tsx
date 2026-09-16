"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Loader2, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types";

const RECENT_KEY = "clickcart-recent-searches";

interface SearchBarProps {
  onClose?: () => void;
  autoFocus?: boolean;
}

export default function SearchBar({ onClose, autoFocus }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
    } catch {
      return [];
    }
  });
  const boxRef = useRef<HTMLDivElement>(null);

  function saveRecent(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recent.filter((r) => r !== trimmed)].slice(0, 5);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function submit(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    saveRecent(trimmed);
    setOpen(false);
    setQuery("");
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    onClose?.();
  }

  useEffect(() => {
    let cancelled = false;
    const term = query.trim();
    if (term.length < 2) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(term)}&limit=5`);
        const data = await res.json();
        if (!cancelled && res.ok && Array.isArray(data.products)) {
          setSuggestions(data.products as Product[]);
          setOpen(true);
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    if (value.trim().length < 2) setSuggestions([]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        setOpen(false);
        setQuery("");
        router.push(`/product/${suggestions[selectedIndex].id}`);
        onClose?.();
      } else {
        submit(query);
      }
    }
    if (e.key === "Escape") {
      setOpen(false);
      onClose?.();
    }
    if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    }
    if (e.key === "ArrowUp" && suggestions.length > 0) {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    }
  }

  return (
    <div ref={boxRef} className="relative flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            autoFocus={autoFocus}
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={handleChange}
            onFocus={() => {
              if (query.trim().length >= 2 || recent.length > 0) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className="pl-9"
            role="combobox"
            aria-expanded={open}
            aria-controls="search-suggestions"
          />
        </div>
        <Button type="button" className="hidden sm:inline-flex" onClick={() => submit(query)}>
          Search
        </Button>
      </div>

      {open && (
        <div
          id="search-suggestions"
          className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-md overflow-hidden z-50"
        >
          {query.trim().length < 2 ? (
            recent.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1 text-xs uppercase text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recent searches
                </p>
                {recent.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted"
                    onClick={() => submit(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            )
          ) : loading ? (
            <div className="p-4 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : suggestions.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No matches found.</p>
          ) : (
            <div className="p-2">
              <p className="px-2 py-1 text-xs uppercase text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Suggestions
              </p>
              {suggestions.map((product, i) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className={`flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-muted transition-colors ${
                    i === selectedIndex ? "bg-muted" : ""
                  }`}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                    onClose?.();
                  }}
                >
                  <Image
                    src={product.image}
                    alt=""
                    width={32}
                    height={32}
                    className="w-8 h-8 object-cover rounded"
                  />
                  <span className="flex-1 text-sm truncate">{product.title}</span>
                  <span className="text-sm font-medium">${product.price}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}