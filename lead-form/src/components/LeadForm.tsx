"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const REVENUE_OPTIONS = [
  "Under $50,000",
  "$50k–$100k",
  "$100k–$500k",
  "$500k–$1M",
  "Over $1M",
];

const initialForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  companyName: "",
  revenueRange: REVENUE_OPTIONS[0],
};

export default function LeadForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const qualificationStatus =
      form.revenueRange === "Under $50,000" ? "disqualified" : "qualified";
    const id = crypto.randomUUID();

    const { error: insertError } = await supabase.from("leads").insert({
      id,
      first_name: form.firstName,
      last_name: form.lastName,
      phone: form.phone,
      email: form.email,
      company_name: form.companyName,
      revenue_range: form.revenueRange,
      qualification_status: qualificationStatus,
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    if (qualificationStatus === "disqualified") {
      router.push("/thank-you");
    } else {
      router.push(`/book?id=${id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="firstName" className="text-sm font-medium">
          First name
        </label>
        <input
          id="firstName"
          name="firstName"
          required
          value={form.firstName}
          onChange={handleChange}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="lastName" className="text-sm font-medium">
          Last name
        </label>
        <input
          id="lastName"
          name="lastName"
          required
          value={form.lastName}
          onChange={handleChange}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          value={form.phone}
          onChange={handleChange}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="companyName" className="text-sm font-medium">
          Company name
        </label>
        <input
          id="companyName"
          name="companyName"
          required
          value={form.companyName}
          onChange={handleChange}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="revenueRange" className="text-sm font-medium">
          Annual revenue
        </label>
        <select
          id="revenueRange"
          name="revenueRange"
          value={form.revenueRange}
          onChange={handleChange}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {REVENUE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
