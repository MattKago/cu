"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PIPELINE_STAGES } from "@/lib/stages";

export async function updateLeadStage(
  leadId: string,
  newStage: string,
  closedAmount?: number
) {
  if (!PIPELINE_STAGES.includes(newStage as (typeof PIPELINE_STAGES)[number])) {
    throw new Error(`Invalid stage: ${newStage}`);
  }

  const update: {
    pipeline_stage: string;
    closed_amount?: number;
  } = { pipeline_stage: newStage };

  if (newStage === "Closed" && typeof closedAmount === "number" && !Number.isNaN(closedAmount)) {
    update.closed_amount = closedAmount;
  }

  const { error } = await getSupabaseAdmin()
    .from("leads")
    .update(update)
    .eq("id", leadId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/pipeline");
}
