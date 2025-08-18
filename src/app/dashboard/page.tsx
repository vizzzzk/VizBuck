
"use client";

import * as React from "react";
import { useMemo } from "react";
import {
    ArrowUpRight,
    LineChart as LineChartIcon
} from "lucide-react";
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
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { format } from 'date-fns';

export default function DashboardPage() {
  const { 
    currentMonthData,
    isDataLoaded,
    monthlySummary
  } = useFinancials();

  const { netWorth, closingBalance, totalReserves } = useMemo(() => {
    if (!isDataLoaded || !currentMonthData) return { netWorth: 0, closingBalance: 0, totalReserves: 0 };
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
    
    return { netWorth: closingLiquidityBalance + totalReservesValue, closingBalance: closingLiquidityBalance, totalReserves: totalReservesValue };
  }, [currentMonthData, isDataLoaded]);

  
  if (!isDataLoaded) {
      return <div className="flex h-[calc(100vh-8rem)] items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
  }
  
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Section */}
       <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Good morning, {currentMonthData.liquidity.bankAccounts[0]?.name.split(' ')[0] || 'User'}!</h1>
          <p className="text-gray-600">Stay on top of your tasks, monitor progress, and track status.</p>
        </div>
      
      {/* Balance and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Total Balance -> Net Worth */}
        <Card>
          <CardHeader>
             <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-sm font-medium text-gray-500">Total Balance</CardTitle>
                    <div className="flex items-baseline mt-1">
                        <span className="text-2xl font-bold">₹{netWorth.toLocaleString('en-IN')}</span>
                         <span className="ml-2 text-sm font-medium text-green-500 flex items-center">
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                            3%
                        </span>
                    </div>
                </div>
             </div>
          </CardHeader>
        </Card>
        {/* Total Earnings -> Liquid Balance */}
        <Card>
          <CardHeader>
             <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-sm font-medium text-gray-500">Liquid Balance</CardTitle>
                    <div className="flex items-baseline mt-1">
                        <span className="text-2xl font-bold text-orange-500">₹{closingBalance.toLocaleString('en-IN')}</span>
                        <span className="ml-2 text-sm font-medium text-green-500 flex items-center">
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                            5%
                        </span>
                    </div>
                </div>
             </div>
          </CardHeader>
        </Card>
         {/* Total Spending -> Reserves */}
        <Card>
           <CardHeader>
             <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-sm font-medium text-gray-500">Reserves & Investments</CardTitle>
                    <div className="flex items-baseline mt-1">
                        <span className="text-2xl font-bold text-red-500">₹{totalReserves.toLocaleString('en-IN')}</span>
                         <span className="ml-2 text-sm font-medium text-red-500 flex items-center">
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                            4%
                        </span>
                    </div>
                </div>
             </div>
          </CardHeader>
        </Card>
      </div>

       {/* Cash Flow Section */}
      <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>A summary of your key financial metrics over time.</CardDescription>
            </CardHeader>
            <CardContent>
                {monthlySummary.length > 1 ? (
                     <ChartContainer config={{}} className="h-[400px] w-full">
                        <LineChart data={monthlySummary}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="month" 
                                tickFormatter={(value) => format(new Date(value), "MMM yy")}
                                padding={{ left: 20, right: 20 }}
                            />
                            <YAxis 
                                tickFormatter={(value) => `₹${value / 1000}k`}
                                width={80}
                            />
                            <RechartsTooltip 
                                cursor={{fill: 'hsl(var(--muted))'}}
                                content={<ChartTooltipContent 
                                    className="bg-background/80 backdrop-blur-sm"
                                    formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN')}`, name]}
                                    labelFormatter={(label) => format(new Date(label), "MMMM yyyy")}
                                />}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Line dataKey="netWorth" type="monotone" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Net Worth" />
                            <Line dataKey="liquidity" type="monotone" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Liquidity" />
                            <Line dataKey="reserves" type="monotone" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Reserves" />
                        </LineChart>
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
