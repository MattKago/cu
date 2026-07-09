import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { SETTINGS_ID } from "@/lib/settings";
import CalendarBlocker from "@/components/CalendarBlocker";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const { data, error } = await getSupabaseAdmin()
    .from("leads")
    .select("metadata")
    .eq("id", SETTINGS_ID)
    .single();

  const blockedSlots: string[] =
    (data?.metadata as { blocked_slots?: string[] })?.blocked_slots ?? [];

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Calendar blocking</h1>
        <Link href="/" className="text-sm underline">
          ← Leads table
        </Link>
      </div>

      <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        Click a slot to block it. Blocked slots are excluded from the public
        booking calendar and cannot be booked.
      </p>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <CalendarBlocker initialBlocked={blockedSlots} />
    </main>
  );
}
