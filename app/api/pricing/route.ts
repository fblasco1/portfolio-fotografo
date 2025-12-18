import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidar cada 5 minutos

export async function GET() {
  try {
    const query = `*[_type == "sizePricing"][0] {
      "photo": photoPricing {
        size15x21 {
          priceUSD,
          enabled
        },
        size20x30 {
          priceUSD,
          enabled
        },
        size30x45 {
          priceUSD,
          enabled
        }
      },
      "postcard": postcardPricing {
        size15x21 {
          priceUSD,
          enabled
        }
      }
    }`;

    const pricing = await client.fetch(query);

    if (!pricing) {
      return NextResponse.json(
        { error: 'No pricing data found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pricing, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Error fetching pricing from API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing data', details: error.message },
      { status: 500 }
    );
  }
}

