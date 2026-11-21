import type { Room } from "@/types";
import { Ban, Building2, DoorClosed, Users } from "lucide-react";

type Props = {
  attendees: string;
  equipmentOptions: string[];
  requiredEquipment: string[];
  matchingRooms: Room[];
  selectedRoomId: string | null;
  onAttendeesChange: (value: string) => void;
  onEquipmentChange: (item: string, checked: boolean) => void;
  onRoomChange: (id: string) => void;
};

/** Presentation-only inputs and selectable room cards; no filtering or booking rules. */
export function RoomFilters({
  attendees, equipmentOptions, requiredEquipment, matchingRooms,
  selectedRoomId, onAttendeesChange, onEquipmentChange, onRoomChange,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 p-3">
        <label htmlFor="attendees" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Required attendees
        </label>
        <input
          id="attendees" aria-label="Required attendees" type="number" min="1" step="1"
          value={attendees} onChange={(e) => onAttendeesChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mb-1 mt-3 text-sm font-semibold text-slate-700">Required equipment (all selected items)</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {equipmentOptions.map((item) => (
            <label key={item} className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
              <input type="checkbox" checked={requiredEquipment.includes(item)}
                onChange={(e) => onEquipmentChange(item, e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              {item}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-1.5 text-sm font-semibold text-slate-700">Select Room</h2>
        <p className="mb-2 text-xs text-slate-500">{matchingRooms.length} matching rooms</p>
        {matchingRooms.length === 0 ? (
          <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            No rooms match your capacity and equipment requirements. Adjust the filters.
          </p>
        ) : (
          <div className="space-y-2">
            {matchingRooms.map((room) => {
              const isSelected = room.id === selectedRoomId;
              return (
                <button key={room.id} type="button" aria-pressed={isSelected}
                  onClick={() => onRoomChange(room.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border p-3 text-left transition-all ${
                    isSelected ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <DoorClosed className={`h-5 w-5 flex-shrink-0 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{room.name}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-500"><Building2 className="h-3 w-3" />{room.building}</p>
                      <p className="mt-1 text-xs text-slate-500">{room.equipment.join(", ")}</p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"><Users className="h-3 w-3" />{room.capacity}</span>
                    {room.blocked && <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600"><Ban className="h-3 w-3" />Blocked</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
