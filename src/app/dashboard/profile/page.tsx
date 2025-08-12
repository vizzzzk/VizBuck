"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);

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
                            <AvatarImage src={user.photoURL ?? ""} alt="User avatar" />
                            <AvatarFallback className="text-3xl">
                            {user.email?.[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <Button variant="outline">Upload Picture</Button>
                    </div>
                   <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={user.displayName ?? "Valued User"} />
                   </div>
                   <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" defaultValue={user.email ?? ""} readOnly disabled/>
                   </div>
                    <Button>Update Profile</Button>
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
