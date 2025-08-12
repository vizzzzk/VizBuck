
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from "react";
import { format, addMonths, startOfMonth, parseISO } from "date-fns";
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

export interface MutualFund {
    id: number;
    name: string;
    amount: number;
}

export interface Elss {
    id: number;
    name: string;
    amount: number;
}

export interface Reserves {
    fixedDeposits: FixedDeposit[];
    stocks: Stock[];
    crypto: Crypto[];
    mutualFunds: MutualFund[];
    elss: Elss[];
    nps: number;
    pf: number;
    gold: number;
    esop: number;
}

export interface Transaction {
    id: string; // Changed to string for UUID
    date: string; // YYYY-MM-DD format
    description: string;
    category: string;
    amount: number;
    paymentMethod: string; // e.g., 'Cash', 'HDFC Bank'
    type: 'CR' | 'DR';
}

export interface MonthlyFinancials {
    month: string; // YYYY-MM-01 format
    liquidity: Liquidity;
    transactions: Transaction[];
}

// --- Helper for Unique IDs ---
// Using a simple UUID generator to ensure uniqueness
const generateUniqueId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


// --- Initial State ---
const today = new Date();
const initialMonthKey = format(startOfMonth(today), "yyyy-MM-01");

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
    mutualFunds: [],
    elss: [],
    nps: 0,
    pf: 0,
    gold: 0,
    esop: 0,
};


// --- Context Definition ---
interface FinancialsContextType {
  monthlyData: Record<string, MonthlyFinancials>;
  reserves: Reserves;
  currentMonth: { year: number, month: number };
  setCurrentMonth: React.Dispatch<React.SetStateAction<{ year: number, month: number }>>;
  currentMonthData: MonthlyFinancials;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addMultipleTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  clearTransactionsForCurrentMonth: () => void;
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
    try {
      const savedMonthlyData = localStorage.getItem("monthlyData");
      const savedReserves = localStorage.getItem("reserves");
      
      const parsedMonthlyData = savedMonthlyData ? JSON.parse(savedMonthlyData) : {};
      const finalMonthlyData = Object.keys(parsedMonthlyData).length > 0 ? parsedMonthlyData : createInitialState();
      setMonthlyData(finalMonthlyData);

      if (savedReserves) {
          const parsedReserves = JSON.parse(savedReserves);
          // Merge saved data with initial state to ensure new fields are present
          setReserves({ ...initialReserves, ...parsedReserves });
      } else {
          setReserves(initialReserves);
      }
    } catch (error) {
        console.error("Failed to parse from localStorage", error);
        setMonthlyData(createInitialState());
        setReserves(initialReserves);
    } finally {
        setIsDataLoaded(true);
    }
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
  
    const createNewMonthData = useCallback((monthKey: string, openingBalance = 0, lastMonthData: MonthlyFinancials | null = null) => {
        let newBankAccounts: BankAccount[] = [];
        let newCash = 0;
        let newCreditCards: CreditCard[] = [];

        const baseData = lastMonthData || monthlyData[Object.keys(monthlyData).sort()[0]];

        if (baseData) {
            newBankAccounts = baseData.liquidity.bankAccounts.map(acc => ({ ...acc }));
            newCash = baseData.liquidity.cash;
            if(lastMonthData) {
                // If it's a new month being created from a previous one, reset dues
                 newCreditCards = baseData.liquidity.creditCards.map(cc => ({...cc, due: 0}));
            } else {
                newCreditCards = baseData.liquidity.creditCards.map(cc => ({ ...cc }));
            }
        }
        
        return {
            month: monthKey,
            liquidity: {
                openingBalance,
                bankAccounts: newBankAccounts,
                cash: newCash,
                creditCards: newCreditCards,
                receivables: [],
            },
            transactions: [],
        };
    }, [monthlyData]);


