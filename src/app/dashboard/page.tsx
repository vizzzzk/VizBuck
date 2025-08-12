
"use client";

import * as React from "react";
import { useMemo } from "react";
import { DollarSign, IndianRupee, Banknote, Landmark, Wallet, CreditCard, CandlestickChart, ArrowUpRight, PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useFinancials } from "@/hooks/use-financials";


// Mock data for dropdowns
const indianBanks = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank", "Other"];
const creditCardIssuers = ["HDFC Bank", "ICICI Bank", "SBI Card", "Axis Bank", "American Express", "Other"];
const stockBrokers = ["Zerodha", "Upstox", "Groww", "ICICI Direct", "HDFC Securities", "Other"];
const cryptoExchanges = ["WazirX", "CoinDCX", "CoinSwitch Kuber", "Binance", "Other"];


export default function DashboardPage() {
  const [open, setOpen] = React.useState(false);
  const { 
    liquidity, 
    reserves, 
    transactions,
    setLiquidity,
    setReserves 
  } = useFinancials();

  // --- Dynamic Form State ---
  const [formLiquidity, setFormLiquidity] = React.useState(liquidity);
  const [formReserves, setFormReserves] = React.useState(reserves);

  // Reset form state when dialog opens
  React.useEffect(() => {
    if(open) {
      setFormLiquidity(liquidity);
      setFormReserves(reserves);
    }
  }, [open, liquidity, reserves]);
  
  
  const handleAddItem = (section: string, field: string) => {
    const newId = Date.now();
    if(section === 'liquidity') {
        const currentItems = formLiquidity[field as keyof typeof formLiquidity] as any[];
        setFormLiquidity(prev => ({...prev, [field]: [...currentItems, {id: newId, name: '', balance: 0, due: 0, source: '', amount: 0, date: new Date()}]}))
    } else if (section === 'reserves') {
        const currentItems = formReserves[field as keyof typeof formReserves] as any[];
        setFormReserves(prev => ({...prev, [field]: [...currentItems, {id: newId, institution: '', broker: '', exchange: '', amount: 0}]}))
    }
  }

  const handleRemoveItem = (section: string, field: string, id: number) => {
    if(section === 'liquidity') {
        const currentItems = formLiquidity[field as keyof typeof formLiquidity] as any[];
        setFormLiquidity(prev => ({...prev, [field]: currentItems.filter(item => item.id !== id)}));
    } else if (section === 'reserves') {
        const currentItems = formReserves[field as keyof typeof formReserves] as any[];
        setFormReserves(prev => ({...prev, [field]: currentItems.filter(item => item.id !== id)}));
    }
  }
  
  const handleFormChange = (section: string, field: string, id: number, event: React.ChangeEvent<HTMLInputElement> | string, key: string) => {
     const rawValue = typeof event === 'string' ? event : event.target.value;
     const name = typeof event === 'string' ? key : event.target.name;
     const value = name === 'balance' || name === 'due' || name === 'amount' ? Number(rawValue) : rawValue;


     const setState = (setter: React.Dispatch<React.SetStateAction<any>>) => {
        setter((prev: any) => ({
            ...prev,
            [field]: (prev[field] as any[]).map(item => item.id === id ? {...item, [name]: value} : item)
        }))
     }

     if(section === 'liquidity') setFormLiquidity(setFormLiquidity);
     else if (section === 'reserves') setFormReserves(setFormReserves);
  }

  const handleDateChange = (id: number, date: Date | undefined) => {
      if (!date) return;
      setFormLiquidity(prev => ({
          ...prev,
          receivables: prev.receivables.map(item => item.id === id ? {...item, date} : item)
      }))
  }

  // --- Calculations ---
  const totalBankBalance = useMemo(() => liquidity.bankAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0), [liquidity.bankAccounts]);
  const totalCreditCardDues = useMemo(() => liquidity.creditCards.reduce((sum, card) => sum + Number(card.due || 0), 0), [liquidity.creditCards]);
  const totalReceivables = useMemo(() => liquidity.receivables.reduce((sum, r) => sum + Number(r.amount || 0), 0), [liquidity.receivables]);
  const totalCash = useMemo(() => Number(liquidity.cash || 0), [liquidity.cash]);
  const totalLiquidAssets = useMemo(() => totalBankBalance + totalCash + totalReceivables, [totalBankBalance, totalCash, totalReceivables]);
  const totalExpenses = useMemo(() => transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0), [transactions]);
  
  const totalFixedDeposits = useMemo(() => reserves.fixedDeposits.reduce((sum, fd) => sum + Number(fd.amount || 0), 0), [reserves.fixedDeposits]);
  const totalStocks = useMemo(() => reserves.stocks.reduce((sum, stock) => sum + Number(stock.amount || 0), 0), [reserves.stocks]);
  const totalCrypto = useMemo(() => reserves.crypto.reduce((sum, c) => sum + Number(c.amount || 0), 0), [reserves.crypto]);
  const totalReserves = useMemo(() => totalFixedDeposits + totalStocks + totalCrypto, [totalFixedDeposits, totalStocks, totalCrypto]);

  const openingBalance = useMemo(() => totalLiquidAssets - totalCreditCardDues, [totalLiquidAssets, totalCreditCardDues]);
  const closingBalance = useMemo(() => openingBalance - totalExpenses, [openingBalance, totalExpenses]);
  const netWorth = useMemo(() => totalLiquidAssets + totalReserves - totalCreditCardDues, [totalLiquidAssets, totalReserves, totalCreditCardDues]);
  
  const liquidityData = [
    { name: 'Bank Accounts', value: totalBankBalance, fill: "hsl(var(--chart-1))" },
    { name: 'Cash', value: totalCash, fill: "hsl(var(--chart-2))" },
    { name: 'Receivables', value: totalReceivables, fill: "hsl(var(--chart-5))" },
    { name: 'Credit Card Dues', value: -totalCreditCardDues, fill: "hsl(var(--chart-3))" },
  ].filter(item => item.value !== 0);

  const reservesData = [
    { name: 'Fixed Deposits', value: totalFixedDeposits, fill: "hsl(var(--chart-1))" },
    { name: 'Stocks', value: totalStocks, fill: "hsl(var(--chart-4))" },
    { name: 'Crypto', value: totalCrypto, fill: "hsl(var(--chart-2))" },
  ];

  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLiquidity(formLiquidity);
    setReserves(formReserves);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
                <p className="text-muted-foreground">Your financial dashboard at a glance.</p>
            </div>
            <div className="flex items-center gap-2">
                 <Select defaultValue="2025">
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                </Select>
                 <Select defaultValue="july">
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="july">July</SelectItem>
                        <SelectItem value="august">August</SelectItem>
                    </SelectContent>
                </Select>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Financials
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Edit Your Financials</DialogTitle>
                            <DialogDescription>
                                Update your current financial standing. This will update your dashboard.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSaveChanges}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 max-h-[70vh] overflow-y-auto pr-4">
                                
                                {/* Liquidity Section */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-xl text-primary">Liquidity</h3>
                                    {/* Bank Accounts */}
                                    <Card className="p-4 space-y-3 bg-muted/30 border-dashed">
                                        <Label>Bank Accounts</Label>
                                        {formLiquidity.bankAccounts.map((acc) => (
                                            <div key={acc.id} className="flex gap-2 items-center">
                                                <Select value={acc.name} onValueChange={(val) => handleFormChange('liquidity', 'bankAccounts', acc.id, val, 'name')}>
                                                    <SelectTrigger><SelectValue placeholder="Select Bank"/></SelectTrigger>
                                                    <SelectContent>{indianBanks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <Input name="balance" type="number" placeholder="Balance" value={acc.balance} onChange={(e) => handleFormChange('liquidity', 'bankAccounts', acc.id, e, '')} />
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
                                                <Input name="due" type="number" placeholder="Dues" value={card.due} onChange={(e) => handleFormChange('liquidity', 'creditCards', card.id, e, '')} />
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
                                                    <Input name="source" placeholder="Source" value={r.source} onChange={(e) => handleFormChange('liquidity', 'receivables', r.id, e, '')} />
                                                    <Input name="amount" type="number" placeholder="Amount" value={r.amount} onChange={(e) => handleFormChange('liquidity', 'receivables', r.id, e, '')} />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('liquidity', 'receivables', r.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                </div>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !r.date && "text-muted-foreground")}>
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {r.date ? format(r.date, "PPP") : <span>Expected Date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={r.date} onSelect={(d) => handleDateChange(r.id, d)} initialFocus/></PopoverContent>
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
                                                <Input name="institution" placeholder="Institution" value={fd.institution} onChange={(e) => handleFormChange('reserves', 'fixedDeposits', fd.id, e, '')} />
                                                <Input name="amount" type="number" placeholder="Amount" value={fd.amount} onChange={(e) => handleFormChange('reserves', 'fixedDeposits', fd.id, e, '')} />
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
                                                <Input name="amount" type="number" placeholder="Amount" value={s.amount} onChange={(e) => handleFormChange('reserves', 'stocks', s.id, e, '')} />
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
                                                <Input name="amount" type="number" placeholder="Amount" value={c.amount} onChange={(e) => handleFormChange('reserves', 'crypto', c.id, e, '')} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('reserves', 'crypto', c.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('reserves', 'crypto')}><PlusCircle className="mr-2 h-4 w-4"/>Add Crypto</Button>
                                    </Card>
                                </div>
                                
                            </div>
                            <DialogFooter className="pt-6">
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{netWorth.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground flex items-center pt-1">
              <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-green-500">+5.2%</span>&nbsp;from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opening Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{openingBalance.toLocaleString('en-IN')}</div>
             <p className="text-xs text-muted-foreground pt-1">As of start of July</p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closing Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{closingBalance.toLocaleString('en-IN')}</div>
             <p className="text-xs text-muted-foreground pt-1">After all expenses</p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-lg">
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

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3 bg-card shadow-lg">
          <CardHeader>
            <CardTitle>Liquidity Breakdown</CardTitle>
            <CardDescription>
              Your current assets vs. liabilities.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
             <ChartContainer config={{
                value: { label: "Amount" },
                bankAccounts: { label: "Bank Accounts", color: "hsl(var(--chart-1))" },
                cash: { label: "Cash", color: "hsl(var(--chart-2))" },
                receivables: { label: "Receivables", color: "hsl(var(--chart-5))" },
                creditCardDues: { label: "Credit Card Dues", color: "hsl(var(--chart-3))" },
             }} className="h-[350px] w-full">
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
                    outerRadius={140}
                    innerRadius={90}
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
         <Card className="md:col-span-2 bg-card shadow-lg">
          <CardHeader>
            <CardTitle>Reserves & Investments</CardTitle>
            <CardDescription>
              Your long-term asset allocation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
             {reservesData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-muted/50 rounded-lg" style={{ color: item.fill }}>
                            {item.name === 'Fixed Deposits' && <Landmark className="w-6 h-6" />}
                            {item.name === 'Stocks' && <CandlestickChart className="w-6 h-6" />}
                            {item.name === 'Crypto' && <DollarSign className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className="font-semibold text-card-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Total Value</p>
                        </div>
                    </div>
                    <span className="font-bold text-xl text-card-foreground">₹{item.value.toLocaleString('en-IN')}</span>
                </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    