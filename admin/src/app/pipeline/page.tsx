import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Lead } from "@/lib/types";
import PipelineBoard from "@/components/PipelineBoard";
import { SETTINGS_ID } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const { data: leads, error } = await getSupabaseAdmin()
    .from("leads")
    .select("*")
    .neq("id", SETTINGS_ID)
    .order("created_at", { ascending: false })
    .returns<Lead[]>();

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pipeline</h1>
        <Link href="/" className="text-sm underline">
          ← Leads table
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <PipelineBoard initialLeads={leads ?? []} />
    </main>
  );
}
