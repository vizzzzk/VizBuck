
"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader, CheckCircle, AlertCircle, Inbox, FileText, Trash2, ChevronsUpDown, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFinancials } from '@/hooks/use-financials';
import { extractTransactions, ExtractTransactionsOutput } from '@/ai/flows/extract-transactions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';


type ImportStep = 'upload' | 'review' | 'importing' | 'complete';
type TransactionWithState = ExtractTransactionsOutput['transactions'][0] & { popoverOpen?: boolean };


export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [bankName, setBankName] = useState('');
    const [step, setStep] = useState<ImportStep>('upload');
    const [extractedData, setExtractedData] = useState<(ExtractTransactionsOutput & { transactions: TransactionWithState[] }) | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const { addMultipleTransactions, currentMonthData } = useFinancials();
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError("Please upload a valid PDF file.");
        }
    };

    const handleExtract = async () => {
        if (!file) {
            toast({ variant: "destructive", title: "Missing File", description: "Please select a PDF file to extract transactions from." });
            return;
        }

        setStep('importing');
        setError(null);

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const pdfDataUri = event.target?.result as string;
                try {
                    const result = await extractTransactions({ pdfDataUri, bankName: bankName || "Unknown Bank" });
                    if (result && result.transactions.length > 0) {
                        setExtractedData({...result, transactions: result.transactions.map(t => ({...t, popoverOpen: false}))});
                        setStep('review');
                        toast({ title: "Extraction Successful", description: `${result.transactions.length} transactions found. Please review.` });
                    } else {
                        throw new Error("No transactions were found in the PDF.");
                    }
                } catch (e: any) {
                    setError(`Failed to extract transactions: ${e.message}`);
                    setStep('upload');
                }
            };
            reader.onerror = () => {
                 setError("Failed to read the file.");
                 setStep('upload');
            }
            reader.readAsDataURL(file);
        } catch (e: any) {
            setError(`An unexpected error occurred: ${e.message}`);
            setStep('upload');
        }
    };
    
    const handleConfirmImport = () => {
        if (!extractedData) return;
        
        const transactionsToImport = extractedData.transactions.map(t => ({
            ...t,
            date: format(parseISO(t.date), 'yyyy-MM-dd'),
        }));

        addMultipleTransactions(transactionsToImport);
        
        toast({ title: "Import Complete!", description: `${transactionsToImport.length} transactions have been added.`});
        setStep('complete');
        // Reset state for next import
        setTimeout(() => {
            setFile(null);
            setBankName('');
            setExtractedData(null);
            setStep('upload');
        }, 3000);
    }
    
    const handleRemoveTransaction = (index: number) => {
        if (!extractedData) return;
        const updatedTransactions = [...extractedData.transactions];
        updatedTransactions.splice(index, 1);
        setExtractedData({ ...extractedData, transactions: updatedTransactions });
    }

    const handleCategoryChange = (index: number, category: string) => {
        if (!extractedData) return;
        const updatedTransactions = [...extractedData.transactions];
        updatedTransactions[index].category = category;
        updatedTransactions[index].popoverOpen = false;
        setExtractedData({ ...extractedData, transactions: updatedTransactions });
    }

    const setPopoverOpen = (index: number, open: boolean) => {
        if (!extractedData) return;
        const updatedTransactions = extractedData.transactions.map((t, i) => ({
            ...t,
            popoverOpen: i === index ? open : false,
        }));
        setExtractedData({ ...extractedData, transactions: updatedTransactions });
    };

    const categories = useMemo(() => {
        const existingCategories = Array.from(new Set(currentMonthData.transactions.map(t => t.category).filter(Boolean)));
        const defaultCategories = ['Food & Dining', 'Shopping', 'Travel', 'Utilities', 'Entertainment', 'Salary', 'Other'];
        return Array.from(new Set([...defaultCategories, ...existingCategories]));
    }, [currentMonthData.transactions]);


    const renderUploadStep = () => (
         <CardContent>
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="bank-name">Bank Name (Optional)</Label>
                    <Input id="bank-name" placeholder="e.g., HDFC Bank, ICICI Bank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                    <p className="text-sm text-muted-foreground">Providing a name helps the AI, but it can often figure it out automatically.</p>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="pdf-file">Bank Statement (PDF)</Label>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="pdf-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-card">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {file ? (
                                    <>
                                        <FileText className="w-10 h-10 mb-3 text-primary" />
                                        <p className="mb-2 text-sm text-foreground">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">Click to change file</p>
                                    </>
                                ) : (
                                    <>
                                        <Inbox className="w-10 h-10 mb-3 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">PDF file from your bank</p>
                                    </>
                                )}
                            </div>
                            <Input id="pdf-file" type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>
                 {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <p>{error}</p>
                    </div>
                )}
                <Button onClick={handleExtract} disabled={!file} className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Extract Transactions
                </Button>
            </div>
        </CardContent>
    );

    const renderReviewStep = () => (
         <CardContent>
            <div className="space-y-4">
                <p className="text-muted-foreground">Review and categorize the extracted transactions below. Remove any incorrect entries before confirming.</p>
                 <div className="max-h-[400px] overflow-auto border rounded-md">
                     <Table>
                        <TableHeader className="sticky top-0 bg-muted">
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[200px]">Category</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {extractedData?.transactions.map((t, index) => (
                                <TableRow key={index}>
                                    <TableCell>{format(parseISO(t.date), 'dd MMM yyyy')}</TableCell>
                                    <TableCell className="font-medium">{t.description}</TableCell>
                                    <TableCell>
                                        <CategorySelector 
                                            value={t.category} 
                                            onSelect={(cat) => handleCategoryChange(index, cat)}
                                            isOpen={t.popoverOpen ?? false}
                                            onOpenChange={(open) => setPopoverOpen(index, open)}
                                            allCategories={categories}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">₹{t.amount.toLocaleString('en-IN')}</TableCell>
                                    <TableCell>
                                        <Badge variant={t.type === 'DR' ? 'destructive' : 'default'} className="bg-opacity-20">{t.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleRemoveTransaction(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep('upload')} className="w-full">Back</Button>
                    <Button onClick={handleConfirmImport} className="w-full">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirm and Import ({extractedData?.transactions.length})
                    </Button>
                </div>
            </div>
         </CardContent>
    );

    const renderInProgress = (title: string, message: string) => (
        <CardContent className="flex flex-col items-center justify-center h-80 gap-4 text-center">
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground">{message}</p>
        </CardContent>
    );
    
    const renderCompleteStep = () => (
        <CardContent className="flex flex-col items-center justify-center h-80 gap-4 text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
             <h3 className="text-xl font-semibold">Import Complete!</h3>
            <p className="text-muted-foreground">Your transactions have been successfully added to your records.</p>
        </CardContent>
    );

    return (
        <div className="grid gap-6">
            <Card className="max-w-4xl mx-auto w-full">
                <CardHeader>
                    <CardTitle>Import Transactions from PDF</CardTitle>
                    <CardDescription>
                        Download a PDF statement from your bank's website and upload it here for automatic processing.
                    </CardDescription>
                </CardHeader>
                
                {step === 'upload' && renderUploadStep()}
                {step === 'importing' && renderInProgress("Extracting Transactions...", "The AI is analyzing your PDF. This may take a minute.")}
                {step === 'review' && renderReviewStep()}
                {step === 'complete' && renderCompleteStep()}

            </Card>
        </div>
    );
}

// Category Selector Component
interface CategorySelectorProps {
    value: string;
    onSelect: (value: string) => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    allCategories: string[];
}

function CategorySelector({ value, onSelect, isOpen, onOpenChange, allCategories }: CategorySelectorProps) {
    const [newCategory, setNewCategory] = useState('');
    
    return (
        <Popover open={isOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    className="w-full justify-between"
                >
                    {value || "Select category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput 
                        placeholder="Search or create..." 
                        value={newCategory}
                        onValueChange={setNewCategory}
                    />
                    <CommandList>
                        <CommandEmpty>
                             <Button className="w-full" size="sm" onClick={() => {
                                onSelect(newCategory);
                                setNewCategory('');
                            }}>
                                Create "{newCategory}"
                            </Button>
                        </CommandEmpty>
                        <CommandGroup>
                            {allCategories.map((category) => (
                            <CommandItem
                                key={category}
                                value={category}
                                onSelect={(currentValue) => {
                                    onSelect(currentValue === value ? "" : currentValue);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === category ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {category}
                            </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

    