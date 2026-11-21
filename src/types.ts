export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  start: number; // minutes from midnight (0–1440)
  end: number;
  title: string;
  bookedBy: string;
}

export type CheckResult =
  | { status: "available" }
  | { status: "unavailable"; reason: string };
