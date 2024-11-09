// src/app/api/monthly-stats/[month]/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: { month: string } }
) {
  const filePath = path.join(
    process.cwd(),
    `public/data/monthly/${params.month}_Data.json`
  );
  const fileContent = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(fileContent);
  return NextResponse.json(data);
}
