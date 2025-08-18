
'use server';
/**
 * @fileOverview A flow to get stock holdings from the Upstox API.
 *
 * - getHoldings - A function that fetches and returns holdings.
 * - HoldingsOutput - The return type for the getHoldings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getHoldingsFromApi } from '@/services/upstox';

const HoldingSchema = z.object({
    isin: z.string(),
    tradingsymbol: z.string(),
    quantity: z.number(),
    average_price: z.number(),
    last_price: z.number(),
    close_price: z.number(),
    pnl: z.number(),
    day_change: z.number(),
    day_change_percentage: z.number(),
});

const HoldingsOutputSchema = z.object({
  holdings: z.array(HoldingSchema).describe("An array of stock holdings."),
  error: z.string().optional().describe("An error message if the operation failed."),
});
export type HoldingsOutput = z.infer<typeof HoldingsOutputSchema>;


export async function getHoldings(): Promise<HoldingsOutput> {
  return getHoldingsFlow();
}

const getHoldingsFlow = ai.defineFlow(
  {
    name: 'getHoldingsFlow',
    outputSchema: HoldingsOutputSchema,
  },
  async () => {
    try {
      const holdings = await getHoldingsFromApi();
      return { holdings };
    } catch (error: any) {
        console.error("Error in getHoldingsFlow:", error);
        return { holdings: [], error: error.message || "An unexpected error occurred while fetching holdings." };
    }
  }
);
