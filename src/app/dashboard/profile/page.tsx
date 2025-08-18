
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { auth, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Loader } from "lucide-react";


export default function ProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName ?? "");
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoURL, setPhotoURL] = useState(user?.photoURL ?? "");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePasswordReset = async () => {
        if (!user?.email) return;

        setIsSending(true);
        try {
            await sendPasswordResetEmail(auth, user.email);
            toast({
                title: "Password Reset Email Sent",
                description: `An email has been sent to ${user.email} with instructions to reset your password.`,
            });
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Error Sending Email",
                description: error.message,
            });
        } finally {
            setIsSending(false);
        }
    }
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto(file);
            setPhotoURL(URL.createObjectURL(file));
        }
    };
    
    const handleProfileUpdate = async () => {
        if (!user) return;
        setIsUpdating(true);
        
        try {
            let newPhotoURL = user.photoURL;

            if (photo) {
                const storageRef = ref(storage, `avatars/${user.uid}/${photo.name}`);
                await uploadBytes(storageRef, photo);
                newPhotoURL = await getDownloadURL(storageRef);
            }
            
            await updateProfile(user, {
                displayName: displayName,
                photoURL: newPhotoURL,
            });

            // Force a reload of the user to get the latest profile info
            await user.reload();
            if (newPhotoURL) {
                setPhotoURL(newPhotoURL);
            }

            toast({
                title: "Profile Updated",
                description: "Your profile has been successfully updated.",
            });

        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message,
            });
        } finally {
            setIsUpdating(false);
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
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                         <Avatar className="h-20 w-20">
                            <AvatarImage src={photoURL ?? ""} alt="User avatar" />
                            <AvatarFallback className="text-3xl">
                            {user.email?.[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Upload Picture</Button>
                    </div>
                   <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                   </div>
                   <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" defaultValue={user.email ?? ""} readOnly disabled/>
                   </div>
                    <Button onClick={handleProfileUpdate} disabled={isUpdating}>
                        {isUpdating ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : "Update Profile" }
                    </Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your password and account security.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handlePasswordReset} disabled={isSending}>
                        {isSending ? "Sending..." : "Send Password Reset Email"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
