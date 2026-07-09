import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Lead } from "@/lib/types";
import { SETTINGS_ID } from "@/lib/settings";

export const dynamic = "force-dynamic";

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function Home() {
  const { data: leads, error } = await getSupabaseAdmin()
    .from("leads")
    .select("*")
    .neq("id", SETTINGS_ID)
    .order("created_at", { ascending: false })
    .returns<Lead[]>();

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <div className="flex gap-3 text-sm">
          <Link
            href="/calendar"
            className="rounded border border-zinc-300 px-3 py-1.5 font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Calendar blocking →
          </Link>
          <Link
            href="/pipeline"
            className="rounded border border-zinc-300 px-3 py-1.5 font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Pipeline board →
          </Link>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-225 border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-300 text-left dark:border-zinc-700">
              <th className="whitespace-nowrap px-3 py-2 font-medium">Name</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">Email</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">Phone</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">Company</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">Revenue</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">Qualification</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">Appointment</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">Appointment time</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">Pipeline stage</th>
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-zinc-200 dark:border-zinc-800"
              >
                <td className="whitespace-nowrap px-3 py-2">
                  {lead.first_name} {lead.last_name}
                </td>
                <td className="whitespace-nowrap px-3 py-2">{lead.email}</td>
                <td className="whitespace-nowrap px-3 py-2">{lead.phone}</td>
                <td className="whitespace-nowrap px-3 py-2">{lead.company_name}</td>
                <td className="whitespace-nowrap px-3 py-2">{lead.revenue_range}</td>
                <td className="whitespace-nowrap px-3 py-2">{lead.qualification_status}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  {lead.appointment_booked ? "Booked" : "Not booked"}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  {formatDateTime(lead.appointment_datetime)}
                </td>
                <td className="whitespace-nowrap px-3 py-2">{lead.pipeline_stage}</td>
              </tr>
            ))}
            {leads?.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-zinc-500">
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
