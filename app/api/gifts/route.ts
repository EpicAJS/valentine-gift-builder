import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { giftConfigSchema, GiftConfig } from "@/lib/giftSchema";
import { supabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!supabaseServerClient) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 500 }
    );
  }

  let body: { slug?: string; config?: GiftConfig };
  try {
    body = (await request.json()) as { slug?: string; config?: GiftConfig };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.config) {
    return NextResponse.json(
      { error: "Missing gift config" },
      { status: 400 }
    );
  }

  const parsed = giftConfigSchema.safeParse(body.config);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid config" },
      { status: 400 }
    );
  }

  const slug =
    body.slug && /^[a-zA-Z0-9_-]{6,32}$/.test(body.slug)
      ? body.slug
      : nanoid(10);

  const { error } = await supabaseServerClient
    .from("gifts")
    .insert({
      slug,
      config: parsed.data
    })
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Failed to save gift" },
      { status: 500 }
    );
  }

  return NextResponse.json({ slug }, { status: 201 });
}

