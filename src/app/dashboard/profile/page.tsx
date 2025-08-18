
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { sendPasswordResetEmail, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth, storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Loader } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// Helper function from the prompt
async function uploadWithRetry(fileRef: any, file: File, metadata: any, onProgress: (pct:number)=>void) {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const task = uploadBytesResumable(fileRef, file, metadata);
      const url: string = await new Promise((resolve, reject) => {
        task.on('state_changed',
          snap => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          err => reject(err),
          async () => resolve(await getDownloadURL(task.snapshot.ref))
        );
      });
      return url;
    } catch (err: any) {
      const code = err?.code || '';
      const transient = ['storage/retry-limit-exceeded','storage/unknown','storage/quota-exceeded','storage/canceled','storage/network-request-failed'];
      if (attempt < maxAttempts && transient.some(t => code.includes(t))) {
        await new Promise(r => setTimeout(r, 500 * attempt)); 
        continue;
      }
      throw err;
    }
  }
  throw new Error('Upload failed after retries.');
}


export default function ProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [displayName, setDisplayName] = useState(user?.displayName ?? "");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(user?.photoURL ?? null);
    const [busy, setBusy] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New state variables from the prompt
    const [progress, setProgress] = useState(0);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

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
        setErr(null);
        setMsg(null);
        setProgress(0);
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
        setBusy(true); setErr(null); setMsg(null); setProgress(0);

        try {
            if (!user) throw new Error('Not signed in.');
            if (!navigator.onLine) throw new Error('You appear to be offline.');

            let photoURL = user.photoURL ?? null;

            if (file) {
                if (!/^image\/(png|jpeg|webp|jpg)$/.test(file.type)) throw new Error('Please select a PNG/JPG/WEBP image.');
                if (file.size > 5 * 1024 * 1024) throw new Error('Image too large (max 5 MB).');

                const ext = (file.name.split('.').pop() || 'png').toLowerCase();
                const path = `users/${user.uid}/avatar_${Date.now()}.${ext}`;
                const fileRef = ref(storage, path);
                
                photoURL = await uploadWithRetry(fileRef, file, {
                    contentType: file.type || 'image/png',
                    cacheControl: 'public,max-age=3600',
                }, setProgress);
            }

            try {
                await updateProfile(user, { displayName: displayName || undefined, photoURL: photoURL || undefined });
            } catch (err: any) {
                 if (String(err?.code).includes('auth/requires-recent-login')) {
                    const pw = window.prompt('Please re-enter your password to update profile:');
                    if (pw) {
                        const cred = EmailAuthProvider.credential(user.email || '', pw);
                        await reauthenticateWithCredential(user, cred);
                        await updateProfile(user, { displayName: displayName || undefined, photoURL: photoURL || undefined });
                    } else {
                        throw new Error('Update cancelled (reauth needed).');
                    }
                } else {
                    throw err;
                }
            }

            await user.reload();
            setMsg('Profile updated successfully.');
            toast({ title: "Profile Updated!", description: "Your changes have been saved."});

        } catch (err: any) {
            console.error('Update profile error:', err?.code, err?.message || err);
            const map: Record<string,string> = {
                'storage/unauthorized': 'Permission denied by Storage rules. Ensure you are signed in and rules allow writes to /users/{uid}.',
                'storage/quota-exceeded': 'Storage quota exceeded on the bucket.',
                'storage/canceled': 'Upload canceled.',
                'storage/retry-limit-exceeded': 'Network unstable—retry limit exceeded.',
                'auth/requires-recent-login': 'Please re-sign in to update profile.',
                'storage/network-request-failed': 'Network error during upload. Check your connection or referrer restrictions.',
            };
            const code = err?.code || '';
            setErr(map[code] || (err?.message || 'Failed to update profile. Check console/network.'));
        } finally {
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
                                accept="image/png, image/jpeg, image/webp"
                            />
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>Upload Picture</Button>
                        </div>

                       {progress > 0 && progress < 100 && <Progress value={progress} className="w-full" />}
                       
                       {err && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{err}</AlertDescription></Alert>}
                       {msg && <Alert variant="default"><AlertTitle>Success</AlertTitle><AlertDescription>{msg}</AlertDescription></Alert>}

                       <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                       </div>
                       <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" defaultValue={user.email ?? ""} readOnly disabled/>
                       </div>
                        <Button type="submit" disabled={busy}>
                            {busy ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Profile" }
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

    