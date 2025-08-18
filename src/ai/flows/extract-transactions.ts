
'use server';
/**
 * @fileOverview Extracts bank transactions from a PDF file.
 *
 * - extractTransactions - A function that handles the transaction extraction from a PDF.
 * - ExtractTransactionsInput - The input type for the function.
 * - ExtractTransactionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const TransactionSchema = z.object({
  date: z.string().describe('The date of the transaction in YYYY-MM-DD format. Standardize various date formats (like dd-mon-yy, dd/mm/yyyy) into this single format.'),
  description: z.string().describe('A brief description of the transaction.'),
  amount: z.number().describe('The transaction amount. This should always be a positive number.'),
  type: z.enum(['CR', 'DR']).describe('The transaction type: CR (credit/deposit) or DR (debit/withdrawal).'),
  category: z.string().describe('A suggested category for the transaction (e.g., Food, Shopping, Salary, Transfer, Other).'),
  paymentMethod: z.string().describe('The bank or payment method used. Extract this from the PDF source if possible, otherwise label it based on context.'),
});

const ExtractTransactionsInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file of a bank statement, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
    bankName: z.string().describe('The name of the bank for context. e.g., "HDFC Bank"'),
});
export type ExtractTransactionsInput = z.infer<typeof ExtractTransactionsInputSchema>;

const ExtractTransactionsOutputSchema = z.object({
  transactions: z.array(TransactionSchema),
});
export type ExtractTransactionsOutput = z.infer<typeof ExtractTransactionsOutputSchema>;

export async function extractTransactions(
  input: ExtractTransactionsInput
): Promise<ExtractTransactionsOutput> {
  return extractTransactionsFlow(input);
}


const extractPrompt = ai.definePrompt({
  name: 'extractTransactionsPrompt',
  input: {schema: ExtractTransactionsInputSchema},
  output: {schema: ExtractTransactionsOutputSchema},
  prompt: `You are an expert financial analyst. Your task is to extract all transactions from the provided bank statement PDF.

The statement is from {{bankName}}. Use this as the 'paymentMethod' for all extracted transactions.

Analyze the document carefully and identify every transaction, including its date, description, amount, and whether it is a credit (CR) or debit (DR).
- Date: Convert all dates to a consistent YYYY-MM-DD format.
- Amount: Ensure the amount is always a positive number. Determine the type (CR/DR) from context, such as separate credit/debit columns or signs.
- Category: Infer a likely category for each transaction based on its description (e.g., Food, Shopping, Salary, Transfer, Other).

Return the data as a structured list of transactions.

PDF for analysis:
{{media url=pdfDataUri}}`,
});

const extractTransactionsFlow = ai.defineFlow(
  {
    name: 'extractTransactionsFlow',
    inputSchema: ExtractTransactionsInputSchema,
    outputSchema: ExtractTransactionsOutputSchema,
  },
  async (input) => {
    const {output} = await extractPrompt(input);
    return output!;
  }
);
