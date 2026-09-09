import { Separator } from "@/components/ui/separator";
import { FaCcVisa, FaCcMastercard } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-orange-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-2xl font-bold">ClickCart</h2>
            <p className="text-sm text-muted-foreground mt-3">
              Trusted online shopping platform. Groceries, fashion, electronics
              and more.
            </p>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-3">Customer Service</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  className="hover:text-primary transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  href="/return"
                  className="hover:text-primary transition-colors"
                >
                  Return Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: support@clickcart.com</li>
              <li>Phone: +880 1234-567890</li>
              <li>Dhaka, Bangladesh</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Pay with</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <FaCcVisa className="w-8 h-8 text-blue-600" />
                <span>Visa</span>
              </li>
              <li className="flex items-center gap-2">
                <FaCcMastercard className="w-8 h-8 text-red-500" />
                <span>Mastercard</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded">
                  bKash
                </span>
                <span>bKash</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col items-center text-center text-sm text-muted-foreground gap-1">
          <p>&copy; {new Date().getFullYear()} ClickCart. All rights reserved.</p>
          <p>
            Designed and Developed by{" "}
            <span className="font-medium hover:text-primary transition-colors cursor-pointer">
              Royhed Mosarrof
            </span>
          </p>
          <p>BSc in CSE &bull; HSTU, Dinajpur, Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
