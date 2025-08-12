
"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WishlistItem {
    id: number;
    name: string;
    price: number;
    saved: number;
    imageUrl: string;
}

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    
    // State for the editing dialog
    const [open, setOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<WishlistItem | null>(null);
    const [savedAmount, setSavedAmount] = useState('');

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName || !newItemPrice) return;
        const newItem: WishlistItem = {
            id: Date.now(),
            name: newItemName,
            price: parseFloat(newItemPrice),
            saved: 0,
            imageUrl: 'https://placehold.co/120x120.png',
        };
        setWishlist([...wishlist, newItem]);
        setNewItemName('');
        setNewItemPrice('');
    };

    const handleRemoveItem = (id: number) => {
        setWishlist(wishlist.filter(item => item.id !== id));
    };

    const handleOpenDialog = (item: WishlistItem) => {
        setCurrentItem(item);
        setSavedAmount(item.saved.toString());
        setOpen(true);
    };
    
    const handleUpdateSavedAmount = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentItem) return;
        
        setWishlist(wishlist.map(item => 
            item.id === currentItem.id ? { ...item, saved: parseFloat(savedAmount) || 0 } : item
        ));
        setOpen(false);
        setCurrentItem(null);
        setSavedAmount('');
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add to Wishlist</CardTitle>
                    <CardDescription>What are you saving up for next?</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddItem} className="flex flex-col md:flex-row items-end gap-4">
                        <div className="grid gap-2 flex-1 w-full">
                            <Label htmlFor="item-name">Item Name</Label>
                            <Input id="item-name" placeholder="e.g., iPhone 16" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="item-price">Target Price (₹)</Label>
                            <Input id="item-price" type="number" placeholder="e.g., 99900" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} />
                        </div>
                        <Button type="submit" className="gap-1 w-full md:w-auto">
                            <PlusCircle className="h-4 w-4" />
                            Add Item
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                 <h3 className="text-xl font-semibold">Your Wishlist</h3>
                 {wishlist.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Your wishlist is empty.</p>
                        <p className="text-sm text-muted-foreground">Add an item above to start saving!</p>
                    </div>
                 )}
                 {wishlist.map(item => {
                    const progress = item.price > 0 ? (item.saved / item.price) * 100 : 100;
                    return (
                        <Card key={item.id} className="overflow-hidden">
                           <div className="flex items-center">
                             <div className="flex-shrink-0">
                                <Image 
                                    src={item.imageUrl}
                                    alt={item.name}
                                    width={120}
                                    height={120}
                                    className="object-cover h-full"
                                    data-ai-hint="product photo"
                                 />
                             </div>
                             <div className="flex-1 p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold text-lg">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                           <span className="font-bold text-primary">₹{item.saved.toLocaleString('en-IN')}</span> saved of ₹{item.price.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="outline" size="icon" onClick={() => handleOpenDialog(item)}>
                                            <Edit className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-3">
                                   <Progress value={progress} />
                                </div>
                             </div>
                           </div>
                        </Card>
                    )
                })}
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Saved Amount for {currentItem?.name}</DialogTitle>
                        <DialogDescription>
                            How much have you saved towards this item so far?
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateSavedAmount}>
                        <div className="py-4">
                            <Label htmlFor="saved-amount">Amount Saved (₹)</Label>
                            <Input 
                                id="saved-amount" 
                                type="number" 
                                value={savedAmount} 
                                onChange={(e) => setSavedAmount(e.target.value)}
                                placeholder="e.g., 25000"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Update Savings</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
