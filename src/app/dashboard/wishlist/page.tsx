
"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Save, X, Sparkles, Loader, Gift } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';
import { getWishlistImage } from '@/ai/flows/get-wishlist-image';
import { useToast } from '@/hooks/use-toast';

interface WishlistItem {
    id: number;
    name: string;
    price: number;
    saved: number;
    imageUrl: string;
    imageHint: string;
}

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    
    // State for inline editing
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingSaved, setEditingSaved] = useState<string>('');
    const [isImageLoading, setIsImageLoading] = useState<number | null>(null);
    const { toast } = useToast();


    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName || !newItemPrice) {
            toast({
                variant: "destructive",
                title: "Missing fields",
                description: "Please provide both an item name and a price."
            });
            return;
        }

        const newId = Date.now();
        const newItem: WishlistItem = {
            id: newId,
            name: newItemName,
            price: parseFloat(newItemPrice),
            saved: 0,
            imageUrl: `https://placehold.co/120x120.png?text=${newItemName.split(' ').join('+')}`,
            imageHint: newItemName,
        };
        setWishlist([...wishlist, newItem]);
        setNewItemName('');
        setNewItemPrice('');

        setIsImageLoading(newId);
        try {
            const {imageUrl} = await getWishlistImage({itemName: newItem.name});
            setWishlist(prev => prev.map(item => item.id === newId ? {...item, imageUrl} : item));
             toast({
                title: "Image Generated!",
                description: `A new image for ${newItem.name} has been created.`
            });
        } catch (error) {
            console.error("Failed to generate image:", error);
            toast({
                variant: "destructive",
                title: "Image Generation Failed",
                description: "Could not generate an image. Using a placeholder."
            });
        } finally {
            setIsImageLoading(null);
        }
    };

    const handleRemoveItem = (id: number) => {
        setWishlist(wishlist.filter(item => item.id !== id));
        toast({ title: "Item removed from wishlist." });
    };

    const handleStartEditing = (item: WishlistItem) => {
        setEditingId(item.id);
        setEditingSaved(item.saved.toString());
    }

    const handleCancelEditing = () => {
        setEditingId(null);
        setEditingSaved('');
    }
    
    const handleUpdateSavedAmount = (id: number) => {
        setWishlist(wishlist.map(item => 
            item.id === id ? { ...item, saved: parseFloat(editingSaved) || 0 } : item
        ));
        handleCancelEditing();
        toast({ title: "Saved amount updated." });
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add to Wishlist</CardTitle>
                    <CardDescription>What are you saving up for next? Add it here to track your progress.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddItem} className="flex flex-col md:flex-row items-end gap-4">
                        <div className="grid gap-2 flex-1 w-full">
                            <Label htmlFor="item-name">Item Name</Label>
                            <Input id="item-name" placeholder="e.g., Mountain Bike" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="item-price">Target Price (₹)</Label>
                            <Input id="item-price" type="number" placeholder="e.g., 50000" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} />
                        </div>
                        <Button type="submit" className="gap-1 w-full md:w-auto" disabled={isImageLoading !== null}>
                             {isImageLoading !== null ? (
                                <>
                                <Loader className="animate-spin" />
                                Generating...
                                </>
                            ) : (
                                <>
                                <Sparkles className="h-4 w-4" />
                                Add & Generate Image
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                 <h3 className="text-xl font-semibold">Your Wishlist</h3>
                 {wishlist.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <Gift className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground font-semibold">Your wishlist is empty.</p>
                        <p className="text-sm text-muted-foreground">Add an item above to start saving!</p>
                    </div>
                 )}
                 {wishlist.map(item => {
                    const progress = item.price > 0 ? (item.saved / item.price) * 100 : 0;
                    const isEditingThis = editingId === item.id;

                    return (
                        <Card key={item.id} className="overflow-hidden">
                           <div className="flex items-center">
                             <div className="flex-shrink-0 w-[120px] h-[120px] relative bg-muted flex items-center justify-center">
                                {isImageLoading === item.id ? (
                                    <Loader className="animate-spin text-primary" />
                                ) : (
                                    <Image 
                                        src={item.imageUrl}
                                        alt={item.name}
                                        width={120}
                                        height={120}
                                        className="object-cover h-full w-full"
                                        data-ai-hint={item.imageHint}
                                    />
                                )}
                             </div>
                             <div className="flex-1 p-4">
                                <div className="flex items-start justify-between">
                                    <p className="font-semibold text-lg">{item.name}</p>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>

                                {isEditingThis ? (
                                    <div className="mt-2 flex items-center gap-2">
                                        <Label htmlFor={`saved-amount-${item.id}`} className="sr-only">Saved Amount</Label>
                                        <Input
                                            id={`saved-amount-${item.id}`}
                                            type="number"
                                            value={editingSaved}
                                            onChange={(e) => setEditingSaved(e.target.value)}
                                            placeholder="Saved Amount"
                                            className="h-9"
                                        />
                                        <Button size="icon" className="h-9 w-9" onClick={() => handleUpdateSavedAmount(item.id)}><Save className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleCancelEditing}><X className="h-4 w-4" /></Button>
                                    </div>
                                ) : (
                                    <>
                                        <p 
                                            className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
                                            onClick={() => handleStartEditing(item)}
                                        >
                                           <span className="font-bold text-primary">₹{item.saved.toLocaleString('en-IN')}</span> saved of ₹{item.price.toLocaleString('en-IN')}
                                           <Edit className="h-3 w-3 inline-block ml-2 opacity-50" />
                                        </p>
                                        <div className="mt-3">
                                            <Progress value={progress} />
                                        </div>
                                    </>
                                )}
                             </div>
                           </div>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}
