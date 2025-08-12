
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, Loader } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { extractTransactionsFromStatement } from '@/ai/flows/extract-transactions';
import { useFinancials } from '@/hooks/use-financials';
import { Label } from '@/components/ui/label';

export default function ImportPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [statementYear, setStatementYear] = useState(String(new Date().getFullYear()));
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const { addMultipleTransactions } = useFinancials();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.type === 'application/pdf' && file.size < 5 * 1024 * 1024) {
                 setSelectedFile(file);
            } else {
                toast({
                    variant: "destructive",
                    title: "Invalid File",
                    description: "Please upload a PDF file smaller than 5MB.",
                });
                setSelectedFile(null);
            }
        }
    };
    
    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

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

        try {
            const dataUri = await toBase64(selectedFile);
            
            const result = await extractTransactionsFromStatement({ 
                statementDataUri: dataUri,
                statementYear: statementYear, 
            });

            if (result && result.transactions.length > 0) {
                addMultipleTransactions(result.transactions);
                toast({
                    title: "Import Successful",
                    description: `${result.transactions.length} transactions have been imported.`,
                });
            } else {
                 toast({
                    variant: "destructive",
                    title: "Import Failed",
                    description: "Could not extract any transactions from the statement.",
                });
            }

        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Upload Error",
                description: "An error occurred while processing the statement.",
            });
        } finally {
            setIsUploading(false);
            setSelectedFile(null);
        }
    };


    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Import Bank Statement</CardTitle>
                <CardDescription>
                    Upload your bank statement in PDF format to automatically analyze your transactions.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="statement-year">Statement Year</Label>
                    <Input 
                        id="statement-year"
                        type="number"
                        placeholder="e.g., 2024"
                        value={statementYear}
                        onChange={(e) => setStatementYear(e.target.value)}
                    />
                </div>
            
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF (MAX. 5MB)</p>
                        </div>
                        <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
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
                
                <Button onClick={handleUpload} disabled={!selectedFile || isUploading || !statementYear} className="w-full">
                    {isUploading ? (
                        <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Uploading and Analyzing...
                        </>
                    ) : (
                        "Upload and Analyze"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
