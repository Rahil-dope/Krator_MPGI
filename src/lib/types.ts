export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  category: "tech" | "gaming" | "creative" | "hardware";
  minTeamSize: number;
  maxTeamSize: number;
  isActive: boolean;
  icon?: string;
  rules?: string[];
  prize?: string;
  venue?: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
}

export interface TeamMember {
  uid?: string;
  name: string;
  college: string;
  branch: string;
  year: string;
  phone: string;
  email?: string;
}

export interface Team {
  id: string;
  eventId: string;
  eventName?: string;
  teamName: string;
  teamCode: string;
  leaderId: string;
  leaderEmail: string;
  members: TeamMember[];
  isLocked: boolean;
  paymentStatus: "pending" | "approved" | "rejected";
  transactionId?: string;
  paymentProofURL?: string;
  checkedIn?: boolean;
  checkedInAt?: Date;
  createdAt: Date;
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  teamId: string;
  createdAt: Date;
}

export interface Organizer {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  photoURL?: string;
}

export interface ScheduleSlot {
  id: string;
  day: 1 | 2;
  time: string;
  eventName: string;
  venue?: string;
  description?: string;
}

export interface GlobalSettings {
  id?: string;
  registrationOpen: boolean;
  registrationDeadline: Date | null;
  upiId: string;
  upiQR: string;
}
