
"use client";

import React, { useState } from 'react';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFinancials, Transaction } from '@/hooks/use-financials';

export default function TransactionsPage() {
    const [open, setOpen] = useState(false);
    const { transactions, addTransaction, liquidity } = useFinancials();
    const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'id'>>({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        amount: 0,
        paymentMethod: 'Cash', // Default payment method
    });

    const handleSave = () => {
        if (!newTransaction.description || !newTransaction.category || newTransaction.amount <= 0 || !newTransaction.paymentMethod) {
            // Basic validation
            alert("Please fill all fields correctly.");
            return;
        }
        addTransaction(newTransaction);
        setOpen(false);
        // Reset form
        setNewTransaction({
            date: new Date().toISOString().split('T')[0],
            description: '',
            category: '',
            amount: 0,
            paymentMethod: 'Cash',
        });
    }

    const paymentMethods = ['Cash', ...liquidity.bankAccounts.map(acc => acc.name)];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Transactions</CardTitle>
                    <CardDescription>View and manage your recent expenses.</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                         <Button size="sm" className="gap-1">
                            <PlusCircle className="h-4 w-4" />
                            Add Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Expense</DialogTitle>
                            <DialogDescription>
                                Manually enter a new transaction here. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">Date</Label>
                                <Input 
                                    id="date" 
                                    type="date" 
                                    className="col-span-3" 
                                    value={newTransaction.date}
                                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">Description</Label>
                                <Input 
                                    id="description" 
                                    placeholder="e.g., Coffee with friends" 
                                    className="col-span-3"
                                    value={newTransaction.description} 
                                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">Category</Label>
                                <Select onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="food">Food & Dining</SelectItem>
                                        <SelectItem value="shopping">Shopping</SelectItem>
                                        <SelectItem value="travel">Travel</SelectItem>
                                        <SelectItem value="utilities">Utilities</SelectItem>
                                        <SelectItem value="entertainment">Entertainment</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
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
                                    value={newTransaction.amount || ''}
                                    onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="paymentMethod" className="text-right">Paid By</Label>
                                <Select onValueChange={(value) => setNewTransaction({...newTransaction, paymentMethod: value})}>
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
                            <Button type="submit" onClick={handleSave}>Save Transaction</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length > 0 ? (
                            transactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{transaction.description}</TableCell>
                                    <TableCell>{transaction.category}</TableCell>
                                    <TableCell>{transaction.paymentMethod}</TableCell>
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
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No transactions yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

    