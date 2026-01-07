"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { User, LogOut, Save, Loader2, Shield, UserCircle, GraduationCap } from "lucide-react";

export default function ProfileDialog() {
    const { userData, updateUserData, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        srn: "",
        department: "",
        course: "",
        year: "",
        semester: "",
        fullName: "",
        role: "student",
    });

    // Keep form in sync with userData when it loads or changes
    useEffect(() => {
        if (userData) {
            setFormData({
                srn: userData.srn || "",
                department: userData.department || "",
                course: userData.course || "",
                year: userData.year || "",
                semester: userData.semester || "",
                fullName: userData.fullName || "",
                role: userData.role || "student",
            });
        }
    }, [userData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserData(formData);
            setOpen(false);
        } catch (error) {
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>User Profile</DialogTitle>
                        {userData?.role && (
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${userData.role === 'admin' ? 'bg-red-100 text-red-700' :
                                userData.role === 'faculty' ? 'bg-blue-100 text-blue-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                {userData.role === 'admin' && <Shield className="h-3 w-3" />}
                                {userData.role === 'faculty' && <GraduationCap className="h-3 w-3" />}
                                {userData.role === 'student' && <UserCircle className="h-3 w-3" />}
                                {userData.role}
                            </div>
                        )}
                    </div>
                    <DialogDescription>
                        Update your academic details here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="Your Name"
                            required
                        />
                    </div>
                    {formData.role === 'student' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">SRN</label>
                                <input
                                    name="srn"
                                    value={formData.srn}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    placeholder="PES1..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Department</label>
                                <input
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    placeholder="CSE, ECE, etc."
                                />
                            </div>
                        </div>
                    )}
                    {formData.role === 'faculty' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Department</label>
                            <input
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="CSE, ECE, etc."
                            />
                        </div>
                    )}
                    {formData.role === 'student' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Course</label>
                                <input
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    placeholder="B.Tech, MBA, etc."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Year</label>
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Semester</label>
                                    <select
                                        name="semester"
                                        value={formData.semester}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="">Select Semester</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                            <option key={s} value={String(s)}>{s}th</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Access Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save Changes
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => logout()}
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
