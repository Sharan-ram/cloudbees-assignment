"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname(); // ✅ Get current route

  return (
    <nav className="py-4 text-right">
      <Link
        href="/"
        className={`px-4 ${
          pathname === "/"
            ? "text-gray-900 font-bold"
            : "text-gray-500 hover:text-gray-900"
        }`}
      >
        Idea List
      </Link>
      <span className="mx-4">|</span>
      <Link
        href="/idea"
        className={`px-4 ${
          pathname === "/idea"
            ? "text-gray-900 font-bold"
            : "text-gray-500 hover:text-gray-900"
        }`}
      >
        Submit Idea
      </Link>
    </nav>
  );
}
