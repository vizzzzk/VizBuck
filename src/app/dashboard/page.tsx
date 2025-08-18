
"use client";

import * as React from "react";
import { useMemo } from "react";
import {
    LineChart as LineChartIcon,
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
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

  const { netWorth, closingBalance, openingBalance, totalReserves } = useMemo(() => {
    if (!isDataLoaded || !currentMonthData) return { netWorth: 0, closingBalance: 0, openingBalance: 0, totalReserves: 0 };
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
    
    return { 
        netWorth: closingLiquidityBalance + totalReservesValue, 
        closingBalance: closingLiquidityBalance,
        openingBalance: liquidity.openingBalance, 
        totalReserves: totalReservesValue 
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
  
  if (!isDataLoaded) {
      return null;
  }
  
  const formattedCurrentMonth = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}`;

  const chartConfig = {
      netWorth: {
          label: "Net Worth",
          color: "hsl(var(--chart-1))",
      },
      liquidity: {
          label: "Liquidity",
          color: "hsl(var(--chart-2))",
      },
      reserves: {
          label: "Reserves",
          color: "hsl(var(--chart-3))",
      },
  };

  return (
    <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">Overview of your financial status for <span className="font-semibold text-primary">{format(new Date(formattedCurrentMonth), "MMMM yyyy")}</span>. <Link href="/dashboard/wallets" className="text-sm text-primary hover:underline">Edit Wallet Data</Link></p>
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
                <Button onClick={handleCloseMonth}>Close Month & Advance</Button>
            </div>
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium text-gray-500">Net Worth</CardTitle>
             <div className="text-2xl font-bold">₹{netWorth.toLocaleString('en-IN')}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Opening Balance</CardTitle>
            <div className="text-2xl font-bold">₹{openingBalance.toLocaleString('en-IN')}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Closing Balance (Liquid)</CardTitle>
            <div className="text-2xl font-bold">₹{closingBalance.toLocaleString('en-IN')}</div>
          </CardHeader>
        </Card>
        <Card>
           <CardHeader>
             <CardTitle className="text-sm font-medium text-gray-500">Reserves & Investments</CardTitle>
             <div className="text-2xl font-bold">₹{totalReserves.toLocaleString('en-IN')}</div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>A summary of your key financial metrics over time.</CardDescription>
            </CardHeader>
            <CardContent>
                {monthlySummary.length > 1 ? (
                     <ChartContainer config={chartConfig} className="h-[400px] w-full">
                        <ComposedChart data={monthlySummary}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="month" 
                                tickFormatter={(value) => format(new Date(value), "MMM yy")}
                                padding={{ left: 20, right: 20 }}
                            />
                            <YAxis 
                                yAxisId="left"
                                tickFormatter={(value) => `₹${value / 1000}k`}
                                width={80}
                            />
                             <YAxis 
                                yAxisId="right"
                                orientation="right"
                                tickFormatter={(value) => `₹${value / 1000}k`}
                                width={80}
                            />
                            <RechartsTooltip 
                                cursor={{fill: 'hsl(var(--muted))'}}
                                content={<ChartTooltipContent 
                                    className="bg-background/80 backdrop-blur-sm"
                                    formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN')}`, name as keyof typeof chartConfig]}
                                    labelFormatter={(label) => format(new Date(label), "MMMM yyyy")}
                                />}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="liquidity" yAxisId="left" fill="var(--color-liquidity)" name="Liquidity" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="reserves" yAxisId="left" fill="var(--color-reserves)" name="Reserves" radius={[4, 4, 0, 0]}/>
                            <Line dataKey="netWorth" yAxisId="right" type="monotone" stroke="var(--color-netWorth)" strokeWidth={2} name="Net Worth" dot={false} />
                        </ComposedChart>
                    </ChartContainer>
                ) : (
                    <div className="h-80 w-full flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                        <LineChartIcon className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">Not enough data to display a chart.</p>
                        <p className="text-sm text-gray-400">Please add transactions for multiple months to see your trends.</p>
                    </div>
                )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
