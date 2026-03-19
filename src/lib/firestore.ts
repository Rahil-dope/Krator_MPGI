import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { UserProfile, Event, Team, TeamMember, Registration, Organizer, ScheduleSlot, GlobalSettings } from "./types";
import { generateTeamCode } from "./utils";

// ─── USERS ────────────────────────────────────────────
export async function createUserProfile(uid: string, name: string, email: string, photoURL?: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid,
      name,
      email,
      photoURL: photoURL || "",
      createdAt: serverTimestamp(),
    });
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return { ...snap.data(), uid: snap.id } as UserProfile;
}

// ─── EVENTS ───────────────────────────────────────────
export async function getEvents(): Promise<Event[]> {
  const snap = await getDocs(collection(db, "events"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Event));
}

export async function getEvent(id: string): Promise<Event | null> {
  const snap = await getDoc(doc(db, "events", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Event;
}

export async function createEvent(event: Omit<Event, "id">) {
  return addDoc(collection(db, "events"), event);
}

export async function updateEvent(id: string, data: Partial<Event>) {
  return updateDoc(doc(db, "events", id), data);
}

export async function deleteEvent(id: string) {
  return deleteDoc(doc(db, "events", id));
}

// ─── TEAMS ────────────────────────────────────────────
export async function createTeam(
  eventId: string,
  eventName: string,
  teamName: string,
  leaderId: string,
  leaderEmail: string,
  leaderDetails: TeamMember
): Promise<Team> {
  let teamCode = generateTeamCode();

  // Ensure unique team code
  const existing = await getTeamByCode(teamCode);
  if (existing) {
    teamCode = generateTeamCode();
  }

  const teamData = {
    eventId,
    eventName,
    teamName,
    teamCode,
    leaderId,
    leaderEmail,
    members: [leaderDetails],
    isLocked: false,
    paymentStatus: "pending" as const,
    transactionId: "",
    paymentProofURL: "",
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "teams"), teamData);

  // Create registration record
  await addDoc(collection(db, "registrations"), {
    userId: leaderId,
    eventId,
    teamId: docRef.id,
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id, ...teamData, createdAt: new Date() };
}

export async function getTeamByCode(code: string): Promise<Team | null> {
  const q = query(collection(db, "teams"), where("teamCode", "==", code));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Team;
}

export async function getTeamById(id: string): Promise<Team | null> {
  const snap = await getDoc(doc(db, "teams", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Team;
}

export async function joinTeam(teamId: string, userId: string, memberDetails: TeamMember) {
  const teamRef = doc(db, "teams", teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) throw new Error("Team not found");

  const teamData = teamSnap.data() as Team;
  if (teamData.isLocked) throw new Error("Team is locked");

  // Check max team size
  const event = await getEvent(teamData.eventId);
  if (event && teamData.members.length >= event.maxTeamSize) {
    throw new Error("Team is full");
  }

  // Check duplicate
  const existingReg = await getUserEventRegistration(userId, teamData.eventId);
  if (existingReg) throw new Error("Already registered for this event");

  const updatedMembers = [...teamData.members, memberDetails];
  await updateDoc(teamRef, { members: updatedMembers });

  // Create registration record
  await addDoc(collection(db, "registrations"), {
    userId,
    eventId: teamData.eventId,
    teamId,
    createdAt: serverTimestamp(),
  });
}

export async function lockTeam(teamId: string) {
  return updateDoc(doc(db, "teams", teamId), { isLocked: true });
}

export async function getTeamsByEvent(eventId: string): Promise<Team[]> {
  const q = query(collection(db, "teams"), where("eventId", "==", eventId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Team));
}

export async function getAllTeams(): Promise<Team[]> {
  const snap = await getDocs(collection(db, "teams"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Team));
}

export async function updatePaymentStatus(teamId: string, status: "pending" | "approved" | "rejected") {
  return updateDoc(doc(db, "teams", teamId), { paymentStatus: status });
}

export async function markTeamCheckedIn(teamId: string, status: boolean) {
  return updateDoc(doc(db, "teams", teamId), { 
    checkedIn: status,
    checkedInAt: status ? serverTimestamp() : null
  });
}

// ─── BULK ACTIONS ─────────────────────────────────────
export async function bulkUpdatePaymentStatus(teamIds: string[], status: "pending" | "approved" | "rejected") {
  const batch = writeBatch(db);
  teamIds.forEach(id => {
    batch.update(doc(db, "teams", id), { paymentStatus: status });
  });
  return batch.commit();
}

export async function bulkMarkCheckedIn(teamIds: string[], status: boolean) {
  const batch = writeBatch(db);
  teamIds.forEach(id => {
    batch.update(doc(db, "teams", id), { 
      checkedIn: status,
      checkedInAt: status ? serverTimestamp() : null
    });
  });
  return batch.commit();
}

// ─── REGISTRATIONS ────────────────────────────────────
export async function getUserRegistrations(userId: string): Promise<Registration[]> {
  const q = query(collection(db, "registrations"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration));
}

export async function getUserEventRegistration(userId: string, eventId: string): Promise<Registration | null> {
  const q = query(
    collection(db, "registrations"),
    where("userId", "==", userId),
    where("eventId", "==", eventId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Registration;
}

// ─── PAYMENT ──────────────────────────────────────────
export async function uploadPaymentProof(teamId: string, file: File, transactionId: string) {
  const storageRef = ref(storage, `payments/${teamId}/${file.name}`);
  const uploadResult = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(uploadResult.ref);

  await updateDoc(doc(db, "teams", teamId), {
    paymentProofURL: url,
    transactionId,
    paymentStatus: "pending",
  });

  return url;
}

// ─── ORGANIZERS ───────────────────────────────────────
export async function getOrganizers(): Promise<Organizer[]> {
  const snap = await getDocs(collection(db, "organizers"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Organizer));
}

// ─── SCHEDULE ─────────────────────────────────────────
export async function getSchedule(): Promise<ScheduleSlot[]> {
  const snap = await getDocs(collection(db, "schedule"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleSlot));
}

// ─── SETTINGS ─────────────────────────────────────────
export async function getGlobalSettings(): Promise<GlobalSettings | null> {
  const snap = await getDoc(doc(db, "settings", "global"));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    registrationDeadline: data.registrationDeadline?.toDate() || null,
  } as GlobalSettings;
}

export async function updateGlobalSettings(settings: Partial<GlobalSettings>) {
  const { registrationDeadline, ...rest } = settings;
  const filtered: Record<string, unknown> = { ...rest };
  if (registrationDeadline) {
    filtered.registrationDeadline = Timestamp.fromDate(registrationDeadline);
  }
  return setDoc(doc(db, "settings", "global"), filtered, { merge: true });
}

export async function uploadUpiQR(file: File) {
  const storageRef = ref(storage, `settings/upiQR`);
  const uploadResult = await uploadBytes(storageRef, file);
  return getDownloadURL(uploadResult.ref);
}
