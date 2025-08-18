
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { auth, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Loader } from "lucide-react";


export default function ProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [displayName, setDisplayName] = useState(user?.displayName ?? "");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(user?.photoURL ?? null);
    const [busy, setBusy] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!file) {
            setPreview(user?.photoURL ?? null);
            return;
        };
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file, user?.photoURL]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        setFile(f);
    };

    const handlePasswordReset = async () => {
        if (!user?.email) return;

        setIsSendingReset(true);
        try {
            await sendPasswordResetEmail(auth, user.email);
            toast({
                title: "Password Reset Email Sent",
                description: `An email has been sent to ${user.email} with instructions.`,
            });
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Error Sending Email",
                description: error.message,
            });
        } finally {
            setIsSendingReset(false);
        }
    }
    
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
             toast({ variant: "destructive", title: "Not signed in." });
             return;
        }

        setBusy(true);

        const timeout = setTimeout(() => {
          if (busy) {
             toast({ variant: "destructive", title: "Update timed out", description: "Taking longer than expected. Please check your connection and try again." });
             setBusy(false);
          }
        }, 15000);

        try {
            let newPhotoURL = user.photoURL;

            if (file) {
                const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
                await uploadBytes(storageRef, file);
                newPhotoURL = await getDownloadURL(storageRef);
            }
            
            await updateProfile(user, {
                displayName: displayName,
                photoURL: newPhotoURL ?? user.photoURL,
            });

            await user.reload();
            
            toast({
                title: "Profile Updated",
                description: "Your profile has been successfully updated.",
            });

        } catch (error: any) {
             console.error('Update profile error:', error?.code, error?.message || error);
             toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message,
            });
        } finally {
            clearTimeout(timeout);
            setBusy(false);
        }
    };


    if (!user) {
        return null;
    }
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Manage your personal information and account settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                         <div className="flex items-center gap-4">
                             <Avatar className="h-20 w-20">
                                <AvatarImage src={preview ?? ""} alt="User avatar" />
                                <AvatarFallback className="text-3xl">
                                {user.email?.[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/png, image/jpeg"
                            />
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>Upload Picture</Button>
                        </div>
                       <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                       </div>
                       <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" defaultValue={user.email ?? ""} readOnly disabled/>
                       </div>
                        <Button type="submit" disabled={busy}>
                            {busy ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : "Update Profile" }
                        </Button>
                    </form>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your password and account security.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handlePasswordReset} disabled={isSendingReset}>
                        {isSendingReset ? "Sending..." : "Send Password Reset Email"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
