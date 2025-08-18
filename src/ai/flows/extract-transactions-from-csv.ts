
'use server';
/**
 * @fileOverview DEPRECATED: This flow is no longer used. Replaced by extract-transactions.ts for PDF processing.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const TransactionSchema = z.object({
  date: z.string().describe('The date of the transaction in YYYY-MM-DD format. Standardize various date formats (like dd-mon-yy, dd/mm/yyyy) into this single format.'),
  description: z.string().describe('A brief description of the transaction.'),
  amount: z.number().describe('The transaction amount. This should always be a positive number.'),
  type: z.enum(['CR', 'DR']).describe('The transaction type: CR (credit/deposit) or DR (debit/withdrawal).'),
  category: z.string().describe('A suggested category for the transaction (e.g., Food, Shopping, Salary, Transfer, Other).'),
  paymentMethod: z.string().describe('The bank or payment method used. Extract this from the CSV source if possible, otherwise label it based on context.'),
});

const ExtractCsvInputSchema = z.object({
  csvData: z.string().describe('The raw text content of a CSV file containing bank transactions.'),
  bankName: z.string().describe('The name of the bank for context. e.g., "HDFC Bank"'),
});
export type ExtractCsvInput = z.infer<typeof ExtractCsvInputSchema>;

const ExtractCsvOutputSchema = z.object({
  transactions: z.array(TransactionSchema),
});
export type ExtractCsvOutput = z.infer<typeof ExtractCsvOutputSchema>;


export async function extractTransactionsFromCsv(input: ExtractCsvInput): Promise<ExtractCsvOutput> {
    return extractTransactionsFromCsvFlow(input);
}


const prompt = ai.definePrompt({
  name: 'extractTransactionsFromCsvPrompt',
  input: {schema: ExtractCsvInputSchema},
  output: {schema: ExtractCsvOutputSchema},
  prompt: `You are an expert data processor specializing in financial statements. Your task is to extract all transactions from the provided CSV data.

The CSV data is from {{bankName}}. Use this as the 'paymentMethod' for all transactions.

The CSV may have varying column headers. Intelligently map the columns to the required fields: 'date', 'description', 'amount', and 'type'.
- Date: Look for headers like 'Date', 'Transaction Date', etc. Convert the date to YYYY-MM-DD format.
- Description: Look for headers like 'Narration', 'Description', 'Transaction Details'.
- Amount: There might be separate columns for debit and credit, or a single amount column. The final 'amount' should ALWAYS be a positive number.
- Type: Determine if the transaction is a 'CR' (credit) or 'DR' (debit). If there are separate debit/credit columns, use the one with a value. If there is a single column with signs, a negative value usually means debit.

Infer a likely 'category' for each transaction based on its description.

Return the data as a structured list of transactions.

CSV Data:
---
{{{csvData}}}
---`,
});


const extractTransactionsFromCsvFlow = ai.defineFlow(
  {
    name: 'extractTransactionsFromCsvFlow',
    inputSchema: ExtractCsvInputSchema,
    outputSchema: ExtractCsvOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
