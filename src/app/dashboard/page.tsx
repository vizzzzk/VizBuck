"use client";

import { useState, useMemo } from "react";
import { DollarSign, IndianRupee, Banknote, Landmark, Wallet, CreditCard, CandlestickChart, ArrowUpRight, ArrowDownRight, PlusCircle, Edit, Trash2 } from "lucide-react";
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
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

// Mock data for dropdowns
const indianBanks = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank", "Other"];
const creditCardIssuers = ["HDFC Bank", "ICICI Bank", "SBI Card", "Axis Bank", "American Express", "Other"];
const stockBrokers = ["Zerodha", "Upstox", "Groww", "ICICI Direct", "HDFC Securities", "Other"];
const cryptoExchanges = ["WazirX", "CoinDCX", "CoinSwitch Kuber", "Binance", "Other"];

// Initial empty state structure
const initialLiquidity = {
    bankAccounts: [{ id: 1, name: 'HDFC Bank', balance: 250000 }],
    cash: 15000,
    creditCards: [{ id: 1, name: 'HDFC Bank', due: 50000 }],
    receivables: [{ id: 1, source: 'Freelance Project', amount: 20000, date: new Date() }],
};

const initialReserves = {
    fixedDeposits: [{id: 1, institution: 'HDFC Bank', amount: 500000}],
    stocks: [{id: 1, broker: 'Zerodha', amount: 750000}],
    crypto: [{id: 1, exchange: 'WazirX', amount: 125000}],
};

const initialIncome = {
    salary: 150000,
    bonus: 25000,
    other: 10000,
};

