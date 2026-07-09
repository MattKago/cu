"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const START_HOUR = 9;
const END_HOUR = 17;
const DAY_COUNT = 7;

function buildDays() {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = 0; d < DAY_COUNT; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);

    const slots = [];
    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      const slot = new Date(date);
      slot.setHours(hour, 0, 0, 0);
      slots.push(slot);
    }
    days.push({ date, slots });
  }
  return days;
}

function formatDay(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BookingPicker() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get("id");
  const days = useMemo(buildDays, []);

  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.rpc("get_blocked_slots").then(({ data }) => {
      if (Array.isArray(data)) {
        setBlockedSlots(new Set(data as string[]));
      }
    });
  }, []);

  if (!leadId) {
    return <p className="text-sm text-red-600">Missing lead id in the URL.</p>;
  }

  if (confirmed && selectedSlot) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">You&apos;re booked!</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {formatDay(selectedSlot)} at {formatTime(selectedSlot)}
        </p>
      </div>
    );
  }

  async function handleConfirm() {
    if (!selectedSlot || !leadId) return;
    setSubmitting(true);
    setError(null);

    const { error: rpcError } = await supabase.rpc("book_appointment", {
      p_lead_id: leadId,
      p_appointment_datetime: selectedSlot.toISOString(),
    });

    if (rpcError) {
      setError(rpcError.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setConfirmed(true);
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-center text-2xl font-semibold">Pick a time</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {days.map((day) => {
          const availableSlots = day.slots.filter(
            (slot) => !blockedSlots.has(slot.toISOString())
          );
          return (
          <div key={day.date.toISOString()} className="flex flex-col gap-2">
            <p className="text-sm font-medium">{formatDay(day.date)}</p>
            <div className="flex flex-col gap-1">
              {availableSlots.length === 0 && (
                <p className="text-xs text-zinc-400">No times</p>
              )}
              {availableSlots.map((slot) => {
                const isSelected =
                  selectedSlot?.getTime() === slot.getTime();
                return (
                  <button
                    key={slot.toISOString()}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded border px-2 py-1 text-sm ${
                      isSelected
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    {formatTime(slot)}
                  </button>
                );
              })}
            </div>
          </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={!selectedSlot || submitting}
        onClick={handleConfirm}
        className="self-center rounded bg-black px-6 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {submitting
          ? "Confirming…"
          : selectedSlot
          ? `Confirm ${formatDay(selectedSlot)} at ${formatTime(selectedSlot)}`
          : "Select a time"}
      </button>
    </div>
  );
}
