import { useMemo, useState } from "react";
import { CalendarCheck, Clock, Search } from "lucide-react";
import type { CheckResult } from "@/types";
import { sampleRooms, sampleBookings } from "@/data/sampleData";
import { checkAvailability, timeStringToMinutes, minutesToDisplay } from "@/utils/time";
import { filterRooms, getBookingsForRoom, resolveSelectedRoomId } from "@/utils/roomFilters";
import { Timeline } from "@/components/Timeline";
import { ResultBanner } from "@/components/ResultBanner";
import { RoomFilters } from "@/components/RoomFilters";
import { BookingList } from "@/components/BookingList";

/** Fictional current time from the A3 demo: 10:15 AM. */
const CURRENT_MINUTE = 10 * 60 + 15;
function getCurrentMinute(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export default function App() {
  const [attendeesInput, setAttendeesInput] = useState("1");
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>("r1");
  const [startTime, setStartTime] = useState("13:00");
  const [endTime, setEndTime] = useState("14:00");
  const [useLiveTime, setUseLiveTime] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const equipmentOptions = useMemo(() =>
    Array.from(new Set(sampleRooms.flatMap((room) => room.equipment))).sort(), []);
  const matchingRooms = useMemo(() =>
    filterRooms(sampleRooms, Number(attendeesInput), requiredEquipment),
    [attendeesInput, requiredEquipment]);
  const activeId = resolveSelectedRoomId(matchingRooms, selectedRoomId);
  const selectedRoom = matchingRooms.find((room) => room.id === activeId) ?? null;
  const roomBookings = getBookingsForRoom(sampleBookings, activeId);
  const currentMin = useLiveTime ? getCurrentMinute() : CURRENT_MINUTE;

  const candidateStart = useMemo(() => {
    const value = timeStringToMinutes(startTime);
    return Number.isInteger(value) ? value : null;
  }, [startTime]);
  const candidateEnd = useMemo(() => {
    const value = timeStringToMinutes(endTime);
    return Number.isInteger(value) ? value : null;
  }, [endTime]);

  const clearResult = () => setResult(null);
  const changeAttendees = (value: string) => {
    setAttendeesInput(value);
    const matches = filterRooms(sampleRooms, Number(value), requiredEquipment);
    setSelectedRoomId(resolveSelectedRoomId(matches, selectedRoomId));
    clearResult();
  };
  const changeEquipment = (item: string, checked: boolean) => {
    const next = checked
      ? [...requiredEquipment, item]
      : requiredEquipment.filter((existing) => existing !== item);
    setRequiredEquipment(next);
    const matches = filterRooms(sampleRooms, Number(attendeesInput), next);
    setSelectedRoomId(resolveSelectedRoomId(matches, selectedRoomId));
    clearResult();
  };
  const changeRoom = (id: string) => {
    setSelectedRoomId(id);
    clearResult();
  };
  const handleCheck = () => {
    if (!selectedRoom) {
      setResult({ status: "unavailable", reason: "No room matches the selected requirements." });
    } else if (candidateStart == null || candidateEnd == null) {
      setResult({ status: "unavailable", reason: "Please enter valid start and end times." });
    } else {
      setResult(checkAvailability(selectedRoom, candidateStart, candidateEnd, currentMin, sampleBookings));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 sm:text-xl">Smart Campus Room Availability</h1>
            <p className="text-xs text-slate-500 sm:text-sm">Check whether a room is free for your desired time slot.</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-800"><Clock className="h-4 w-4" />Current time</div>
              <span className="text-sm font-bold text-blue-900">{minutesToDisplay(currentMin)}</span>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500">
              <input type="checkbox" checked={useLiveTime} onChange={(e) => {
                setUseLiveTime(e.target.checked); clearResult();
              }} className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Use my device's actual time
            </label>
            <RoomFilters attendees={attendeesInput} equipmentOptions={equipmentOptions}
              requiredEquipment={requiredEquipment} matchingRooms={matchingRooms}
              selectedRoomId={activeId} onAttendeesChange={changeAttendees}
              onEquipmentChange={changeEquipment} onRoomChange={changeRoom} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="start-time" className="mb-1.5 block text-sm font-semibold text-slate-700">Start time</label>
                <input id="start-time" type="time" value={startTime} onChange={(e) => {
                  setStartTime(e.target.value); clearResult();
                }} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="end-time" className="mb-1.5 block text-sm font-semibold text-slate-700">End time</label>
                <input id="end-time" type="time" value={endTime} onChange={(e) => {
                  setEndTime(e.target.value); clearResult();
                }} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            <button type="button" onClick={handleCheck} disabled={!selectedRoom}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400">
              <Search className="h-4 w-4" />Check Availability
            </button>
          </div>
          <div className="space-y-4">
            {selectedRoom && <ResultBanner result={result}
              candidateStart={candidateStart} candidateEnd={candidateEnd} />}
            <Timeline bookings={roomBookings} candidateStart={selectedRoom ? candidateStart : null}
              candidateEnd={selectedRoom ? candidateEnd : null} candidateAvailable={result?.status === "available"} />
            <BookingList room={selectedRoom} bookings={roomBookings} />
          </div>
        </div>
        <p className="px-1 text-center text-xs text-slate-400">
          Fictional sample data for demonstration. No booking data is modified — this tool is read-only.
        </p>
      </main>
    </div>
  );
}
