import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    query,
    orderBy,
    Timestamp
} from "firebase/firestore";

export interface Member {
    userId: string;
    name: string;
    avatar?: string;
    status: 'pending' | 'approved';
}

export interface Club {
    id: string;
    name: string;
    description: string;
    posterUrl: string; // URL to a large poster image
    creatorId: string; // The specific student who administers this club
    members: Member[];
    category: 'Tech' | 'Cultural' | 'Sports' | 'Academic' | 'Other';
    createdAt?: any;
}

export interface ClubEvent {
    id: string;
    clubId: string;
    title: string;
    date: string; // ISO string
    location: string;
    description: string;
}

// FIRESTORE HELPERS

export const getClubsData = async (): Promise<Club[]> => {
    try {
        const q = query(collection(db, "clubs"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Club[];
    } catch (error) {
        console.error("Error fetching clubs:", error);
        return [];
    }
};

export const createClubData = async (club: Omit<Club, 'id'>) => {
    return await addDoc(collection(db, "clubs"), {
        ...club,
        createdAt: Timestamp.now()
    });
};

export const updateClubMembersData = async (clubId: string, members: Member[]) => {
    const clubRef = doc(db, "clubs", clubId);
    return await updateDoc(clubRef, { members });
};

export const getEventsData = async (): Promise<ClubEvent[]> => {
    try {
        const snapshot = await getDocs(collection(db, "events"));
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ClubEvent[];
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
};

// Helper: Current user ID for simulation
export const CURRENT_USER_ID = 'user-1';

export const MOCK_CLUBS: Club[] = [];

export const MOCK_EVENTS: ClubEvent[] = [];
