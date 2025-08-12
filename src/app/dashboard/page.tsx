"use client";

import { useState, useMemo } from "react";
import { DollarSign, IndianRupee, Banknote, Landmark, Wallet, CreditCard, CandlestickChart, ArrowUpRight, ArrowDownRight, PlusCircle, Edit } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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


const initialLiquidity = {
    bankAccounts: 250000,
    cash: 15000,
    creditCards: 50000,
    receivables: 20000,
};

const initialReserves = {
    fixedDeposits: 500000,
    stocks: 750000,
    crypto: 125000,
};

const initialIncome = {
    salary: 150000,
    bonus: 25000,
    other: 10000,
}

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [liquidity, setLiquidity] = useState(initialLiquidity);
  const [reserves, setReserves] = useState(initialReserves);
  const [income, setIncome] = useState(initialIncome);

  const netWorth = useMemo(() => {
    const totalLiquidity = Object.values(liquidity).reduce((sum, val) => sum + val, 0) - liquidity.creditCards * 2; // Subtract CC debt
    const totalReserves = Object.values(reserves).reduce((sum, val) => sum + val, 0);
    return totalLiquidity + totalReserves;
  }, [liquidity, reserves]);
  
  const totalIncome = useMemo(() => Object.values(income).reduce((sum, val) => sum + val, 0), [income]);

  const liquidityData = [
    { name: 'Bank Accounts', value: liquidity.bankAccounts, fill: "hsl(var(--chart-1))" },
    { name: 'Cash', value: liquidity.cash, fill: "hsl(var(--chart-2))" },
    { name: 'Credit Cards', value: -liquidity.creditCards, fill: "hsl(var(--chart-4))" },
    { name: 'Receivables', value: liquidity.receivables, fill: "hsl(var(--chart-5))" },
  ];

  const reservesData = [
    { name: 'Fixed Deposits', value: reserves.fixedDeposits },
    { name: 'Stocks', value: reserves.stocks },
    { name: 'Crypto', value: reserves.crypto },
  ];

  const incomeData = [
    { name: 'Salary', value: income.salary, fill: "hsl(var(--chart-1))" },
    { name: 'Bonus', value: income.bonus, fill: "hsl(var(--chart-2))" },
    { name: 'Other', value: income.other, fill: "hsl(var(--chart-3))" },
  ];

  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    setLiquidity({
        bankAccounts: Number(data.bankAccounts),
        cash: Number(data.cash),
        creditCards: Number(data.creditCards),
        receivables: Number(data.receivables),
    });

    setReserves({
        fixedDeposits: Number(data.fixedDeposits),
        stocks: Number(data.stocks),
        crypto: Number(data.crypto),
    });

    setIncome({
        salary: Number(data.salary),
        bonus: Number(data.bonus),
        other: Number(data.other),
    });

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
                        <SelectItem value="january">January</SelectItem>
                        <SelectItem value="february">February</SelectItem>
                        <SelectItem value="march">March</SelectItem>
                        <SelectItem value="april">April</SelectItem>
                        <SelectItem value="may">May</SelectItem>
                        <SelectItem value="june">June</SelectItem>
                        <SelectItem value="july">July</SelectItem>
                        <SelectItem value="august">August</SelectItem>
                        <SelectItem value="september">September</SelectItem>
                        <SelectItem value="october">October</SelectItem>
                        <SelectItem value="november">November</SelectItem>
                        <SelectItem value="december">December</SelectItem>
                    </SelectContent>
                </Select>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Your Financials</DialogTitle>
                            <DialogDescription>
                                Update your current financial standing. This will update your dashboard.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSaveChanges}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
                                <Card>
                                    <CardHeader><CardTitle className="text-lg">Liquidity</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="bankAccounts">Bank Accounts (₹)</Label>
                                            <Input id="bankAccounts" name="bankAccounts" type="number" defaultValue={liquidity.bankAccounts} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="cash">Cash (₹)</Label>
                                            <Input id="cash" name="cash" type="number" defaultValue={liquidity.cash} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="creditCards">Credit Card Dues (₹)</Label>
                                            <Input id="creditCards" name="creditCards" type="number" defaultValue={liquidity.creditCards} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="receivables">Receivables (₹)</Label>
                                            <Input id="receivables" name="receivables" type="number" defaultValue={liquidity.receivables} />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                     <CardHeader><CardTitle className="text-lg">Reserves</CardTitle></CardHeader>
                                     <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fixedDeposits">Fixed Deposits (₹)</Label>
                                            <Input id="fixedDeposits" name="fixedDeposits" type="number" defaultValue={reserves.fixedDeposits} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="stocks">Stocks (₹)</Label>
                                            <Input id="stocks" name="stocks" type="number" defaultValue={reserves.stocks} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="crypto">Crypto (₹)</Label>
                                            <Input id="crypto" name="crypto" type="number" defaultValue={reserves.crypto} />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                     <CardHeader><CardTitle className="text-lg">Monthly Income</CardTitle></CardHeader>
                                     <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="salary">Salary (₹)</Label>
                                            <Input id="salary" name="salary" type="number" defaultValue={income.salary} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="bonus">Bonus (₹)</Label>
                                            <Input id="bonus" name="bonus" type="number" defaultValue={income.bonus} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="other">Other Income (₹)</Label>
                                            <Input id="other" name="other" type="number" defaultValue={income.other} />
                                        </div>
                                    </CardContent>
                                </Card>
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
            <div className="text-2xl font-bold">₹2,15,000</div>
             <p className="text-xs text-muted-foreground">As of 1st July</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closing Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,35,000</div>
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
              Snapshot of your current liquid assets and liabilities.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
             <ChartContainer config={{}} className="h-[250px] w-full">
               <PieChart>
                 <ChartTooltip
                    content={<ChartTooltipContent hideLabel />}
                 />
                 <Pie
                    data={liquidityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
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
                            className="fill-foreground text-xs"
                        >
                           {liquidityData[index].name}
                        </text>
                        )
                    }}
                >
                    {liquidityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
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
          <CardContent className="space-y-4">
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
          <CardContent>
             <ChartContainer config={{}} className="h-[250px] w-full">
              <BarChart data={incomeData} layout="vertical" accessibilityLayer margin={{ left: 20 }}>
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={80}
                />
                <XAxis type="number" hide />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={false}
                />
                 <Bar dataKey="value" layout="vertical" fill="hsl(var(--primary))" radius={4}>
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
