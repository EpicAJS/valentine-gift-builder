import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  if (!supabaseServerClient) {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }

  const { count, error } = await supabaseServerClient
    .from("gifts")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }

  return NextResponse.json({ count: count ?? 0 });
}
