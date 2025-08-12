
'use server';
/**
 * @fileOverview A flow to generate an image for a wishlist item.
 *
 * - getWishlistImage - Generates an image URL for a given item name.
 * - WishlistImageInput - The input type for the getWishlistImage function.
 * - WishlistImageOutput - The return type for the getWishlistImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WishlistImageInputSchema = z.object({
  itemName: z.string().describe('The name of the wishlist item, e.g., "Mountain Bike"'),
});
export type WishlistImageInput = z.infer<typeof WishlistImageInputSchema>;

const WishlistImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type WishlistImageOutput = z.infer<typeof WishlistImageOutputSchema>;

export async function getWishlistImage(input: WishlistImageInput): Promise<WishlistImageOutput> {
  return getWishlistImageFlow(input);
}

const getWishlistImageFlow = ai.defineFlow(
  {
    name: 'getWishlistImageFlow',
    inputSchema: WishlistImageInputSchema,
    outputSchema: WishlistImageOutputSchema,
  },
  async ({itemName}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a photorealistic image of the following item on a clean, white background: ${itemName}. The image should look like a professional product photo.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media.url) {
      throw new Error('Image generation failed to return a URL.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
