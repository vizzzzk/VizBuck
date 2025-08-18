
"use client";

import * as React from "react";
import { useMemo } from "react";
import {
    ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { useFinancials } from "@/hooks/use-financials";

export default function DashboardPage() {
  const { 
    currentMonthData,
    isDataLoaded,
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
                <CardTitle>Cash Flow</CardTitle>
                <CardDescription>A summary of your income and expenses.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80 w-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Chart will be displayed here.</p>
                </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

