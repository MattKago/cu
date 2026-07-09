import { Suspense } from "react";
import BookingPicker from "@/components/BookingPicker";

export default function BookPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <Suspense fallback={<p>Loading…</p>}>
        <BookingPicker />
      </Suspense>
    </main>
  );
}
