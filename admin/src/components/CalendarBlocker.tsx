"use client";

import { useMemo, useState, useTransition } from "react";
import { saveBlockedSlots } from "@/app/calendar/actions";

const START_HOUR = 9;
const END_HOUR = 17;
const DAY_COUNT = 7;

// Must match lead-form's booking picker slot generation.
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

export default function CalendarBlocker({
  initialBlocked,
}: {
  initialBlocked: string[];
}) {
  const days = useMemo(buildDays, []);
  const [blocked, setBlocked] = useState<Set<string>>(
    () => new Set(initialBlocked)
  );
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(iso: string) {
    setBlocked((prev) => {
      const next = new Set(prev);
      if (next.has(iso)) {
        next.delete(iso);
      } else {
        next.add(iso);
      }
      return next;
    });
    setSavedAt(null);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await saveBlockedSlots(Array.from(blocked));
        setSavedAt(new Date().toLocaleTimeString());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {days.map((day) => (
          <div key={day.date.toISOString()} className="flex flex-col gap-2">
            <p className="text-sm font-medium">{formatDay(day.date)}</p>
            <div className="flex flex-col gap-1">
              {day.slots.map((slot) => {
                const iso = slot.toISOString();
                const isBlocked = blocked.has(iso);
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => toggle(iso)}
                    className={`rounded border px-2 py-1 text-sm ${
                      isBlocked
                        ? "border-red-500 bg-red-500 text-white line-through"
                        : "border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    {formatTime(slot)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="self-start rounded bg-black px-6 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {isPending ? "Saving…" : "Save blocked slots"}
        </button>
        {savedAt && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Saved at {savedAt}
          </span>
        )}
        <span className="text-sm text-zinc-500">
          {blocked.size} slot{blocked.size === 1 ? "" : "s"} blocked
        </span>
      </div>
    </div>
  );
}
