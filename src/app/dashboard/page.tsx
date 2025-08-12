
"use client";

import * as React from "react";
import { useMemo } from "react";
import { DollarSign, IndianRupee, Banknote, Landmark, Wallet, CreditCard, CandlestickChart, ArrowUpRight, PlusCircle, Edit, Trash2, CalendarIcon, ArrowRight, TrendingUp, PiggyBank, Briefcase, BarChart as BarChartIcon, Gem, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useFinancials, Liquidity, Reserves } from "@/hooks/use-financials";


// Mock data for dropdowns
const indianBanks = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank", "Other"];
const creditCardIssuers = ["HDFC Bank", "ICICI Bank", "SBI Card", "Axis Bank", "American Express", "Other"];
const stockBrokers = ["Zerodha", "Upstox", "Groww", "ICICI Direct", "HDFC Securities", "Other"];
const cryptoExchanges = ["WazirX", "CoinDCX", "CoinSwitch Kuber", "Binance", "Other"];
const mutualFundHouses = ["Axis Mutual Fund", "Mirae Asset Mutual Fund", "Parag Parikh Mutual Fund", "UTI Mutual Fund", "Other"];


export default function DashboardPage() {
  const [open, setOpen] = React.useState(false);
  const { 
    currentMonthData,
    reserves,
    isDataLoaded,
    updateLiquidity,
    updateReserves,
    currentMonth,
    setCurrentMonth,
    availableMonths,
    closeMonth,
  } = useFinancials();

  // --- Dynamic Form State ---
  const [formLiquidity, setFormLiquidity] = React.useState(currentMonthData.liquidity);
  const [formReserves, setFormReserves] = React.useState(reserves);

  // Reset form state when dialog opens or data loads
  React.useEffect(() => {
    if(isDataLoaded) {
      setFormLiquidity(currentMonthData.liquidity);
      setFormReserves(reserves);
    }
  }, [open, currentMonthData, reserves, isDataLoaded]);
  
  
  const handleAddItem = (section: 'liquidity' | 'reserves', field: keyof Liquidity | keyof Reserves) => {
    const newId = Date.now();
    const newItem = {id: newId, name: '', institution: '', broker: '', exchange: '', source: '', balance: 0, due: 0, amount: 0, date: new Date()};

    if (section === 'liquidity') {
        setFormLiquidity(prev => {
            const items = prev[field as keyof Liquidity] as any[];
            return {...prev, [field]: [...items, newItem]};
        });
    } else if (section === 'reserves') {
        setFormReserves(prev => {
            const items = prev[field as keyof Reserves] as any[];
            return {...prev, [field]: [...items, newItem]};
        });
    }
  }

  const handleRemoveItem = (section: 'liquidity' | 'reserves', field: keyof Liquidity | keyof Reserves, id: number) => {
     if(section === 'liquidity') {
         setFormLiquidity(prev => ({...prev, [field]: (prev[field as keyof Liquidity] as any[]).filter(item => item.id !== id)}));
     } else if (section === 'reserves') {
         setFormReserves(prev => ({...prev, [field]: (prev[field as keyof Reserves] as any[]).filter(item => item.id !== id)}));
     }
  }
  
  const handleFormChange = (section: 'liquidity' | 'reserves', field: string, id: number, event: React.ChangeEvent<HTMLInputElement> | string, key: string) => {
     const rawValue = typeof event === 'string' ? event : event.target.value;
     const name = typeof event === 'string' ? key : event.target.name;
     const value = name === 'balance' || name === 'due' || name === 'amount' ? Number(rawValue) : rawValue;


     const updateState = (prevState: any) => {
        if(!prevState || !prevState[field]) return prevState;
        return {
            ...prevState,
            [field]: (prevState[field] as any[]).map(item => item.id === id ? {...item, [name]: value} : item)
        }
     }

     if(section === 'liquidity') setFormLiquidity(updateState);
     else if (section === 'reserves') setFormReserves(updateState);
  }

  const handleDateChange = (id: number, date: Date | undefined) => {
      if (!date) return;
      setFormLiquidity(prev => ({
          ...prev,
          receivables: prev.receivables.map(item => item.id === id ? {...item, date} : item)
      }))
  }
  
   const handleSingleFieldChange = (section: 'reserves', field: keyof Reserves, value: any) => {
    if (section === 'reserves') {
        setFormReserves(prev => ({...prev, [field]: value}));
    }
   }


  // --- Calculations ---
  const { 
    totalCreditCardDues,
    totalReceivables,
    totalReserves,
    openingBalance,
    closingBalance,
    netWorth,
    closingBankBalance,
    closingCash
  } = useMemo(() => {
    if (!isDataLoaded || !currentMonthData) {
        return { totalCreditCardDues: 0, totalReceivables: 0, totalReserves: 0, openingBalance: 0, closingBalance: 0, netWorth: 0, closingBankBalance: 0, closingCash: 0 };
    }
    const { liquidity, transactions, reserves: monthReserves } = currentMonthData;

    const totalBankBalance = liquidity.bankAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
    const totalCreditCardDues = liquidity.creditCards.reduce((sum, card) => sum + Number(card.due || 0), 0);
    const totalReceivables = liquidity.receivables.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const totalCash = Number(liquidity.cash || 0);
    
    const totalReserves = Object.values(monthReserves).flat().reduce((sum, item) => {
        if (typeof item === 'number') return sum + item;
        if (item && typeof item.amount === 'number') return sum + item.amount;
        return sum;
    }, 0);

    const openingBalance = liquidity.openingBalance;
    
    const credits = transactions
      .filter(t => t.type === 'CR')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const expensesFromBank = transactions
      .filter(t => t.paymentMethod !== 'Cash' && t.type === 'DR')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    const expensesFromCash = transactions
      .filter(t => t.paymentMethod === 'Cash' && t.type === 'DR')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      
    const closingBankBalance = totalBankBalance + credits - expensesFromBank;
    const closingCash = totalCash - expensesFromCash;
    const totalLiquidAssets = closingBankBalance + closingCash + totalReceivables;
    
    const closingBalance = totalLiquidAssets - totalCreditCardDues;
    const netWorth = closingBalance + totalReserves;
    
    return {
        totalCreditCardDues,
        totalReceivables,
        totalReserves,
        openingBalance,
        closingBalance,
        netWorth,
        closingBankBalance,
        closingCash,
    };
  }, [currentMonthData, isDataLoaded]);

  
  const liquidityData = [
    { name: 'Bank Accounts', value: closingBankBalance, fill: "hsl(var(--chart-1))" },
    { name: 'Cash', value: closingCash, fill: "hsl(var(--chart-2))" },
    { name: 'Receivables', value: totalReceivables, fill: "hsl(var(--chart-5))" },
    { name: 'Credit Card Dues', value: totalCreditCardDues, fill: "hsl(var(--chart-3))" },
  ].filter(item => item.value !== 0);

  const reservesData = [
    { name: 'Fixed Deposits', value: reserves.fixedDeposits.reduce((s, i) => s + i.amount, 0), fill: "hsl(var(--chart-1))", icon: Landmark },
    { name: 'Stocks', value: reserves.stocks.reduce((s, i) => s + i.amount, 0), fill: "hsl(var(--chart-4))", icon: CandlestickChart },
    { name: 'Crypto', value: reserves.crypto.reduce((s, i) => s + i.amount, 0), fill: "hsl(var(--chart-2))", icon: Gem },
    { name: 'Mutual Funds', value: reserves.mutualFunds.reduce((s, i) => s + i.amount, 0), fill: "hsl(var(--chart-5))", icon: BarChartIcon },
    { name: 'ELSS', value: reserves.elss.reduce((s, i) => s + i.amount, 0), fill: "hsl(var(--chart-3))", icon: Briefcase },
    { name: 'NPS', value: reserves.nps, fill: "hsl(var(--chart-1))", icon: PiggyBank },
    { name: 'PF', value: reserves.pf, fill: "hsl(var(--chart-2))", icon: Briefcase },
    { name: 'Gold', value: reserves.gold, fill: "hsl(var(--chart-4))", icon: Star },
    { name: 'ESOP', value: reserves.esop, fill: "hsl(var(--chart-5))", icon: TrendingUp },
  ].filter(item => item.value > 0);

  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateLiquidity(formLiquidity);
    updateReserves(formReserves);
    setOpen(false);
  }

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split("-");
    setCurrentMonth({ year: parseInt(year), month: parseInt(month) });
  };
  
  if (!isDataLoaded) {
      return <div className="flex h-[calc(100vh-8rem)] items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
  }

  const formattedCurrentMonth = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
                 <Badge variant="outline" className="text-base py-1 px-3 bg-card text-foreground border-primary">
                    {format(new Date(currentMonth.year, currentMonth.month - 1), "MMMM yyyy")}
                </Badge>
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
                <Button onClick={closeMonth}><ArrowRight className="h-4 w-4 mr-2"/> Close Month & Advance</Button>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Assets
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Edit Your Financial Assets</DialogTitle>
                            <DialogDescription>
                                Update your current financial standing. This will update your dashboard for the selected month.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSaveChanges}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 max-h-[70vh] overflow-y-auto pr-4">
                                
                                {/* Liquidity Section */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-xl text-primary">Liquidity (Current Assets)</h3>
                                    {/* Bank Accounts */}
                                    <Card className="p-4 space-y-3 bg-muted/30 border-dashed">
                                        <Label>Bank Accounts</Label>
                                        {formLiquidity.bankAccounts.map((acc) => (
                                            <div key={acc.id} className="flex gap-2 items-center">
                                                <Select value={acc.name} onValueChange={(val) => handleFormChange('liquidity', 'bankAccounts', acc.id, val, 'name')}>
                                                    <SelectTrigger><SelectValue placeholder="Select Bank"/></SelectTrigger>
                                                    <SelectContent>{indianBanks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <Input name="balance" type="number" placeholder="Balance" value={acc.balance} onChange={(e) => handleFormChange('liquidity', 'bankAccounts', acc.id, e, 'balance')} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('liquidity', 'bankAccounts', acc.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('liquidity', 'bankAccounts')}><PlusCircle className="mr-2 h-4 w-4"/>Add Bank</Button>
                                    </Card>
                                    
                                    {/* Credit Cards */}
                                    <Card className="p-4 space-y-3 bg-muted/30 border-dashed">
                                        <Label>Credit Card Dues</Label>
                                        {formLiquidity.creditCards.map((card) => (
                                             <div key={card.id} className="flex gap-2 items-center">
                                                <Select value={card.name} onValueChange={(val) => handleFormChange('liquidity', 'creditCards', card.id, val, 'name')}>
                                                    <SelectTrigger><SelectValue placeholder="Select Issuer"/></SelectTrigger>
                                                    <SelectContent>{creditCardIssuers.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <Input name="due" type="number" placeholder="Dues" value={card.due} onChange={(e) => handleFormChange('liquidity', 'creditCards', card.id, e, 'due')} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('liquidity', 'creditCards', card.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('liquidity', 'creditCards')}><PlusCircle className="mr-2 h-4 w-4"/>Add Card</Button>
                                    </Card>

                                     {/* Receivables */}
                                    <Card className="p-4 space-y-3 bg-muted/30 border-dashed">
                                        <Label>Receivables</Label>
                                        {formLiquidity.receivables.map((r) => (
                                             <div key={r.id} className="space-y-2">
                                                <div className="flex gap-2 items-center">
                                                    <Input name="source" placeholder="Source" value={r.source} onChange={(e) => handleFormChange('liquidity', 'receivables', r.id, e, 'source')} />
                                                    <Input name="amount" type="number" placeholder="Amount" value={r.amount} onChange={(e) => handleFormChange('liquidity', 'receivables', r.id, e, 'amount')} />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('liquidity', 'receivables', r.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                </div>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !r.date && "text-muted-foreground")}>
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {r.date ? format(new Date(r.date), "PPP") : <span>Expected Date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={new Date(r.date)} onSelect={(d) => handleDateChange(r.id, d)} initialFocus/></PopoverContent>
                                                </Popover>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('liquidity', 'receivables')}><PlusCircle className="mr-2 h-4 w-4"/>Add Receivable</Button>
                                    </Card>

                                    {/* Cash */}
                                    <Card className="p-4 space-y-2 bg-muted/30 border-dashed">
                                        <Label htmlFor="cash">Cash in Hand (₹)</Label>
                                        <Input id="cash" name="cash" type="number" value={formLiquidity.cash} onChange={(e) => setFormLiquidity({...formLiquidity, cash: Number(e.target.value)})} />
                                    </Card>
                                </div>
                                
                                {/* Reserves & Investments Section */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-xl text-primary">Reserves & Investments</h3>
                                     {/* Fixed Deposits */}
                                    <Card className="p-4 space-y-3 bg-muted/30 border-dashed">
                                        <Label>Fixed Deposits</Label>
                                        {formReserves.fixedDeposits.map((fd) => (
                                             <div key={fd.id} className="flex gap-2 items-center">
                                                <Input name="institution" placeholder="Institution" value={fd.institution} onChange={(e) => handleFormChange('reserves', 'fixedDeposits', fd.id, e, 'institution')} />
                                                <Input name="amount" type="number" placeholder="Amount" value={fd.amount} onChange={(e) => handleFormChange('reserves', 'fixedDeposits', fd.id, e, 'amount')} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('reserves', 'fixedDeposits', fd.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('reserves', 'fixedDeposits')}><PlusCircle className="mr-2 h-4 w-4"/>Add FD</Button>
                                    </Card>
                                    {/* Stocks */}
                                    <Card className="p-4 space-y-3 bg-muted/30 border-dashed">
                                        <Label>Stocks</Label>
                                        {formReserves.stocks.map((s) => (
                                             <div key={s.id} className="flex gap-2 items-center">
                                                <Select value={s.broker} onValueChange={(val) => handleFormChange('reserves', 'stocks', s.id, val, 'broker')}>
                                                    <SelectTrigger><SelectValue placeholder="Select Broker"/></SelectTrigger>
                                                    <SelectContent>{stockBrokers.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <Input name="amount" type="number" placeholder="Amount" value={s.amount} onChange={(e) => handleFormChange('reserves', 'stocks', s.id, e, 'amount')} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('reserves', 'stocks', s.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('reserves', 'stocks')}><PlusCircle className="mr-2 h-4 w-4"/>Add Stocks</Button>
                                    </Card>
                                    {/* Crypto */}
                                    <Card className="p-4 space-y-3 bg-muted/30 border-dashed">
                                        <Label>Crypto</Label>
                                        {formReserves.crypto.map((c) => (
                                             <div key={c.id} className="flex gap-2 items-center">
                                                 <Select value={c.exchange} onValueChange={(val) => handleFormChange('reserves', 'crypto', c.id, val, 'exchange')}>
                                                    <SelectTrigger><SelectValue placeholder="Select Exchange"/></SelectTrigger>
                                                    <SelectContent>{cryptoExchanges.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <Input name="amount" type="number" placeholder="Amount" value={c.amount} onChange={(e) => handleFormChange('reserves', 'crypto', c.id, e, 'amount')} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('reserves', 'crypto', c.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('reserves', 'crypto')}><PlusCircle className="mr-2 h-4 w-4"/>Add Crypto</Button>
                                    </Card>

                                    {/* Mutual Funds */}
                                    <Card className="p-4 space-y-3 bg-muted/30 border-dashed">
                                        <Label>Mutual Funds</Label>
                                        {formReserves.mutualFunds.map((mf) => (
                                             <div key={mf.id} className="flex gap-2 items-center">
                                                <Select value={mf.name} onValueChange={(val) => handleFormChange('reserves', 'mutualFunds', mf.id, val, 'name')}>
                                                    <SelectTrigger><SelectValue placeholder="Select Fund House"/></SelectTrigger>
                                                    <SelectContent>{mutualFundHouses.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <Input name="amount" type="number" placeholder="Amount" value={mf.amount} onChange={(e) => handleFormChange('reserves', 'mutualFunds', mf.id, e, 'amount')} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('reserves', 'mutualFunds', mf.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('reserves', 'mutualFunds')}><PlusCircle className="mr-2 h-4 w-4"/>Add MF</Button>
                                    </Card>
                                    
                                     {/* ELSS */}
                                    <Card className="p-4 space-y-3 bg-muted/30 border-dashed">
                                        <Label>ELSS</Label>
                                        {formReserves.elss.map((el) => (
                                             <div key={el.id} className="flex gap-2 items-center">
                                                <Select value={el.name} onValueChange={(val) => handleFormChange('reserves', 'elss', el.id, val, 'name')}>
                                                    <SelectTrigger><SelectValue placeholder="Select Fund House"/></SelectTrigger>
                                                    <SelectContent>{mutualFundHouses.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <Input name="amount" type="number" placeholder="Amount" value={el.amount} onChange={(e) => handleFormChange('reserves', 'elss', el.id, e, 'amount')} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('reserves', 'elss', el.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('reserves', 'elss')}><PlusCircle className="mr-2 h-4 w-4"/>Add ELSS</Button>
                                    </Card>

                                    <div className="grid grid-cols-2 gap-4">
                                      <Card className="p-4 space-y-2 bg-muted/30 border-dashed">
                                          <Label htmlFor="nps">NPS (₹)</Label>
                                          <Input id="nps" name="nps" type="number" value={formReserves.nps} onChange={(e) => handleSingleFieldChange('reserves', 'nps', Number(e.target.value))} />
                                      </Card>
                                      <Card className="p-4 space-y-2 bg-muted/30 border-dashed">
                                          <Label htmlFor="pf">PF (₹)</Label>
                                          <Input id="pf" name="pf" type="number" value={formReserves.pf} onChange={(e) => handleSingleFieldChange('reserves', 'pf', Number(e.target.value))} />
                                      </Card>
                                      <Card className="p-4 space-y-2 bg-muted/30 border-dashed">
                                          <Label htmlFor="gold">Gold (₹)</Label>
                                          <Input id="gold" name="gold" type="number" value={formReserves.gold} onChange={(e) => handleSingleFieldChange('reserves', 'gold', Number(e.target.value))} />
                                      </Card>
                                      <Card className="p-4 space-y-2 bg-muted/30 border-dashed">
                                          <Label htmlFor="esop">ESOP (₹)</Label>
                                          <Input id="esop" name="esop" type="number" value={formReserves.esop} onChange={(e) => handleSingleFieldChange('reserves', 'esop', Number(e.target.value))} />
                                      </Card>
                                    </div>
                                </div>
                                
                            </div>
                            <DialogFooter className="pt-6 border-t mt-4">
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{netWorth.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground flex items-center pt-1">
              Total value of your assets & reserves
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opening Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{openingBalance.toLocaleString('en-IN')}</div>
             <p className="text-xs text-muted-foreground pt-1">As of start of {format(new Date(currentMonth.year, currentMonth.month -1), "MMMM")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closing Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{closingBalance.toLocaleString('en-IN')}</div>
             <p className="text-xs text-muted-foreground pt-1">After all expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reserves</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalReserves.toLocaleString('en-IN')}</div>
             <p className="text-xs text-muted-foreground pt-1">FDs, Stocks, & Crypto</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Liquidity Breakdown</CardTitle>
            <CardDescription>
              Your current assets vs. liabilities for {format(new Date(currentMonth.year, currentMonth.month-1), "MMMM yyyy")}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
             <ChartContainer config={{
                value: { label: "Amount" },
                bankAccounts: { label: "Bank Accounts", color: "hsl(var(--chart-1))" },
                cash: { label: "Cash", color: "hsl(var(--chart-2))" },
                receivables: { label: "Receivables", color: "hsl(var(--chart-5))" },
                creditCardDues: { label: "Credit Card Dues", color: "hsl(var(--chart-3))" },
             }} className="h-[300px] w-full">
               <PieChart>
                 <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent 
                        className="bg-background/80 backdrop-blur-sm"
                        hideLabel 
                    />}
                 />
                 <Pie
                    data={liquidityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={80}
                    strokeWidth={2}
                    stroke="hsl(var(--border))"
                 >
                    {liquidityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                 </Pie>
                 <ChartLegend content={<ChartLegendContent nameKey="name" />} />
               </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Reserves & Investments</CardTitle>
            <CardDescription>
              Your long-term asset allocation (continuous).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 pt-4">
             {reservesData.length > 0 ? reservesData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg" style={{ color: item.fill }}>
                        <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-card-foreground">{item.name}</p>
                        <p className="text-lg font-bold text-card-foreground">₹{item.value.toLocaleString('en-IN')}</p>
                    </div>
                </div>
             )) : (
                <div className="flex items-center justify-center h-full text-muted-foreground col-span-2">
                    No reserves added yet.
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    