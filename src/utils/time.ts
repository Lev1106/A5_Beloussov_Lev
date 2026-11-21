import type { Booking, CheckResult, Room } from "@/types";

/** "14:30" → 870 */
export function timeStringToMinutes(time: string): number {
  // Reject malformed clock strings rather than normalizing them (e.g. 13:99).
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$|^24:00$/.test(time)) return NaN;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** 870 → "14:30" */
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** 870 → "2:30 PM" */
export function minutesToDisplay(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/**
 * Core availability check implementing AC1–AC5.
 * Does NOT mutate bookings — purely read-only (AC5).
 */
export function checkAvailability(
  room: Room,
  startMin: number,
  endMin: number,
  currentMin: number,
  bookings: Booking[]
): CheckResult {
  // AC1: times must be whole minutes (no NaN, no fractions) within 0–1440
  if (!Number.isInteger(startMin) || !Number.isInteger(endMin)) {
    return { status: "unavailable", reason: "Times must be whole minutes (no fractional minutes)." };
  }
  if (startMin < 0 || endMin > 1440) {
    return { status: "unavailable", reason: "Times must be between 00:00 and 24:00." };
  }
  if (startMin >= endMin) {
    return { status: "unavailable", reason: "Start time must be earlier than end time." };
  }
  if (startMin <= currentMin) {
    return {
      status: "unavailable",
      reason: `Start time must be after the current time (${minutesToDisplay(currentMin)}).`,
    };
  }

  // AC2: reject bookings longer than 120 minutes
  const duration = endMin - startMin;
  if (duration > 120) {
    return {
      status: "unavailable",
      reason: `Requested duration is ${formatDuration(duration)}. Maximum allowed is 2 hours (120 min).`,
    };
  }

  // AC3: reject if room is blocked
  if (room.blocked) {
    return {
      status: "unavailable",
      reason: "This room is currently blocked and unavailable for booking.",
    };
  }

  // AC4: reject overlapping intervals (touching endpoints are allowed)
  const roomBookings = bookings.filter((b) => b.roomId === room.id);
  const conflict = roomBookings.find(
    (b) => startMin < b.end && endMin > b.start
  );
  if (conflict) {
    return {
      status: "unavailable",
      reason: `Overlaps with "${conflict.title}" (${minutesToDisplay(conflict.start)} – ${minutesToDisplay(conflict.end)}).`,
    };
  }

  // All checks pass
  return { status: "available" };
}
