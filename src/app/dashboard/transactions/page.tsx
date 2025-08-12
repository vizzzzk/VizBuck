
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, MoreHorizontal, Trash2, Edit, Trash, ChevronDown, Check, ChevronsUpDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useFinancials, Transaction } from '@/hooks/use-financials';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

type TransactionFormData = Omit<Transaction, 'id'>;

export default function TransactionsPage() {
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    
    const { 
        currentMonthData, 
        addTransaction, 
        updateTransaction,
        deleteTransaction,
        deleteMultipleTransactions,
        clearTransactionsForCurrentMonth,
        clearAllData,
        currentMonth,
        setCurrentMonth,
        availableMonths,
        currentMonthData: { liquidity } 
    } = useFinancials();
    const { toast } = useToast();

    const emptyTransaction: TransactionFormData = {
        date: new Date(currentMonth.year, currentMonth.month - 1).toISOString().split('T')[0],
        description: '',
        category: '',
        amount: 0,
        paymentMethod: 'Cash',
        type: 'DR',
    };
    const [transactionForm, setTransactionForm] = useState<TransactionFormData>(emptyTransaction);
    
    const sortedTransactions = useMemo(() => {
        return [...currentMonthData.transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [currentMonthData.transactions]);

    const categories = useMemo(() => {
        const allCategories = currentMonthData.transactions.map(t => t.category);
        return ['Food & Dining', 'Shopping', 'Travel', 'Utilities', 'Entertainment', 'Salary', 'Other', ...Array.from(new Set(allCategories))];
    }, [currentMonthData.transactions]);

    const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        setSelectedRows([]);
    }, [currentMonth]);

    useEffect(() => {
        if (open) {
            if (isEditing && editingTransaction) {
                setTransactionForm({
                     date: editingTransaction.date,
                     description: editingTransaction.description,
                     category: editingTransaction.category,
                     amount: editingTransaction.amount,
                     paymentMethod: editingTransaction.paymentMethod,
                     type: editingTransaction.type,
                });
            } else {
                setTransactionForm({
                    ...emptyTransaction,
                    date: new Date(currentMonth.year, currentMonth.month - 1).toISOString().split('T')[0]
                });
            }
        }
    }, [open, isEditing, editingTransaction, currentMonth]);

    const handleOpenDialog = (transaction: Transaction | null = null) => {
        if (transaction) {
            setIsEditing(true);
            setEditingTransaction(transaction);
        } else {
            setIsEditing(false);
            setEditingTransaction(null);
        }
        setOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!transactionForm.description || !transactionForm.category || transactionForm.amount <= 0 || !transactionForm.paymentMethod) {
            toast({
                variant: "destructive",
                title: "Invalid Input",
                description: "Please fill all fields correctly to add a transaction.",
            });
            return;
        }
        
        if (isEditing && editingTransaction) {
            updateTransaction({ ...editingTransaction, ...transactionForm });
            toast({
                title: "Transaction Updated",
                description: `Expense "${transactionForm.description}" has been updated.`,
            });
        } else {
            addTransaction(transactionForm);
            toast({
                title: "Transaction Added",
                description: `Expense of ₹${transactionForm.amount} for "${transactionForm.description}" has been recorded.`,
            });
        }

        setOpen(false);
        setIsEditing(false);
        setEditingTransaction(null);
    }
    
    const handleDelete = (id: string) => {
        deleteTransaction(id);
        toast({
            title: "Transaction Deleted",
            description: `The expense has been removed.`,
        });
    }

    const handleClearMonth = () => {
        clearTransactionsForCurrentMonth();
         toast({
            title: "Transactions Cleared",
            description: `All transactions for ${format(new Date(currentMonthData.month), "MMMM yyyy")} have been deleted.`,
        });
    }

    const handleClearAllData = () => {
        clearAllData();
        toast({
            title: "All Data Cleared",
            description: "All financial data has been reset to its initial state."
        });
    }
    
    const handleDeleteSelected = () => {
        deleteMultipleTransactions(selectedRows);
        toast({
            title: "Transactions Deleted",
            description: `${selectedRows.length} transactions have been removed.`,
        });
        setSelectedRows([]);
    }

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if(checked === true) {
            setSelectedRows(sortedTransactions.map(t => t.id));
        } else {
            setSelectedRows([]);
        }
    }

    const handleRowSelect = (id: string) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    }

    const handleMonthChange = (value: string) => {
      const [year, month] = value.split("-");
      setCurrentMonth({ year: parseInt(year), month: parseInt(month) });
    };

    const paymentMethods = useMemo(() => {
       return ['Cash', ...liquidity.bankAccounts.map(acc => acc.name)];
    }, [liquidity.bankAccounts]);
    
    const formattedCurrentMonth = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}`;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
                <div>
                    <CardTitle>Transactions</CardTitle>
                    <CardDescription>View and manage your recent expenses.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                     <Select value={formattedCurrentMonth} onValueChange={handleMonthChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue>
                              {format(new Date(formattedCurrentMonth), "MMMM yyyy")}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {availableMonths.map(m => (
                              <SelectItem key={m} value={m}>{format(new Date(m), "MMMM yyyy")}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedRows.length > 0 ? (
                         <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                            <Trash className="h-4 w-4 mr-2" />
                            Delete ({selectedRows.length})
                        </Button>
                    ) : (
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="destructive" size="sm" className="gap-1" disabled={currentMonthData.transactions.length === 0}>
                                    <Trash className="h-4 w-4" />
                                    <span>Clear</span>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Clear Options</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                     <DropdownMenuItem>
                                        Clear This Month
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                        Clear All Data
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete transactions.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearMonth}>Clear This Month</AlertDialogAction>
                                 <AlertDialogAction className="bg-red-700 hover:bg-red-800" onClick={handleClearAllData}>Clear All Data</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                    )}

                    <Button size="sm" className="gap-1" onClick={() => handleOpenDialog()}>
                        <PlusCircle className="h-4 w-4" />
                        Add Expense
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox 
                                    checked={selectedRows.length === sortedTransactions.length && sortedTransactions.length > 0 ? true : (selectedRows.length > 0 ? 'indeterminate' : false)}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedTransactions.length > 0 ? (
                            sortedTransactions.map((transaction) => (
                                <TableRow key={transaction.id} data-state={selectedRows.includes(transaction.id) && "selected"}>
                                    <TableCell>
                                        <Checkbox 
                                            checked={selectedRows.includes(transaction.id)}
                                            onCheckedChange={() => handleRowSelect(transaction.id)}
                                        />
                                    </TableCell>
                                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{transaction.description}</TableCell>
                                    <TableCell>{transaction.category}</TableCell>
                                    <TableCell>{transaction.paymentMethod}</TableCell>
                                    <TableCell>
                                        <Badge variant={transaction.type === 'DR' ? 'destructive' : 'default'} className="bg-opacity-20 text-opacity-100">
                                            {transaction.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">₹{transaction.amount.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleOpenDialog(transaction)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(transaction.id)} className="text-red-500 focus:text-red-500">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    No transactions for this month yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>

             <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Update the details of your transaction.' : "Manually enter a new transaction here. Click save when you're done."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave}>
                        <div className="grid gap-4 py-4">
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">Date</Label>
                                <Input 
                                    id="date" 
                                    type="date" 
                                    className="col-span-3" 
                                    value={transactionForm.date}
                                    onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">Description</Label>
                                <Input 
                                    id="description" 
                                    placeholder="e.g., Coffee with friends" 
                                    className="col-span-3"
                                    value={transactionForm.description} 
                                    onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">Category</Label>
                                <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={categoryPopoverOpen}
                                            className="col-span-3 justify-between"
                                        >
                                            {transactionForm.category || "Select category..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput 
                                                placeholder="Search or create..." 
                                                value={newCategory}
                                                onValueChange={setNewCategory}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    <Button className="w-full" onClick={() => {
                                                        setTransactionForm({...transactionForm, category: newCategory });
                                                        setCategoryPopoverOpen(false);
                                                        setNewCategory('');
                                                    }}>
                                                        Create "{newCategory}"
                                                    </Button>
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {categories.map((category) => (
                                                    <CommandItem
                                                        key={category}
                                                        value={category}
                                                        onSelect={(currentValue) => {
                                                            setTransactionForm({...transactionForm, category: currentValue });
                                                            setCategoryPopoverOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            transactionForm.category === category ? "opacity-100" : "opacity-0"
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
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">Type</Label>
                                <Select value={transactionForm.type} onValueChange={(value) => setTransactionForm({...transactionForm, type: value as 'CR' | 'DR'})}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DR">Debit (DR)</SelectItem>
                                        <SelectItem value="CR">Credit (CR)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">Amount</Label>
                                <Input 
                                    id="amount" 
                                    type="number" 
                                    placeholder="e.g., 500.00" 
                                    className="col-span-3" 
                                    value={transactionForm.amount || ''}
                                    onChange={(e) => setTransactionForm({...transactionForm, amount: Number(e.target.value)})}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="paymentMethod" className="text-right">Paid By</Label>
                                <Select value={transactionForm.paymentMethod} onValueChange={(value) => setTransactionForm({...transactionForm, paymentMethod: value})}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select Payment Method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentMethods.map(method => (
                                            <SelectItem key={method} value={method}>{method}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Transaction</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

