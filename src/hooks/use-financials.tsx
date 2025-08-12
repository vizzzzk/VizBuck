
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { format, addMonths } from "date-fns";

// --- Type Definitions ---
export interface BankAccount {
  id: number;
  name: string;
  balance: number;
}

export interface CreditCard {
  id: number;
  name: string;
  due: number;
}

export interface Receivable {
  id: number;
  source: string;
  amount: number;
  date: Date;
}

export interface Liquidity {
  openingBalance: number;
  bankAccounts: BankAccount[];
  cash: number;
  creditCards: CreditCard[];
  receivables: Receivable[];
}

export interface FixedDeposit {
    id: number;
    institution: string;
    amount: number;
}

export interface Stock {
    id: number;
    broker: string;
    amount: number;
}

export interface Crypto {
    id: number;
    exchange: string;
    amount: number;
}

export interface Reserves {
    fixedDeposits: FixedDeposit[];
    stocks: Stock[];
    crypto: Crypto[];
}

export interface Transaction {
    id: number;
    date: string;
    description: string;
    category: string;
    amount: number;
    paymentMethod: string; // e.g., 'Cash', 'HDFC Bank'
}

export interface MonthlyFinancials {
    month: string; // YYYY-MM-DD format
    liquidity: Liquidity;
    transactions: Transaction[];
}

// --- Initial State ---
const today = new Date();
const initialMonthKey = format(today, "yyyy-MM-01");

const createInitialState = (): Record<string, MonthlyFinancials> => ({
  [initialMonthKey]: {
    month: initialMonthKey,
    liquidity: {
      openingBalance: 285000,
      bankAccounts: [{ id: 1, name: 'HDFC Bank', balance: 250000 }],
      cash: 15000,
      creditCards: [{ id: 1, name: 'HDFC Bank', due: 50000 }],
      receivables: [{ id: 1, source: 'Freelance Project', amount: 70000, date: new Date() }],
    },
    transactions: [],
  }
});


const initialReserves: Reserves = {
    fixedDeposits: [{id: 1, institution: 'HDFC Bank', amount: 500000}],
    stocks: [{id: 1, broker: 'Zerodha', amount: 750000}],
    crypto: [{id: 1, exchange: 'WazirX', amount: 125000}],
};


// --- Context Definition ---
interface FinancialsContextType {
  monthlyData: Record<string, MonthlyFinancials>;
  reserves: Reserves;
  currentMonth: { year: number, month: number };
  setCurrentMonth: React.Dispatch<React.SetStateAction<{ year: number, month: number }>>;
  currentMonthData: MonthlyFinancials;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateLiquidity: (liquidity: Liquidity) => void;
  updateReserves: (reserves: Reserves) => void;
  closeMonth: () => void;
  availableMonths: string[];
  monthlySummary: { month: string; liquidity: number; reserves: number; netWorth: number }[];
  isDataLoaded: boolean;
}

const FinancialsContext = createContext<FinancialsContextType | undefined>(undefined);

