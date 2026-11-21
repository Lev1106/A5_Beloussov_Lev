import { Ban, Clock } from "lucide-react";
import type { Booking, Room } from "@/types";
import { minutesToDisplay } from "@/utils/time";

type Props = { room: Room | null; bookings: Booking[] };

export function BookingList({ room, bookings }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">
        Existing Bookings — {room?.name ?? "No room selected"}
        {room?.blocked && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600"><Ban className="h-3 w-3" /> Blocked</span>}
      </h3>
      {!room ? (
        <p className="text-sm text-slate-500">Choose a matching room to view its bookings.</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-slate-400">No bookings for this room today.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {[...bookings].sort((a, b) => a.start - b.start).map((booking) => (
            <li key={booking.id} className="flex items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">{booking.title}</p>
                <p className="text-xs text-slate-400">by {booking.bookedBy}</p>
              </div>
              <span className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600"><Clock className="h-3 w-3" />{minutesToDisplay(booking.start)} – {minutesToDisplay(booking.end)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
