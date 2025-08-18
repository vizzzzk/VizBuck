
'use server';
/**
 * @fileOverview DEPRECATED: This flow is no longer used. Replaced by extract-transactions-from-csv.ts
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const TransactionSchema = z.object({
  date: z.string().describe('The date of the transaction in YYYY-MM-DD format.'),
  description: z.string().describe('A brief description of the transaction.'),
  amount: z.number().describe('The transaction amount.'),
  type: z.enum(['CR', 'DR']).describe('The transaction type: CR (credit) or DR (debit).'),
  category: z.string().describe('A suggested category for the transaction (e.g., Food, Shopping, Salary).'),
  paymentMethod: z.string().describe('The source or destination of the funds (e.g., the bank name, cash).'),
});

const ExtractTransactionsInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file of a bank statement, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ExtractTransactionsInput = z.infer<typeof ExtractTransactionsInputSchema>;

const ExtractTransactionsOutputSchema = z.object({
  transactions: z.array(TransactionSchema),
});
export type ExtractTransactionsOutput = z.infer<typeof ExtractTransactionsOutputSchema>;

const extractPrompt = ai.definePrompt({
  name: 'extractTransactionsPrompt',
  input: {schema: ExtractTransactionsInputSchema},
  output: {schema: ExtractTransactionsOutputSchema},
  prompt: `You are an expert financial analyst. Your task is to extract all transactions from the provided bank statement PDF.

Analyze the document carefully and identify every transaction, including its date, description, amount, and whether it is a credit (CR) or debit (DR).
Infer a likely category for each transaction based on its description.
For the payment method, use the name of the bank from the statement.

Return the data as a structured list of transactions.

PDF for analysis:
{{media url=pdfDataUri}}`,
});

export async function extractTransactions(
  input: ExtractTransactionsInput
): Promise<ExtractTransactionsOutput> {
  const llmResponse = await extractPrompt(input);
  return llmResponse.output!;
}