const initialExpenses = {
    emis: [{ id: 1, name: 'Car Loan', amount: 20000 }],
    other: 45000, // Placeholder for other expenses from statement
};

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [liquidity, setLiquidity] = useState(initialLiquidity);
  const [reserves, setReserves] = useState(initialReserves);
  const [income, setIncome] = useState(initialIncome);
  const [expenses, setExpenses] = useState(initialExpenses);

  // --- Dynamic Form State ---
  const [formLiquidity, setFormLiquidity] = useState(initialLiquidity);
  const [formReserves, setFormReserves] = useState(initialReserves);
  const [formIncome, setFormIncome] = useState(initialIncome);
  const [formExpenses, setFormExpenses] = useState(initialExpenses);
  
  const handleAddItem = (section: string, field: string) => {
    const newId = Date.now();
    if(section === 'liquidity') {
        const currentItems = formLiquidity[field as keyof typeof formLiquidity] as any[];
        setFormLiquidity(prev => ({...prev, [field]: [...currentItems, {id: newId, name: '', balance: 0, due: 0, source: '', amount: 0, date: new Date()}]}))
    } else if (section === 'reserves') {
        const currentItems = formReserves[field as keyof typeof formReserves] as any[];
        setFormReserves(prev => ({...prev, [field]: [...currentItems, {id: newId, institution: '', broker: '', exchange: '', amount: 0}]}))
    } else if (section === 'expenses') {
        const currentItems = formExpenses[field as keyof typeof formExpenses] as any[];
        setFormExpenses(prev => ({...prev, [field]: [...currentItems, {id: newId, name: '', amount: 0}]}))
    }
  }

  const handleRemoveItem = (section: string, field: string, id: number) => {
    if(section === 'liquidity') {
        const currentItems = formLiquidity[field as keyof typeof formLiquidity] as any[];
        setFormLiquidity(prev => ({...prev, [field]: currentItems.filter(item => item.id !== id)}));
    } else if (section === 'reserves') {
        const currentItems = formReserves[field as keyof typeof formReserves] as any[];
        setFormReserves(prev => ({...prev, [field]: currentItems.filter(item => item.id !== id)}));
    } else if (section === 'expenses') {
        const currentItems = formExpenses[field as keyof typeof formExpenses] as any[];
        setFormExpenses(prev => ({...prev, [field]: currentItems.filter(item => item.id !== id)}));
    }
  }
  
  const handleFormChange = (section: string, field: string, id: number, event: React.ChangeEvent<HTMLInputElement> | string, key: string) => {
     const value = typeof event === 'string' ? event : event.target.value;
     const name = typeof event === 'string' ? key : event.target.name;

     const setState = (setter: React.Dispatch<React.SetStateAction<any>>) => {
        setter((prev: any) => ({
            ...prev,
            [field]: (prev[field] as any[]).map(item => item.id === id ? {...item, [name]: value} : item)
        }))
     }

     if(section === 'liquidity') setState(setFormLiquidity);
     else if (section === 'reserves') setState(setFormReserves);
     else if (section === 'expenses') setState(setFormExpenses);
  }

  const handleDateChange = (id: number, date: Date | undefined) => {
      if (!date) return;
      setFormLiquidity(prev => ({
          ...prev,
          receivables: prev.receivables.map(item => item.id === id ? {...item, date} : item)
      }))
  }

  // --- Calculations ---
  const totalBankBalance = useMemo(() => liquidity.bankAccounts.reduce((sum, acc) => sum + acc.balance, 0), [liquidity.bankAccounts]);
  const totalCreditCardDues = useMemo(() => liquidity.creditCards.reduce((sum, card) => sum + card.due, 0), [liquidity.creditCards]);
  const totalReceivables = useMemo(() => liquidity.receivables.reduce((sum, r) => sum + r.amount, 0), [liquidity.receivables]);
  const totalLiquidAssets = useMemo(() => totalBankBalance + liquidity.cash + totalReceivables, [totalBankBalance, liquidity.cash, totalReceivables]);
  
  const totalFixedDeposits = useMemo(() => reserves.fixedDeposits.reduce((sum, fd) => sum + fd.amount, 0), [reserves.fixedDeposits]);
  const totalStocks = useMemo(() => reserves.stocks.reduce((sum, stock) => sum + stock.amount, 0), [reserves.stocks]);
  const totalCrypto = useMemo(() => reserves.crypto.reduce((sum, c) => sum + c.amount, 0), [reserves.crypto]);
  const totalReserves = useMemo(() => totalFixedDeposits + totalStocks + totalCrypto, [totalFixedDeposits, totalStocks, totalCrypto]);

  const netWorth = useMemo(() => totalLiquidAssets + totalReserves - totalCreditCardDues, [totalLiquidAssets, totalReserves, totalCreditCardDues]);
  const totalIncome = useMemo(() => Object.values(income).reduce((sum, val) => sum + Number(val), 0), [income]);
  const totalExpenses = useMemo(() => expenses.emis.reduce((sum, emi) => sum + emi.amount, 0) + expenses.other, [expenses]);

  const openingBalance = useMemo(() => totalBankBalance + liquidity.cash, [totalBankBalance, liquidity.cash]);
  const closingBalance = useMemo(() => openingBalance + totalIncome - totalExpenses, [openingBalance, totalIncome, totalExpenses]);
  
  const liquidityData = [
    { name: 'Bank Accounts', value: totalBankBalance, fill: "hsl(var(--chart-1))" },
    { name: 'Cash', value: liquidity.cash, fill: "hsl(var(--chart-2))" },
    { name: 'Receivables', value: totalReceivables, fill: "hsl(var(--chart-5))" },
  ];

  const reservesData = [
    { name: 'Fixed Deposits', value: totalFixedDeposits },
    { name: 'Stocks', value: totalStocks },
    { name: 'Crypto', value: totalCrypto },
  ];

  const incomeData = [
    { name: 'Salary', value: income.salary, fill: "hsl(var(--chart-1))" },
    { name: 'Bonus', value: income.bonus, fill: "hsl(var(--chart-2))" },
    { name: 'Other', value: income.other, fill: "hsl(var(--chart-3))" },
  ];

  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLiquidity(formLiquidity);
    setReserves(formReserves);
    setIncome(formIncome);
    setExpenses(formExpenses);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
                <h2 className="text-2xl font-bold">Financial Overview</h2>
                <p className="text-muted-foreground">Your financial dashboard at a glance.</p>
            </div>
            <div className="flex items-center gap-2">
                 <Select defaultValue="2024">
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
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
                        <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                                
                                {/* Liquidity Section */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Liquidity</h3>
                                    {/* Bank Accounts */}
                                    <Card className="p-4 space-y-3">
                                        <Label>Bank Accounts</Label>
                                        {formLiquidity.bankAccounts.map((acc, index) => (
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
                                    <Card className="p-4 space-y-3">
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
                                    <Card className="p-4 space-y-3">
                                        <Label>Receivables</Label>
                                        {formLiquidity.receivables.map((r) => (
                                             <div key={r.id} className="grid grid-cols-2 gap-2 items-center">
                                                <Input name="source" placeholder="Source" value={r.source} onChange={(e) => handleFormChange('liquidity', 'receivables', r.id, e, '')} />
                                                <Input name="amount" type="number" placeholder="Amount" value={r.amount} onChange={(e) => handleFormChange('liquidity', 'receivables', r.id, e, '')} />
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant={"outline"} className={cn("col-span-2 justify-start text-left font-normal", !r.date && "text-muted-foreground")}>
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {r.date ? format(r.date, "PPP") : <span>Expected Date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={r.date} onSelect={(d) => handleDateChange(r.id, d)} initialFocus/></PopoverContent>
                                                </Popover>
                                                <Button type="button" variant="ghost" size="icon" className="col-start-2 justify-self-end" onClick={() => handleRemoveItem('liquidity', 'receivables', r.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('liquidity', 'receivables')}><PlusCircle className="mr-2 h-4 w-4"/>Add Receivable</Button>
                                    </Card>

                                    {/* Cash */}
                                    <Card className="p-4 space-y-2">
                                        <Label htmlFor="cash">Cash in Hand (₹)</Label>
                                        <Input id="cash" name="cash" type="number" value={formLiquidity.cash} onChange={(e) => setFormLiquidity({...formLiquidity, cash: Number(e.target.value)})} />
                                    </Card>
                                </div>
                                
                                {/* Reserves & Investments Section */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Reserves & Investments</h3>
                                     {/* Fixed Deposits */}
                                    <Card className="p-4 space-y-3">
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
                                    <Card className="p-4 space-y-3">
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
                                    <Card className="p-4 space-y-3">
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
                                
                                 {/* Income & Expenses Section */}
                                <div className="space-y-4">
                                     <h3 className="font-semibold text-lg">Income & Expenses</h3>
                                     <Card className="p-4 space-y-2">
                                        <Label>Monthly Income (₹)</Label>
                                        <div className="space-y-2">
                                            <Label htmlFor="salary" className="text-xs">Salary</Label>
                                            <Input id="salary" name="salary" type="number" value={formIncome.salary} onChange={(e) => setFormIncome({...formIncome, salary: Number(e.target.value)})} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="bonus" className="text-xs">Bonus</Label>
                                            <Input id="bonus" name="bonus" type="number" value={formIncome.bonus} onChange={(e) => setFormIncome({...formIncome, bonus: Number(e.target.value)})} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="other" className="text-xs">Other Income</Label>
                                            <Input id="other" name="other" type="number" value={formIncome.other} onChange={(e) => setFormIncome({...formIncome, other: Number(e.target.value)})} />
                                        </div>
                                    </Card>
                                     <Card className="p-4 space-y-3">
                                        <Label>EMIs</Label>
                                        {formExpenses.emis.map((emi) => (
                                             <div key={emi.id} className="flex gap-2 items-center">
                                                <Input name="name" placeholder="EMI Name (e.g., Car Loan)" value={emi.name} onChange={(e) => handleFormChange('expenses', 'emis', emi.id, e, '')} />
                                                <Input name="amount" type="number" placeholder="Amount" value={emi.amount} onChange={(e) => handleFormChange('expenses', 'emis', emi.id, e, '')} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('expenses', 'emis', emi.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('expenses', 'emis')}><PlusCircle className="mr-2 h-4 w-4"/>Add EMI</Button>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{netWorth.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground text-green-500 flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              +5.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opening Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{openingBalance.toLocaleString('en-IN')}</div>
             <p className="text-xs text-muted-foreground">As of 1st July</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closing Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{closingBalance.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">As of 31st July</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalIncome.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              For July 2024
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Liquidity Breakdown</CardTitle>
            <CardDescription>
              Snapshot of your current liquid assets. Liabilities are separate.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
             <ChartContainer config={{
                value: { label: "Amount" },
                bankAccounts: { label: "Bank Accounts", color: "hsl(var(--chart-1))" },
                cash: { label: "Cash", color: "hsl(var(--chart-2))" },
                receivables: { label: "Receivables", color: "hsl(var(--chart-5))" },
             }} className="h-[250px] w-full">
               <PieChart>
                 <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                 />
                 <Pie
                    data={liquidityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    labelLine={false}
                    label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        value,
                        index,
                    }) => {
                        const RADIAN = Math.PI / 180
                        const radius = 25 + innerRadius + (outerRadius - innerRadius)
                        const x = cx + radius * Math.cos(-midAngle * RADIAN)
                        const y = cy + radius * Math.sin(-midAngle * RADIAN)

                        return (
                        <text
                            x={x}
                            y={y}
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="fill-foreground text-xs font-semibold"
                        >
                           {liquidityData[index].name} (₹{value.toLocaleString('en-IN')})
                        </text>
                        )
                    }}
                >
                    {liquidityData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                    ))}
                 </Pie>
                 <ChartLegend content={<ChartLegendContent />} />
               </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
         <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Reserves & Investments</CardTitle>
            <CardDescription>
              Long-term assets and investments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
             {reservesData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-md">
                            {item.name === 'Fixed Deposits' && <Landmark className="w-5 h-5 text-muted-foreground" />}
                            {item.name === 'Stocks' && <CandlestickChart className="w-5 h-5 text-muted-foreground" />}
                            {item.name === 'Crypto' && <DollarSign className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-lg">₹{item.value.toLocaleString('en-IN')}</span>
                </div>
             ))}
          </CardContent>
        </Card>
      </div>
      
       <div className="grid gap-6 md:grid-cols-1">
         <Card>
          <CardHeader>
            <CardTitle>Income Sources</CardTitle>
            <CardDescription>
              Breakdown of your income for the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
             <ChartContainer config={{}} className="h-[250px] w-full">
              <BarChart data={incomeData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={80}
                  className="text-sm"
                />
                <XAxis type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                 <Bar dataKey="value" layout="vertical" radius={[0, 4, 4, 0]}>
                    {incomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                 </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
       </div>
    </div>
  );
}

    