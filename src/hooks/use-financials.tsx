"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

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
}


// --- Initial State ---
const initialLiquidity: Liquidity = {
    bankAccounts: [{ id: 1, name: 'HDFC Bank', balance: 250000 }],
    cash: 15000,
    creditCards: [{ id: 1, name: 'HDFC Bank', due: 50000 }],
    receivables: [{ id: 1, source: 'Freelance Project', amount: 20000, date: new Date() }],
};

const initialReserves: Reserves = {
    fixedDeposits: [{id: 1, institution: 'HDFC Bank', amount: 500000}],
    stocks: [{id: 1, broker: 'Zerodha', amount: 750000}],
    crypto: [{id: 1, exchange: 'WazirX', amount: 125000}],
};

const initialTransactions: Transaction[] = [];


// --- Context Definition ---
interface FinancialsContextType {
  liquidity: Liquidity;
  setLiquidity: React.Dispatch<React.SetStateAction<Liquidity>>;
  reserves: Reserves;
  setReserves: React.Dispatch<React.SetStateAction<Reserves>>;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  isDataLoaded: boolean;
}

const FinancialsContext = createContext<FinancialsContextType | undefined>(undefined);

// --- Provider Component ---
export const FinancialsProvider = ({ children }: { children: ReactNode }) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [liquidity, setLiquidity] = useState<Liquidity>(initialLiquidity);
  const [reserves, setReserves] = useState<Reserves>(initialReserves);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Load from localStorage on initial render
  useEffect(() => {
    try {
      const storedLiquidity = localStorage.getItem('financials-liquidity');
      if (storedLiquidity) {
        const parsedLiquidity = JSON.parse(storedLiquidity);
        // Dates need to be rehydrated
        parsedLiquidity.receivables = parsedLiquidity.receivables.map((r: any) => ({...r, date: new Date(r.date)}));
        setLiquidity(parsedLiquidity);
      }
      
      const storedReserves = localStorage.getItem('financials-reserves');
      if (storedReserves) {
        setReserves(JSON.parse(storedReserves));
      }

      const storedTransactions = localStorage.getItem('financials-transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    } finally {
        setIsDataLoaded(true);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if(isDataLoaded) {
      try {
        localStorage.setItem('financials-liquidity', JSON.stringify(liquidity));
        localStorage.setItem('financials-reserves', JSON.stringify(reserves));
        localStorage.setItem('financials-transactions', JSON.stringify(transactions));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [liquidity, reserves, transactions, isDataLoaded]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now() };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const value = {
    liquidity,
    setLiquidity,
    reserves,
    setReserves,
    transactions,
    addTransaction,
    isDataLoaded
  };

  return (
    <FinancialsContext.Provider value={value}>
      {isDataLoaded ? children : null /* or a loading spinner */}
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
