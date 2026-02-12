import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase/server";

interface Params {
  params: {
    slug: string;
  };
}

export async function GET(_request: Request, { params }: Params) {
  if (!supabaseServerClient) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 500 }
    );
  }

  const slug = params.slug;

  const { data, error } = await supabaseServerClient
    .from("gifts")
    .select("config")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Failed to load gift" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Gift not found" }, { status: 404 });
  }

  return NextResponse.json(data.config);
}

