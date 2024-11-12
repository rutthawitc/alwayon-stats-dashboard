import { promises as fs } from "fs";
import path from "path";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Get month from URL
    const url = new URL(request.url);
    const month = url.pathname.split('/').pop();

    const filePath = path.join(
      process.cwd(),
      `public/data/monthly/${month}_Data.json`
    );

    const rawData = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(rawData);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch monthly data' }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}