"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';

const initialWishlist = [
    { id: 1, name: 'Sony WH-1000XM5 Headphones', price: 29990, saved: 15000, imageUrl: 'https://placehold.co/100x100.png' },
    { id: 2, name: 'New MacBook Pro', price: 199900, saved: 50000, imageUrl: 'https://placehold.co/100x100.png' },
    { id: 3, name: 'Goa Trip', price: 45000, saved: 45000, imageUrl: 'https://placehold.co/100x100.png' },
];


export default function WishlistPage() {
    const [wishlist, setWishlist] = useState(initialWishlist);
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName || !newItemPrice) return;
        const newItem = {
            id: wishlist.length + 1,
            name: newItemName,
            price: parseFloat(newItemPrice),
            saved: 0,
            imageUrl: 'https://placehold.co/100x100.png',
        };
        setWishlist([...wishlist, newItem]);
        setNewItemName('');
        setNewItemPrice('');
    };

    const handleRemoveItem = (id: number) => {
        setWishlist(wishlist.filter(item => item.id !== id));
    };

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
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
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
        </div>
    );
}
