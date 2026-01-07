"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    userData: any | null;
    loading: boolean;
    logout: () => Promise<void>;
    updateUserData: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    logout: async () => { },
    updateUserData: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let unsubscribeDoc: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
            console.log("Auth State Changed:", authUser ? "User Logged In" : "No User");

            if (unsubscribeDoc) {
                unsubscribeDoc();
                unsubscribeDoc = null;
            }

            if (authUser) {
                setUser(authUser);
                const docRef = doc(db, "users", authUser.uid);

                // Use onSnapshot for real-time updates and to avoid race conditions during signup
                unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        console.log("Profile update received:", docSnap.data().role);
                        setUserData({ ...docSnap.data(), uid: authUser.uid });
                        setLoading(false);
                    } else {
                        // If document doesn't exist yet, we don't auto-create with "student" role
                        // to avoid overwriting the signup chosen role. 
                        // We set basic data but keep role undefined until it appears or is set.
                        console.log("Profile document not found yet...");
                        setUserData(null);
                        // We still set loading to false to allow the dashboard to render (it will handle null userData)
                        setLoading(false);
                    }
                }, (error) => {
                    console.error("Firestore Snapshot Error:", error);
                    setLoading(false);
                });
            } else {
                setUser(null);
                setUserData(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const updateUserData = async (newData: any) => {
        if (!user) return;
        try {
            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, { ...userData, ...newData }, { merge: true });
            setUserData((prev: any) => ({ ...prev, ...newData }));
        } catch (error) {
            console.error("Update User Data Error:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, logout, updateUserData }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
