
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

// --- Sanitization Logic ---
type Tx = z.infer<typeof TransactionSchema>;
const REQUIRED_KEYS: (keyof Tx)[] = [
  "date",
  "description",
  "amount",
  "type",
  "category",
  "paymentMethod",
];

const isValidDate = (s: any) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const toNumber = (x: any) => {
    if (typeof x === 'number') return x;
    if (typeof x === 'string') return Number(x.replace(/[, ]/g, ""));
    return NaN;
}

const inferType = (desc: string | undefined): 'CR' | 'DR' | undefined => {
  if (!desc) return;
  const d = desc.toUpperCase();
  if (/(REFUND|SALARY|NEFT\s*CR|IMPS\s*CR|UPI\s*CR|CREDIT|REVERSAL|INTEREST\s*CR|CASH\s*DEPOSIT)/i.test(d)) return "CR";
  if (/(UPI|POS|IMPS|NEFT\s*DR|BILLPAY|AUTOPAY|DEBIT|WITHDRAWAL|SI-|EBANK|NETBANK)/i.test(d)) return "DR";
  return;
};


function sanitizeTransactions(raw: any[], defaults = { bank: "Unknown Bank" }): Tx[] {
  const cleaned: Tx[] = [];

  raw.forEach((t, idx) => {
    if (!t || typeof t !== 'object') {
        console.warn(`Dropping row ${idx}: item is not an object.`);
        return;
    }
    
    let candidate = { ...t };
    
    // Ensure payment method
    candidate.paymentMethod = candidate.paymentMethod || defaults.bank;
    
    // Infer type if missing
    candidate.type = candidate.type || inferType(candidate.description) || "DR"; // Default to DR

    // Validate and clean fields
    const date = isValidDate(candidate.date) ? candidate.date : undefined;
    const description = candidate.description?.trim();
    const amount = toNumber(candidate.amount);
    const category = candidate.category || "Other";

    candidate = {
        ...candidate,
        date,
        description,
        amount,
        category,
    };

    const missing = REQUIRED_KEYS.filter(k => (candidate as any)[k] === undefined || (candidate as any)[k] === "" || (k === 'amount' && isNaN(candidate.amount)) );

    if (missing.length > 0) {
      console.warn(`Dropping transaction: missing or invalid fields: ${missing.join(", ")}`, t);
      return;
    }
    cleaned.push(candidate as Tx);
  });

  return cleaned;
}


const extractTransactionsFlow = ai.defineFlow(
  {
    name: 'extractTransactionsFlow',
    inputSchema: StatementInputSchema,
    outputSchema: StatementOutputSchema,
  },
  async (input) => {
    const {output} = await extractPrompt(input);
    
    if (!output || !Array.isArray(output.transactions)) {
      return { transactions: [] };
    }

    const bankName = output.transactions.find(t => t.paymentMethod)?.paymentMethod || 'Unknown Bank';

    const sanitizedTransactions = sanitizeTransactions(output.transactions, { bank: bankName });
    
    return { transactions: sanitizedTransactions };
  }
);
