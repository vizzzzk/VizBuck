
"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinancials, Liquidity, Reserves, Stock } from '@/hooks/use-financials';
import { useToast } from '@/hooks/use-toast';
import { Edit, PlusCircle, Trash2, RefreshCw, Loader } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { getHoldings } from '@/ai/flows/get-holdings-flow';

type AssetType = 'bankAccounts' | 'creditCards' | 'receivables' | 'fixedDeposits' | 'stocks' | 'crypto' | 'mutualFunds' | 'elss';

export default function WalletsPage() {
    const { 
        currentMonthData, 
        updateLiquidity, 
        updateReserves, 
        isDataLoaded,
        currentMonth,
        setCurrentMonth,
        availableMonths 
    } = useFinancials();
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any>(null);
    const [assetType, setAssetType] = useState<AssetType | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleEditClick = (asset: any, type: AssetType) => {
        setEditingAsset({ ...asset });
        setAssetType(type);
        setIsDialogOpen(true);
    };
    
    const handleAddNewClick = (type: AssetType) => {
        let newAsset: any = { id: Date.now() };
         switch (type) {
            case 'bankAccounts': newAsset = {...newAsset, name: '', balance: 0}; break;
            case 'creditCards': newAsset = {...newAsset, name: '', due: 0}; break;
            case 'receivables': newAsset = {...newAsset, source: '', amount: 0, date: new Date() }; break;
            case 'fixedDeposits': newAsset = {...newAsset, institution: '', amount: 0}; break;
            case 'stocks': newAsset = {...newAsset, broker: '', amount: 0}; break;
            case 'crypto': newAsset = {...newAsset, exchange: '', amount: 0}; break;
            case 'mutualFunds': newAsset = {...newAsset, name: '', amount: 0}; break;
            case 'elss': newAsset = {...newAsset, name: '', amount: 0}; break;
        }
        setEditingAsset(newAsset);
        setAssetType(type);
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!editingAsset || !assetType) return;

        const isLiquidityAsset = ['bankAccounts', 'creditCards', 'receivables'].includes(assetType);

        if (isLiquidityAsset) {
            const updatedLiquidity = { ...currentMonthData.liquidity };
            const items = [...updatedLiquidity[assetType as keyof Liquidity]] as any[];
            const index = items.findIndex(item => item.id === editingAsset.id);

            if (index > -1) {
                items[index] = editingAsset;
            } else {
                items.push(editingAsset);
            }
            (updatedLiquidity[assetType as keyof Liquidity] as any) = items;
            updateLiquidity(updatedLiquidity);
        } else {
            const updatedReserves = { ...currentMonthData.reserves };
            const items = [...updatedReserves[assetType as keyof Reserves]] as any[];
            const index = items.findIndex(item => item.id === editingAsset.id);

            if (index > -1) {
                items[index] = editingAsset;
            } else {
                items.push(editingAsset);
            }
            (updatedReserves[assetType as keyof Reserves] as any) = items;
            updateReserves(updatedReserves);
        }

        toast({ title: "Success", description: "Asset has been saved successfully." });
        setIsDialogOpen(false);
        setEditingAsset(null);
        setAssetType(null);
    };
    
    const handleDelete = (assetId: number, type: AssetType) => {
        const isLiquidityAsset = ['bankAccounts', 'creditCards', 'receivables'].includes(type);

        if (isLiquidityAsset) {
            const updatedLiquidity = { ...currentMonthData.liquidity };
            const items = [...updatedLiquidity[type as keyof Liquidity]] as any[];
            const newItems = items.filter(item => item.id !== assetId);
            (updatedLiquidity[type as keyof Liquidity] as any) = newItems;
            updateLiquidity(updatedLiquidity);
        } else {
            const updatedReserves = { ...currentMonthData.reserves };
             const items = [...updatedReserves[type as keyof Reserves]] as any[];
            const newItems = items.filter(item => item.id !== assetId);
            (updatedReserves[type as keyof Reserves] as any) = newItems;
            updateReserves(updatedReserves);
        }
         toast({ title: "Deleted", description: "Asset has been removed." });
    }

    const renderField = (key: string, value: any) => {
        const type = typeof value === 'number' ? 'number' : 'text';
        let label = key.charAt(0).toUpperCase() + key.slice(1);
        if (key === 'due') label = 'Amount Due';
        if (key === 'balance') label = 'Current Balance';
        
        return (
             <div className="grid grid-cols-4 items-center gap-4" key={key}>
                <Label htmlFor={key} className="text-right">{label}</Label>
                <Input
                    id={key}
                    type={type}
                    value={editingAsset[key]}
                    onChange={(e) => setEditingAsset({ ...editingAsset, [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
                    className="col-span-3"
                />
            </div>
        );
    };

    const handleMonthChange = (value: string) => {
      const [year, month] = value.split("-");
      setCurrentMonth({ year: parseInt(year), month: parseInt(month) });
    };

    const handleSyncHoldings = async () => {
        setIsSyncing(true);
        toast({ title: "Syncing...", description: "Fetching latest holdings from Upstox." });
        try {
            const result = await getHoldings();
            if (result.error) {
                 toast({ variant: "destructive", title: "Sync Failed", description: result.error });
            } else {
                const newStocks: Stock[] = result.holdings.map(h => ({
                    id: Date.now() + Math.random(), // simple unique id
                    broker: "Upstox",
                    amount: h.close_price * h.quantity,
                    name: h.trading_symbol,
                }));
                
                const updatedReserves = {
                     ...currentMonthData.reserves,
                     stocks: newStocks
                };
                updateReserves(updatedReserves);

                toast({ title: "Sync Successful!", description: `${result.holdings.length} holdings updated.` });
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Sync Error", description: error.message || "An unexpected error occurred." });
        } finally {
            setIsSyncing(false);
        }
    };
    
    const formattedCurrentMonth = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}`;

    if (!isDataLoaded) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Wallets & Assets</CardTitle>
                        <CardDescription>Manage your liquid assets and long-term reserves for the selected month.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleSyncHoldings} disabled={isSyncing}>
                            {isSyncing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Sync with Upstox
                        </Button>
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
                    </div>
                </CardHeader>
            </Card>

            {/* Liquidity Section */}
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Liquidity</CardTitle>
                        <CardDescription>Assets that are readily available.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <AssetCard title="Bank Accounts" assets={currentMonthData.liquidity.bankAccounts} type="bankAccounts" onEdit={handleEditClick} onAdd={handleAddNewClick} onDelete={handleDelete} />
                    <AssetCard title="Credit Cards" assets={currentMonthData.liquidity.creditCards} type="creditCards" onEdit={handleEditClick} onAdd={handleAddNewClick} onDelete={handleDelete} />
                    <AssetCard title="Cash on Hand" assets={[{ id: 0, name: 'Cash', balance: currentMonthData.liquidity.cash }]} type={null} onEdit={() => {}} />
                    <AssetCard title="Receivables" assets={currentMonthData.liquidity.receivables} type="receivables" onEdit={handleEditClick} onAdd={handleAddNewClick} onDelete={handleDelete}/>
                </CardContent>
            </Card>

            {/* Reserves Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Reserves</CardTitle>
                    <CardDescription>Long-term investments and savings.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AssetCard title="Fixed Deposits" assets={currentMonthData.reserves.fixedDeposits} type="fixedDeposits" onEdit={handleEditClick} onAdd={handleAddNewClick} onDelete={handleDelete}/>
                    <AssetCard title="Stocks" assets={currentMonthData.reserves.stocks} type="stocks" onEdit={handleEditClick} onAdd={handleAddNewClick} onDelete={handleDelete}/>
                    <AssetCard title="Crypto" assets={currentMonthData.reserves.crypto} type="crypto" onEdit={handleEditClick} onAdd={handleAddNewClick} onDelete={handleDelete}/>
                    <AssetCard title="Mutual Funds" assets={currentMonthData.reserves.mutualFunds} type="mutualFunds" onEdit={handleEditClick} onAdd={handleAddNewClick} onDelete={handleDelete}/>
                    <AssetCard title="ELSS" assets={currentMonthData.reserves.elss} type="elss" onEdit={handleEditClick} onAdd={handleAddNewClick} onDelete={handleDelete}/>
                </CardContent>
            </Card>

             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Asset</DialogTitle>
                        <DialogDescription>Update the details of your asset.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {editingAsset && Object.keys(editingAsset)
                            .filter(key => key !== 'id' && key !== '__typename' && key !== 'date' && key !== 'name')
                            .map(key => renderField(key, editingAsset[key]))
                        }
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

const AssetCard = ({ title, assets, type, onEdit, onAdd, onDelete }: { title: string, assets: any[], type: AssetType | null, onEdit: (asset: any, type: AssetType) => void, onAdd?: (type: AssetType) => void, onDelete?: (id: number, type: AssetType) => void }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            {onAdd && type && <Button size="sm" variant="ghost" onClick={() => onAdd(type)}><PlusCircle className="h-4 w-4" /></Button>}
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                {assets.map(asset => (
                    <div key={asset.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                        <div>
                            <p className="font-medium">{asset.name || asset.institution || asset.broker || asset.exchange || asset.source}</p>
                            <p className="text-sm text-muted-foreground">
                                ₹{(asset.balance ?? asset.amount ?? asset.due).toLocaleString('en-IN')}
                            </p>
                        </div>
                        {type && (
                             <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(asset, type)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                {onDelete && (
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(asset.id, type)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                             </div>
                        )}
                    </div>
                ))}
                {assets.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No assets added.</p>}
            </div>
        </CardContent>
    </Card>
);
