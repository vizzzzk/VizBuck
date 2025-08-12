
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { format, addMonths } from "date-fns";
import { Loader } from "lucide-react";

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
    month: string; // YYYY-MM-01 format
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
      openingBalance: 0,
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
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: number) => void;
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
    const savedMonthlyData = localStorage.getItem("monthlyData");
    const savedReserves = localStorage.getItem("reserves");
    
    if (savedMonthlyData) {
        const parsedData = JSON.parse(savedMonthlyData);
        setMonthlyData(parsedData);
    } else {
        setMonthlyData(createInitialState());
    }

    if (savedReserves) {
        setReserves(JSON.parse(savedReserves));
    } else {
        setReserves(initialReserves);
    }

    setIsDataLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if(isDataLoaded) {
        localStorage.setItem("monthlyData", JSON.stringify(monthlyData));
    }
  }, [monthlyData, isDataLoaded]);
  
  useEffect(() => {
     if(isDataLoaded) {
        localStorage.setItem("reserves", JSON.stringify(reserves));
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
           const expensesFromBank = lastMonthData.transactions.filter(t => t.paymentMethod !== 'Cash').reduce((sum, t) => sum + Number(t.amount || 0), 0);
           const expensesFromCash = lastMonthData.transactions.filter(t => t.paymentMethod === 'Cash').reduce((sum, t) => sum + Number(t.amount || 0), 0);
           const closingBankBalance = bankAccounts.reduce((s,i) => s + i.balance, 0) - expensesFromBank;
           const closingCash = cash - expensesFromCash;
           const liquidAssets = closingBankBalance + closingCash + receivables.reduce((s,i) => s+i.amount, 0);
           const totalDues = creditCards.reduce((s,i) => s+i.due, 0);
           openingBalance = liquidAssets - totalDues;
        }

        const newMonthData: MonthlyFinancials = {
            month: currentMonthKey,
            liquidity: {
                openingBalance: lastMonthData ? openingBalance : 0,
                bankAccounts: lastMonthData?.liquidity.bankAccounts.map(acc => ({...acc, balance: acc.balance})) || [],
                cash: lastMonthData?.liquidity.cash || 0,
                creditCards: lastMonthData?.liquidity.creditCards.map(cc => ({...cc})) || [],
                receivables: [],
            },
            transactions: [],
        };
        
        if (lastMonthData) {
            const expensesFromBank = lastMonthData.transactions.filter(t => t.paymentMethod !== 'Cash').reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const expensesFromCash = lastMonthData.transactions.filter(t => t.paymentMethod === 'Cash').reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const totalBankBalanceAtStartOfMonth = lastMonthData.liquidity.bankAccounts.reduce((sum, acc) => sum + acc.balance, 0)
            const closingBankBalance = totalBankBalanceAtStartOfMonth - expensesFromBank;
            const closingCash = lastMonthData.liquidity.cash - expensesFromCash;
            newMonthData.liquidity.bankAccounts = lastMonthData.liquidity.bankAccounts.map(b => ({...b, balance: closingBankBalance / lastMonthData.liquidity.bankAccounts.length}));
            newMonthData.liquidity.cash = closingCash;
        }

        // This is a temporary fix to avoid modifying state during render
        setTimeout(() => {
            setMonthlyData(prev => ({...prev, [currentMonthKey]: newMonthData}))
        }, 0)

        return newMonthData;
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
    
    setMonthlyData(prev => ({
      ...prev,
      [currentMonthKey]: {
        ...prev[currentMonthKey],
        transactions: [...prev[currentMonthKey].transactions, newTransaction],
      }
    }));
  };

  const updateTransaction = (transaction: Transaction) => {
      setMonthlyData(prev => ({
          ...prev,
          [currentMonthKey]: {
              ...prev[currentMonthKey],
              transactions: prev[currentMonthKey].transactions.map(t => t.id === transaction.id ? transaction : t)
          }
      }));
  };

  const deleteTransaction = (id: number) => {
      setMonthlyData(prev => ({
          ...prev,
          [currentMonthKey]: {
              ...prev[currentMonthKey],
              transactions: prev[currentMonthKey].transactions.filter(t => t.id !== id)
          }
      }));
  };


  const closeMonth = () => {
    const { liquidity, transactions } = currentMonthData;
    const { bankAccounts, cash, receivables, creditCards } = liquidity;

    const expensesFromBank = transactions.filter(t => t.paymentMethod !== 'Cash').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expensesFromCash = transactions.filter(t => t.paymentMethod === 'Cash').reduce((sum, t) => sum + Number(t.amount || 0), 0);
      
    const startingBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const closingBankBalance = startingBankBalance - expensesFromBank;
    const closingCash = cash - expensesFromCash;
    
    const totalDues = creditCards.reduce((sum, card) => sum + card.due, 0);
    const totalClosingLiquidity = closingBankBalance + closingCash + receivables.reduce((sum, r) => sum + r.amount, 0);
    
    const closingBalance = totalClosingLiquidity - totalDues;

    const nextMonthDate = addMonths(new Date(currentMonthKey), 1);
    const nextMonthKey = format(nextMonthDate, "yyyy-MM-01");

    setMonthlyData(prev => ({
        ...prev,
        [currentMonthKey]: { 
            ...prev[currentMonthKey],
            transactions: transactions,
        },
        [nextMonthKey]: { 
            month: nextMonthKey,
            liquidity: {
                openingBalance: closingBalance,
                bankAccounts: bankAccounts.map(b => ({...b, balance: closingBankBalance / bankAccounts.length})),
                cash: closingCash, 
                creditCards: creditCards.map(c => ({...c, due: 0})),
                receivables: [],
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
        const totalBank = bankAccounts.reduce((s, i) => s + i.balance, 0);
        const totalReceivables = receivables.reduce((s, i) => s + i.amount, 0);
        const totalDues = creditCards.reduce((s,i) => s + i.due, 0);

        const expensesFromBank = data.transactions.filter(t => t.paymentMethod !== 'Cash').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const expensesFromCash = data.transactions.filter(t => t.paymentMethod === 'Cash').reduce((sum, t) => sum + Number(t.amount || 0), 0);
      
        const closingBankBalance = totalBank - expensesFromBank;
        const closingCash = cash - expensesFromCash;

        const liquidity = closingBankBalance + closingCash + totalReceivables;
        const netWorth = (liquidity - totalDues) + totalReserves;
        
        return {
            month: monthKey,
            liquidity: liquidity - totalDues,
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
    updateTransaction,
    deleteTransaction,
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

    