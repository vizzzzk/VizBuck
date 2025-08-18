
"use client";

import * as React from "react";
import { useMemo } from "react";
import {
    Landmark,
    TrendingUp,
    Diamond,
    Banknote,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { useFinancials } from "@/hooks/use-financials";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';


export default function DashboardPage() {
  const { 
    currentMonthData,
    isDataLoaded,
    monthlySummary,
    closeMonth,
    setCurrentMonth,
    currentMonth,
    availableMonths,
  } = useFinancials();
  const { toast } = useToast();

  const { netWorth, closingBalance, openingBalance, totalReserves, liquidityBreakdown, totalLiquidity } = useMemo(() => {
    if (!isDataLoaded || !currentMonthData) return { netWorth: 0, closingBalance: 0, openingBalance: 0, totalReserves: 0, liquidityBreakdown: [], totalLiquidity: 0 };
    const { liquidity, transactions, reserves: monthReserves } = currentMonthData;

    const totalBankBalance = liquidity.bankAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
    const totalCreditCardDues = liquidity.creditCards.reduce((sum, card) => sum + Number(card.due || 0), 0);
    const totalReceivables = liquidity.receivables.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const totalCash = Number(liquidity.cash || 0);
    
    const totalReservesValue = Object.values(monthReserves).flat().reduce((sum, item) => sum + (typeof item === 'number' ? item : item.amount || 0), 0);
    
    const credits = transactions.filter(t => t.type === 'CR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expensesFromBank = transactions.filter(t => t.paymentMethod !== 'Cash' && t.type === 'DR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const closingBankBalance = totalBankBalance + credits - expensesFromBank;

    const expensesFromCash = transactions.filter(t => t.paymentMethod === 'Cash' && t.type === 'DR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const closingCash = totalCash - expensesFromCash; 
    
    const liquidAssets = closingBankBalance + closingCash + totalReceivables;
    const closingLiquidityBalance = liquidAssets - totalCreditCardDues;
    
    const breakdown = [
      { name: 'Bank Balance', value: closingBankBalance, fill: 'hsl(var(--chart-1))' },
      { name: 'Cash', value: closingCash, fill: 'hsl(var(--chart-2))'},
      { name: 'Receivables', value: totalReceivables, fill: 'hsl(var(--chart-3))' },
      { name: 'Credit Card Dues', value: totalCreditCardDues, fill: 'hsl(var(--chart-4))' },
    ];
    
    return { 
        netWorth: closingLiquidityBalance + totalReservesValue, 
        closingBalance: closingLiquidityBalance,
        openingBalance: liquidity.openingBalance, 
        totalReserves: totalReservesValue,
        liquidityBreakdown: breakdown,
        totalLiquidity: liquidAssets
    };
  }, [currentMonthData, isDataLoaded]);

  const handleCloseMonth = () => {
      closeMonth();
      toast({
          title: "Month Closed",
          description: "The current month has been closed and a new one has been opened."
      });
  }

  const handleMonthChange = (value: string) => {
      const [year, month] = value.split("-");
      setCurrentMonth({ year: parseInt(year), month: parseInt(month) });
  };
  
  if (!isDataLoaded || !currentMonthData) {
      return null;
  }
  
  const formattedCurrentMonth = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}`;
  const displayMonth = format(new Date(formattedCurrentMonth), "MMMM yyyy");

  return (
    <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold">Financial Overview</h1>
                <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">{displayMonth}</span>
            </div>
            <div className="flex items-center gap-2">
                 <Select value={formattedCurrentMonth} onValueChange={handleMonthChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue>
                            {displayMonth}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {availableMonths.map(m => (
                            <SelectItem key={m} value={m}>{format(new Date(m), "MMMM yyyy")}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleCloseMonth}><ArrowRight className="mr-2 h-4 w-4" />Close Month & Advance</Button>
                 <Button asChild variant="outline">
                    <Link href="/dashboard/wallets">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Assets
                    </Link>
                </Button>
            </div>
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium text-muted-foreground">Net Worth</CardTitle>
             <div className="text-3xl font-bold">₹{netWorth.toLocaleString('en-IN')}</div>
             <p className="text-xs text-muted-foreground pt-1">Total value of your assets & reserves</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Opening Balance</CardTitle>
            <div className="text-3xl font-bold">₹{openingBalance.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground pt-1">As of start of {displayMonth}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Closing Balance (Liquid)</CardTitle>
            <div className="text-3xl font-bold">₹{closingBalance.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground pt-1">After all expenses</p>
          </CardHeader>
        </Card>
        <Card>
           <CardHeader>
             <CardTitle className="text-sm font-medium text-muted-foreground">Total Reserves</CardTitle>
             <div className="text-3xl font-bold">₹{totalReserves.toLocaleString('en-IN')}</div>
             <p className="text-xs text-muted-foreground pt-1">FDs, Stocks, & Crypto</p>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Liquidity Breakdown</CardTitle>
                <CardDescription>Your current assets vs. liabilities for {displayMonth}.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer 
                    config={{}} 
                    className="mx-auto aspect-square h-[250px]"
                 >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={liquidityBreakdown}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            {liquidityBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
             <CardHeader>
                <CardTitle>Reserves & Investments</CardTitle>
                <CardDescription>Your long-term asset allocation (continuous).</CardDescription>
            </CardHeader>
             <CardContent className="grid grid-cols-2 gap-6 pt-6">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg">
                        <Landmark className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Fixed Deposits</p>
                        <p className="text-xl font-bold">₹{currentMonthData.reserves.fixedDeposits.reduce((s,i) => s + i.amount, 0).toLocaleString('en-IN')}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Stocks</p>
                        <p className="text-xl font-bold">₹{currentMonthData.reserves.stocks.reduce((s,i) => s + i.amount, 0).toLocaleString('en-IN')}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg">
                        <Diamond className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Crypto</p>
                        <p className="text-xl font-bold">₹{currentMonthData.reserves.crypto.reduce((s,i) => s + i.amount, 0).toLocaleString('en-IN')}</p>
                    </div>
                </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg">
                        <Banknote className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Mutual Funds</p>
                        <p className="text-xl font-bold">₹{currentMonthData.reserves.mutualFunds.reduce((s,i) => s + i.amount, 0).toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
