
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from "react";
import { format, addMonths, startOfMonth, parseISO, isValid } from "date-fns";
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
    name?: string; // Optional name from API
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
    id: string;
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
    reserves: Reserves; // Snapshot of reserves for the month
    transactions: Transaction[];
}

// --- Helper for Unique IDs ---
const generateUniqueId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};


// --- Initial State ---
const today = new Date();
const initialMonthKey = format(startOfMonth(today), "yyyy-MM-01");

const initialReserves: Reserves = {
    fixedDeposits: [{id: 1, institution: 'HDFC Bank', amount: 500000}],
    stocks: [{id: 1, broker: 'Zerodha', amount: 750000, name: 'Sample Stock'}],
    crypto: [{id: 1, exchange: 'WazirX', amount: 125000}],
    mutualFunds: [],
    elss: [],
    nps: 0,
    pf: 0,
    gold: 0,
    esop: 0,
};

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
    reserves: initialReserves,
    transactions: [],
  }
});


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
  deleteMultipleTransactions: (ids: string[]) => void;
  clearTransactionsForCurrentMonth: () => void;
  clearAllData: () => void;
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
  const [currentMonth, setCurrentMonth] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });

  // Memoized reserves from the current month's data
  const reserves = useMemo(() => {
    const currentMonthKey = format(new Date(currentMonth.year, currentMonth.month - 1, 1), "yyyy-MM-01");
    return monthlyData[currentMonthKey]?.reserves || initialReserves;
  }, [monthlyData, currentMonth]);


  const createNewMonthData = useCallback((monthKey: string, openingBalance = 0, prevMonthData: MonthlyFinancials | null) => {
      
      let newLiquidity: Liquidity;

      if (prevMonthData) {
        const { liquidity: prevLiquidity, transactions: prevTransactions } = prevMonthData;
        const credits = prevTransactions.filter(t => t.type === 'CR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const startingBankBalance = prevLiquidity.bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        const expensesFromBank = prevTransactions.filter(t => t.paymentMethod !== 'Cash' && t.type === 'DR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const closingBankBalance = startingBankBalance + credits - expensesFromBank;

        const expensesFromCash = prevTransactions.filter(t => t.paymentMethod === 'Cash' && t.type === 'DR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const closingCash = prevLiquidity.cash - expensesFromCash; 

         newLiquidity = {
            openingBalance,
            bankAccounts: prevLiquidity.bankAccounts.map(b => ({ ...b, balance: closingBankBalance / (prevLiquidity.bankAccounts.length || 1) })), // Default to opening balance
            cash: closingCash,
            creditCards: prevLiquidity.creditCards.map(c => ({...c, due: 0})),
            receivables: [],
          };
      } else {
         newLiquidity = {
            openingBalance: 0,
            bankAccounts: [{ id: 1, name: 'HDFC Bank', balance: 250000 }],
            cash: 15000,
            creditCards: [{ id: 1, name: 'HDFC Bank', due: 50000 }],
            receivables: [{ id: 1, source: 'Freelance Project', amount: 70000, date: new Date() }],
        };
      }
      
      return {
          month: monthKey,
          liquidity: newLiquidity,
          reserves: prevMonthData?.reserves || initialReserves, // Carry over reserves snapshot
          transactions: [],
      };
  }, []);

  // Load from localStorage on initial render
  useEffect(() => {
    try {
        const savedMonthlyData = localStorage.getItem("monthlyData");
        
        if (savedMonthlyData) {
            const parsedData = JSON.parse(savedMonthlyData);
            // Ensure all months have the new reserves structure
            for (const key in parsedData) {
                if (!parsedData[key].reserves) {
                    const prevKey = format(addMonths(new Date(key), -1), "yyyy-MM-01");
                    parsedData[key].reserves = parsedData[prevKey]?.reserves || initialReserves;
                }
                 if (!parsedData[key].liquidity) { // Handle very old data structures
                    parsedData[key].liquidity = createInitialState()[initialMonthKey].liquidity;
                }
            }
            setMonthlyData(parsedData);
        } else {
            setMonthlyData(createInitialState());
        }
    } catch (error) {
        console.error("Failed to parse from localStorage", error);
        setMonthlyData(createInitialState());
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

  const currentMonthKey = useMemo(() => format(new Date(currentMonth.year, currentMonth.month - 1, 1), "yyyy-MM-01"), [currentMonth]);
  
   // Effect to create new month data if it doesn't exist
  useEffect(() => {
    if (isDataLoaded && !monthlyData[currentMonthKey]) {
        const lastMonthKey = format(addMonths(new Date(currentMonthKey), -1), "yyyy-MM-01");
        const lastMonthData = monthlyData[lastMonthKey];
        let openingBalance = 0;

        if (lastMonthData) {
            const { liquidity, transactions, reserves: lastMonthReserves } = lastMonthData;
            const { bankAccounts, cash, receivables, creditCards } = liquidity;
            
            const credits = transactions.filter(t => t.type === 'CR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const startingBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
            const expensesFromBank = transactions.filter(t => t.paymentMethod !== 'Cash' && t.type === 'DR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const closingBankBalance = startingBankBalance + credits - expensesFromBank;

            const expensesFromCash = transactions.filter(t => t.paymentMethod === 'Cash' && t.type === 'DR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const closingCash = cash - expensesFromCash; 
            
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
      liquidity: { openingBalance: 0, bankAccounts: [], cash: 0, creditCards: [], receivables: [] },
      reserves: initialReserves,
      transactions: [],
    };
  }, [monthlyData, currentMonthKey]);
  
  
  const updateLiquidity = (liquidity: Liquidity) => {
    setMonthlyData(prev => ({
      ...prev,
      [currentMonthKey]: { ...prev[currentMonthKey], liquidity }
    }));
  };

  const updateReserves = (newReserves: Reserves) => {
    setMonthlyData(prev => ({
      ...prev,
      [currentMonthKey]: { ...prev[currentMonthKey], reserves: newReserves }
    }));
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
       setMonthlyData(prev => {
            const newState = {...prev};
            
            transactions.forEach(t => {
                if (!t.date) {
                    console.warn("Skipping transaction with no date:", t);
                    return;
                }
                
                const transactionDate = parseISO(t.date);
                
                if (!isValid(transactionDate)) {
                    console.warn("Skipping transaction with invalid date:", t);
                    return;
                }

                const monthKey = format(startOfMonth(transactionDate), "yyyy-MM-01");

                if (!newState[monthKey]) {
                    const lastMonthKey = format(addMonths(new Date(monthKey), -1), "yyyy-MM-01");
                    const lastMonthData = newState[lastMonthKey];
                    // Create with defaults, user might need to adjust.
                    newState[monthKey] = createNewMonthData(monthKey, 0, lastMonthData);
                }

                // De-duplication logic
                const transactionSignature = `${t.date}|${t.description}|${t.amount}|${t.type}`;
                const isDuplicate = newState[monthKey].transactions.some(existingTx => 
                    `${existingTx.date}|${existingTx.description}|${existingTx.amount}|${existingTx.type}` === transactionSignature
                );

                if (!isDuplicate) {
                    const newTransaction = { ...t, id: generateUniqueId() };
                    newState[monthKey].transactions.push(newTransaction);
                } else {
                     console.warn("Skipping duplicate transaction:", t);
                }
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

  const deleteMultipleTransactions = useCallback((ids: string[]) => {
      setMonthlyData(prev => ({
          ...prev,
          [currentMonthKey]: {
              ...prev[currentMonthKey],
              transactions: prev[currentMonthKey].transactions.filter(t => !ids.includes(t.id))
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

  const clearAllData = useCallback(() => {
    const freshState = createInitialState();
    setMonthlyData(freshState);
    const today = new Date();
    setCurrentMonth({ year: today.getFullYear(), month: today.getMonth() + 1 });
  }, []);


  const closeMonth = () => {
    const { liquidity, transactions, reserves: closingMonthReserves } = currentMonthData;
    const { bankAccounts, cash, receivables, creditCards } = liquidity;

    const credits = transactions.filter(t => t.type === 'CR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const startingBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const expensesFromBank = transactions
      .filter(t => t.paymentMethod !== 'Cash' && t.type === 'DR')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const closingBankBalance = startingBankBalance + credits - expensesFromBank;

    const expensesFromCash = transactions
      .filter(t => t.paymentMethod === 'Cash' && t.type === 'DR')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const closingCash = cash - expensesFromCash; 
    
    const totalDues = creditCards.reduce((sum, card) => sum + card.due, 0);
    const totalReceivables = receivables.reduce((sum, r) => sum + r.amount, 0);
    const totalClosingLiquidity = closingBankBalance + closingCash + totalReceivables;
    
    const closingLiquidityBalance = totalClosingLiquidity - totalDues;

    const nextMonthDate = addMonths(new Date(currentMonthKey), 1);
    const nextMonthKey = format(nextMonthDate, "yyyy-MM-01");

    setMonthlyData(prev => {
        const nextMonthExists = !!prev[nextMonthKey];
        
        const newNextMonthData = { 
            month: nextMonthKey,
            liquidity: {
                openingBalance: closingLiquidityBalance,
                bankAccounts: bankAccounts.map(b => ({...b, id: b.id, name: b.name, balance: closingBankBalance / (bankAccounts.length || 1)})),
                cash: closingCash, 
                creditCards: creditCards.map(c => ({...c, id: c.id, name: c.name, due: 0})),
                receivables: [],
            },
            reserves: closingMonthReserves, // Carry forward the entire reserves object
            transactions: nextMonthExists ? prev[nextMonthKey].transactions : [],
        };

        return { ...prev, [nextMonthKey]: newNextMonthData };
    });

    setCurrentMonth({ year: nextMonthDate.getFullYear(), month: nextMonthDate.getMonth() + 1 });
  };
  
  const availableMonths = useMemo(() => Array.from(new Set(Object.keys(monthlyData))).sort(), [monthlyData]);
  
  const monthlySummary = useMemo(() => {
    return availableMonths.map(monthKey => {
        const data = monthlyData[monthKey];
        if (!data) return null;

        const { liquidity, transactions, reserves } = data;
        
        const totalReserves = Object.values(reserves).flat().reduce((sum, item) => {
            if (typeof item === 'number') return sum + item;
            if (item && typeof item.amount === 'number') return sum + item.amount;
            return sum;
        }, 0);

        const { bankAccounts, cash, receivables, creditCards } = liquidity;

        const credits = transactions.filter(t => t.type === 'CR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const startingBankBalance = bankAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
        const expensesFromBank = transactions.filter(t => t.paymentMethod !== 'Cash' && t.type === 'DR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const closingBankBalance = startingBankBalance + credits - expensesFromBank;
        
        const expensesFromCash = transactions.filter(t => t.paymentMethod === 'Cash' && t.type === 'DR').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const closingCash = Number(cash || 0) - expensesFromCash;
      
        const totalReceivables = receivables.reduce((s, i) => s + Number(i.amount || 0), 0);
        const totalDues = creditCards.reduce((s,i) => s + Number(i.due || 0), 0);

        const finalLiquidity = closingBankBalance + closingCash + totalReceivables - totalDues;
        const netWorth = finalLiquidity + totalReserves;
        
        return { month: monthKey, liquidity: finalLiquidity, reserves: totalReserves, netWorth };
    }).filter(Boolean) as { month: string; liquidity: number; reserves: number; netWorth: number }[];
  }, [monthlyData, availableMonths]);


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
    deleteMultipleTransactions,
    clearTransactionsForCurrentMonth,
    clearAllData,
    updateLiquidity,
    updateReserves,
    closeMonth,
    availableMonths,
    monthlySummary,
    isDataLoaded
  };

  return (
    <FinancialsContext.Provider value={value}>
      {isDataLoaded ? (currentMonthData ? children : <div className="flex h-screen w-full items-center justify-center"><Loader className="h-8 w-8 animate-spin text-primary" /></div>) : <div className="flex h-screen w-full items-center justify-center"><Loader className="h-8 w-8 animate-spin text-primary" /></div>}
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
