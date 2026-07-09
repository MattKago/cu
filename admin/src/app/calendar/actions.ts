"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { SETTINGS_ID } from "@/lib/settings";

export async function saveBlockedSlots(slots: string[]) {
  // Normalize to unique ISO strings.
  const unique = Array.from(new Set(slots));

  const { error } = await getSupabaseAdmin()
    .from("leads")
    .update({ metadata: { blocked_slots: unique } })
    .eq("id", SETTINGS_ID);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/calendar");
}