   // Effect to create new month data if it doesn't exist
  useEffect(() => {
    if (isDataLoaded && !monthlyData[currentMonthKey]) {
        const lastMonthKey = format(addMonths(new Date(currentMonthKey), -1), "yyyy-MM-01");
        const lastMonthData = monthlyData[lastMonthKey];
        let openingBalance = 0;

        if (lastMonthData) {
            const { bankAccounts, cash, receivables, creditCards } = lastMonthData.liquidity;
            
            const debits = lastMonthData.transactions.filter(t => t.type === 'DR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const credits = lastMonthData.transactions.filter(t => t.type === 'CR').reduce((sum, t) => sum + Number(t.amount || 0), 0);

            const startingBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
            const closingBankBalance = startingBankBalance + credits - debits;
            const closingCash = cash; // Assuming cash expenses are tracked separately or reflected in bank
            
            const totalReceivables = receivables.reduce((sum, r) => sum + r.amount, 0);
            const liquidAssets = closingBankBalance + closingCash + totalReceivables;
            const totalDues = creditCards.reduce((sum, card) => sum + card.due, 0);
            openingBalance = liquidAssets - totalDues;
        }

        const newMonthData = createNewMonthData(currentMonthKey, openingBalance, lastMonthData);
        setMonthlyData(prev => ({...prev, [currentMonthKey]: newMonthData}));
    }
  }, [currentMonthKey, monthlyData, isDataLoaded, createNewMonthData]);

  const currentMonthData = useMemo(() => {
    return monthlyData[currentMonthKey] || { // Return a default structure if data is not ready yet
      month: currentMonthKey,
      liquidity: {
        openingBalance: 0,
        bankAccounts: [],
        cash: 0,
        creditCards: [],
        receivables: [],
      },
      transactions: [],
    };
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
    const newTransaction = { ...transaction, id: generateUniqueId() };
    
    setMonthlyData(prev => ({
      ...prev,
      [currentMonthKey]: {
        ...prev[currentMonthKey],
        transactions: [...prev[currentMonthKey].transactions, newTransaction],
      }
    }));
  };
  
  const addMultipleTransactions = useCallback((transactions: Omit<Transaction, 'id'>[]) => {
       const newTransactions = transactions.map((t) => ({...t, id: generateUniqueId() }));
       
       setMonthlyData(prev => {
            const newState = {...prev};
            newTransactions.forEach(t => {
                const transactionDate = parseISO(t.date);
                const monthKey = format(startOfMonth(transactionDate), "yyyy-MM-01");

                if (!newState[monthKey]) {
                    newState[monthKey] = createNewMonthData(monthKey);
                }
                newState[monthKey].transactions.push(t);
            });
            return newState;
       });

  }, [createNewMonthData]);

  const updateTransaction = useCallback((transaction: Transaction) => {
      setMonthlyData(prev => ({
          ...prev,
          [currentMonthKey]: {
              ...prev[currentMonthKey],
              transactions: prev[currentMonthKey].transactions.map(t => t.id === transaction.id ? transaction : t)
          }
      }));
  }, [currentMonthKey]);

  const deleteTransaction = useCallback((id: string) => {
      setMonthlyData(prev => ({
          ...prev,
          [currentMonthKey]: {
              ...prev[currentMonthKey],
              transactions: prev[currentMonthKey].transactions.filter(t => t.id !== id)
          }
      }));
  }, [currentMonthKey]);

  const clearTransactionsForCurrentMonth = useCallback(() => {
      setMonthlyData(prev => ({
          ...prev,
          [currentMonthKey]: {
              ...prev[currentMonthKey],
              transactions: []
          }
      }));
  }, [currentMonthKey]);


  const closeMonth = () => {
    const { liquidity, transactions } = currentMonthData;
    const { bankAccounts, cash, receivables, creditCards } = liquidity;

    const debits = transactions.filter(t => t.type === 'DR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const credits = transactions.filter(t => t.type === 'CR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
      
    const startingBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const closingBankBalance = startingBankBalance + credits - debits;
    const closingCash = cash; // Modify if cash transactions are handled differently
    
    const totalDues = creditCards.reduce((sum, card) => sum + card.due, 0);
    const totalReceivables = receivables.reduce((sum, r) => sum + r.amount, 0);
    const totalClosingLiquidity = closingBankBalance + closingCash + totalReceivables;
    
    const closingBalance = totalClosingLiquidity - totalDues;

    const nextMonthDate = addMonths(new Date(currentMonthKey), 1);
    const nextMonthKey = format(nextMonthDate, "yyyy-MM-01");

    setMonthlyData(prev => {
        const updatedCurrentMonth = {
            ...prev[currentMonthKey],
            transactions: transactions,
        };

        const nextMonthExists = !!prev[nextMonthKey];

        const newNextMonthData = { 
            month: nextMonthKey,
            liquidity: {
                openingBalance: closingBalance,
                bankAccounts: bankAccounts.length > 0 ? bankAccounts.map(b => ({...b, id: b.id, name: b.name, balance: closingBankBalance / bankAccounts.length})) : [],
                cash: closingCash, 
                creditCards: creditCards.map(c => ({...c, id: c.id, name: c.name, due: 0})),
                receivables: [],
            },
            transactions: nextMonthExists ? prev[nextMonthKey].transactions : [],
        };

        return {
            ...prev,
            [currentMonthKey]: updatedCurrentMonth,
            [nextMonthKey]: newNextMonthData,
        };
    });

    setCurrentMonth({ year: nextMonthDate.getFullYear(), month: nextMonthDate.getMonth() + 1 });
  };
  
  const availableMonths = useMemo(() => Array.from(new Set(Object.keys(monthlyData))).sort(), [monthlyData]);
  
  const monthlySummary = useMemo(() => {
    const totalReserves = (reserves.fixedDeposits?.reduce((s, i) => s + i.amount, 0) || 0)
        + (reserves.stocks?.reduce((s, i) => s + i.amount, 0) || 0)
        + (reserves.crypto?.reduce((s, i) => s + i.amount, 0) || 0)
        + (reserves.mutualFunds?.reduce((s, i) => s + i.amount, 0) || 0)
        + (reserves.elss?.reduce((s, i) => s + i.amount, 0) || 0)
        + (reserves.nps || 0) + (reserves.pf || 0) + (reserves.gold || 0) + (reserves.esop || 0);

    return availableMonths.map(monthKey => {
        const data = monthlyData[monthKey];
        if (!data) return null;
        const { openingBalance, receivables, creditCards } = data.liquidity;

        const debits = data.transactions.filter(t => t.type === 'DR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const credits = data.transactions.filter(t => t.type === 'CR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
      
        const totalReceivables = receivables.reduce((s, i) => s + i.amount, 0);
        const totalDues = creditCards.reduce((s,i) => s + i.due, 0);

        const liquidity = openingBalance + credits - debits + totalReceivables - totalDues;
        const netWorth = liquidity + totalReserves;
        
        return {
            month: monthKey,
            liquidity: liquidity,
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
    addMultipleTransactions,
    updateTransaction,
    deleteTransaction,
    clearTransactionsForCurrentMonth,
    updateLiquidity,
    updateReserves,
    closeMonth,
    availableMonths,
    monthlySummary,
    isDataLoaded
  };

  return (
    <FinancialsContext.Provider value={value}>
      {isDataLoaded ? currentMonthData ? children : <div className="flex h-screen w-full items-center justify-center"><Loader className="h-8 w-8 animate-spin text-primary" /></div> : <div className="flex h-screen w-full items-center justify-center"><Loader className="h-8 w-8 animate-spin text-primary" /></div>}
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
