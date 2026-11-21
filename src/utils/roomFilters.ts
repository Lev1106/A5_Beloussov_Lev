import type { Booking, Room } from "@/types";

/** F1/F2: match on capacity and every required item; blocked is an availability rule (F3). */
export function filterRooms(
  rooms: readonly Room[],
  attendees: number,
  requiredEquipment: readonly string[]
): Room[] {
  if (!Number.isInteger(attendees) || attendees < 1) return [];
  return rooms.filter((room) =>
    room.capacity >= attendees &&
    requiredEquipment.every((item) => room.equipment.includes(item))
  );
}

/** Never retain a selection that was filtered out. */
export function resolveSelectedRoomId(
  matches: readonly Room[],
  selectedId: string | null
): string | null {
  return matches.find((room) => room.id === selectedId)?.id ?? matches[0]?.id ?? null;
}

/** Always display only the chosen room's bookings, in a separate array (AC5). */
export function getBookingsForRoom(
  bookings: readonly Booking[],
  roomId: string | null
): Booking[] {
  if (!roomId) return [];
  return bookings.filter((booking) => booking.roomId === roomId);
}
