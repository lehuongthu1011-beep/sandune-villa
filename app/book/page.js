"use client";
import { useRouter } from "next/navigation";
import { BookingPageContent } from "@/components/sections/BookingPage";

export default function BookPage() {
  const router = useRouter();
  return <BookingPageContent onExit={() => router.push("/")} />;
}
