export interface Notice {
    id: string;
    title: string;
    content: string;
    summary?: string;
    category: "official" | "event" | "exam" | "sports" | "cultural";
    createdAt: Date; // or Firestore Timestamp
    authorId: string;
    priority: "low" | "medium" | "high";
}

export interface UserProfile {
    uid: string;
    email: string;
    role: "student" | "faculty" | "admin";
    createdAt: Date;
}

export interface LostItem {
    id: string;
    title: string;
    description: string;
    category: "electronics" | "clothing" | "books" | "other";
    type: "lost" | "found";
    imageUrl?: string;
    location: string;
    date: Date;
    contactEmail: string;
    contactPhone?: string;
    status: "open" | "resolved";
    createdAt: Date;
    authorId: string;
}

export interface Issue {
    id: string;
    title: string;
    description: string;
    category: "infrastructure" | "academic" | "hostel" | "other";
    status: "open" | "in-progress" | "resolved";
    priority: "low" | "medium" | "high";
    reportedBy: string; // uid
    reportedByEmail: string;
    createdAt: Date;
    updatedAt: Date;
}