// --- Provider Component ---
export const FinancialsProvider = ({ children }: { children: ReactNode }) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [monthlyData, setMonthlyData] = useState<Record<string, MonthlyFinancials>>({});
  const [reserves, setReserves] = useState<Reserves>(initialReserves);
  const [currentMonth, setCurrentMonth] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });

  // Load from localStorage on initial render
  useEffect(() => {
    const savedMonthlyData = localStorage.getItem("financialsMonthlyData");
    const savedReserves = localStorage.getItem("financialsReserves");
    
    if (savedMonthlyData) {
        setMonthlyData(JSON.parse(savedMonthlyData));
    } else {
        setMonthlyData(createInitialState());
    }

    if (savedReserves) {
        setReserves(JSON.parse(savedReserves));
    }

    setIsDataLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if(isDataLoaded) {
        localStorage.setItem("financialsMonthlyData", JSON.stringify(monthlyData));
    }
  }, [monthlyData, isDataLoaded]);
  
  useEffect(() => {
     if(isDataLoaded) {
        localStorage.setItem("financialsReserves", JSON.stringify(reserves));
    }
  }, [reserves, isDataLoaded]);


  const currentMonthKey = useMemo(() => format(new Date(currentMonth.year, currentMonth.month - 1, 1), "yyyy-MM-01"), [currentMonth]);
  
  const currentMonthData = useMemo(() => {
    // Ensure there is always data for the current month
    if (!monthlyData[currentMonthKey]) {
        const lastMonthKey = format(addMonths(new Date(currentMonthKey), -1), "yyyy-MM-01");
        const lastMonthData = monthlyData[lastMonthKey];
        
        let openingBalance = 0;
        if(lastMonthData) {
           const { bankAccounts, cash, receivables, creditCards } = lastMonthData.liquidity;
           const totalExpenses = lastMonthData.transactions.reduce((sum, t) => sum + t.amount, 0);
           const liquidAssets = bankAccounts.reduce((s,i) => s + i.balance, 0) + cash + receivables.reduce((s,i) => s+i.amount, 0);
           const totalDues = creditCards.reduce((s,i) => s+i.due, 0);
           openingBalance = liquidAssets - totalDues - totalExpenses;
        }

        return {
            month: currentMonthKey,
            liquidity: {
                openingBalance: openingBalance,
                bankAccounts: lastMonthData?.liquidity.bankAccounts || [],
                cash: lastMonthData?.liquidity.cash || 0,
                creditCards: lastMonthData?.liquidity.creditCards || [],
                receivables: [],
            },
            transactions: [],
        };
    }
    return monthlyData[currentMonthKey];
  }, [monthlyData, currentMonthKey]);
  
  
  const updateLiquidity = (liquidity: Liquidity) => {
    setMonthlyData(prev => ({
      ...prev,
      [currentMonthKey]: { ...prev[currentMonthKey], liquidity }
    }));
  };

  const updateReserves = (reserves: Reserves) => {
    setReserves(reserves);
  };
  
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now() + Math.random() };
    
    setMonthlyData(prev => {
        const newMonthlyData = {...prev};
        const monthData = newMonthlyData[currentMonthKey];
        
        // Update transactions
        monthData.transactions = [...monthData.transactions, newTransaction];
        
        // Update liquidity based on payment method
        const newLiquidity = {...monthData.liquidity};
        if (transaction.paymentMethod === 'Cash') {
            newLiquidity.cash -= transaction.amount;
        } else {
            const bankAccountIndex = newLiquidity.bankAccounts.findIndex(
                acc => acc.name === transaction.paymentMethod
            );
            if (bankAccountIndex > -1) {
                newLiquidity.bankAccounts[bankAccountIndex].balance -= transaction.amount;
            }
        }
        monthData.liquidity = newLiquidity;
        
        return newMonthlyData;
    });
  };

  const closeMonth = () => {
    const { openingBalance, bankAccounts, cash, receivables, creditCards } = currentMonthData.liquidity;
    const totalExpenses = currentMonthData.transactions.reduce((sum, t) => sum + t.amount, 0);
    const liquidAssets = bankAccounts.reduce((s,i) => s + i.balance, 0) + cash + receivables.reduce((s,i) => s+i.amount, 0);
    const totalDues = creditCards.reduce((s,i) => s+i.due, 0);
    
    const closingBalance = liquidAssets - totalDues;

    const nextMonthDate = addMonths(new Date(currentMonthKey), 1);
    const nextMonthKey = format(nextMonthDate, "yyyy-MM-01");

    setMonthlyData(prev => ({
        ...prev,
        [nextMonthKey]: {
            month: nextMonthKey,
            liquidity: {
                openingBalance: closingBalance,
                bankAccounts: bankAccounts.map(b => ({...b})), // Deep copy
                cash: cash, 
                creditCards: creditCards.map(c => ({...c, due: 0})), // Dues cleared, carry forward cards
                receivables: [], // Receivables are for the current month only
            },
            transactions: [],
        }
    }));

    setCurrentMonth({ year: nextMonthDate.getFullYear(), month: nextMonthDate.getMonth() + 1 });
  };
  
  const availableMonths = useMemo(() => Object.keys(monthlyData).sort(), [monthlyData]);
  
  const monthlySummary = useMemo(() => {
    const totalReserves = reserves.fixedDeposits.reduce((s, i) => s + i.amount, 0) + reserves.stocks.reduce((s, i) => s + i.amount, 0) + reserves.crypto.reduce((s, i) => s + i.amount, 0);

    return availableMonths.map(monthKey => {
        const data = monthlyData[monthKey];
        if (!data) return null;
        const { bankAccounts, cash, receivables, creditCards } = data.liquidity;
        const liquidity = bankAccounts.reduce((s, i) => s + i.balance, 0) + cash + receivables.reduce((s, i) => s + i.amount, 0);
        const netWorth = (liquidity - creditCards.reduce((s, i) => s + i.due, 0)) + totalReserves;
        return {
            month: monthKey,
            liquidity,
            reserves: totalReserves,
            netWorth,
        }
    }).filter(Boolean) as { month: string; liquidity: number; reserves: number; netWorth: number }[];
  }, [monthlyData, reserves, availableMonths]);


  const value = {
    monthlyData,
    reserves,
    currentMonth,
    setCurrentMonth,
    currentMonthData,
    addTransaction,
    updateLiquidity,
    updateReserves,
    closeMonth,
    availableMonths,
    monthlySummary,
    isDataLoaded
  };

  return (
    <FinancialsContext.Provider value={value}>
      {isDataLoaded ? children : <div className="flex h-screen w-full items-center justify-center"><Loader className="h-8 w-8 animate-spin text-primary" /></div>}
    </FinancialsContext.Provider>
  );
};

// --- Custom Hook ---
export const useFinancials = () => {
  const context = useContext(FinancialsContext);
  if (context === undefined) {
    throw new Error("useFinancials must be used within a FinancialsProvider");
  }
  return context;
};
