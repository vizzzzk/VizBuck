
'use server';
/**
 * @fileOverview A flow to extract transaction data from a bank statement PDF.
 *
 * - extractTransactionsFromStatement - Parses a PDF and returns structured transaction data.
 * - StatementInput - The input type for the flow.
 * - StatementOutput - The return type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StatementInputSchema = z.object({
  statementDataUri: z
    .string()
    .describe(
      "A bank statement PDF file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type StatementInput = z.infer<typeof StatementInputSchema>;

const TransactionSchema = z.object({
    date: z.string().describe("The date of the transaction in YYYY-MM-DD format."),
    description: z.string().describe("A brief description of the transaction."),
    amount: z.number().describe("The amount of the transaction."),
    type: z.enum(['CR', 'DR']).describe("The type of transaction: CR (Credit) or DR (Debit)."),
    category: z.string().describe("A relevant category for the expense (e.g., Shopping, Food & Dining, Travel, Utilities, Salary, Other)."),
    paymentMethod: z.string().describe("The payment method, defaulting to the bank name (e.g., 'ICICI Bank')."),
});

const StatementOutputSchema = z.object({
  transactions: z.array(TransactionSchema).describe("An array of transactions extracted from the statement."),
});
export type StatementOutput = z.infer<typeof StatementOutputSchema>;


export async function extractTransactionsFromStatement(input: StatementInput): Promise<StatementOutput> {
  return extractTransactionsFlow(input);
}

const extractPrompt = ai.definePrompt({
    name: 'extractTransactionsPrompt',
    input: {schema: StatementInputSchema},
    output: {schema: StatementOutputSchema},
    prompt: `You are an expert financial analyst AI. Your task is to extract all transactions from the provided bank statement PDF.

Analyze the document carefully and extract the following details for each transaction:
- Date (in YYYY-MM-DD format)
- Description
- Amount
- Type (CR for credit/deposit, DR for debit/withdrawal)

Based on the transaction description, assign a relevant category. Common categories include: Food & Dining, Shopping, Travel, Utilities, Salary, Entertainment, Other.

For the paymentMethod, use the name of the bank from the statement.

IMPORTANT: Ensure that every single transaction object you return is complete and includes all required fields: date, description, amount, type, category, and paymentMethod. If the type of transaction (CR or DR) is ambiguous from the description, default to 'DR' for debits/withdrawals. Do not skip any transactions, even if their descriptions are unusual or truncated.

Return the data as a structured JSON object.

Statement File: {{media url=statementDataUri}}`
});


const extractTransactionsFlow = ai.defineFlow(
  {
    name: 'extractTransactionsFlow',
    inputSchema: StatementInputSchema,
    outputSchema: StatementOutputSchema,
  },
  async (input) => {
    const {output} = await extractPrompt(input);
    
    if (!output || !output.transactions) {
      return { transactions: [] };
    }

    // Sanitize the output to remove any incomplete transactions
    const requiredKeys: (keyof z.infer<typeof TransactionSchema>)[] = [
      'date',
      'description',
      'amount',
      'type',
      'category',
      'paymentMethod',
    ];

    const sanitizedTransactions = output.transactions.filter(tx => {
      return requiredKeys.every(key => tx[key] !== undefined && tx[key] !== null && tx[key] !== '');
    });
    
    return { transactions: sanitizedTransactions };
  }
);
