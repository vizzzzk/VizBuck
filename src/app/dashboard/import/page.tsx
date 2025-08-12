"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, Loader } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export default function ImportPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            // You can add file type/size validation here
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast({
                variant: "destructive",
                title: "No file selected",
                description: "Please choose a bank statement file to upload.",
            });
            return;
        }

        setIsUploading(true);

        // Simulate upload process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setIsUploading(false);
        toast({
            title: "Upload Successful",
            description: `File "${selectedFile.name}" has been uploaded and is being processed.`,
        });
        setSelectedFile(null);
    };


    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Import Bank Statement</CardTitle>
                <CardDescription>
                    Upload your bank statement in PDF or CSV format to automatically analyze your transactions.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF or CSV (MAX. 5MB)</p>
                        </div>
                        <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.csv" />
                    </label>
                </div>

                {selectedFile && (
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                       <div className="flex items-center gap-3">
                         <File className="w-6 h-6 text-primary" />
                         <span className="text-sm font-medium">{selectedFile.name}</span>
                       </div>
                       <span className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</span>
                    </div>
                )}
                
                <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full">
                    {isUploading ? (
                        <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        "Upload and Analyze"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
