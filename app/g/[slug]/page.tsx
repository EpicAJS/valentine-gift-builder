import { notFound } from "next/navigation";
import { supabaseServerClient } from "@/lib/supabase/server";
import { giftConfigSchema, GiftConfig } from "@/lib/giftSchema";
import { GiftViewer } from "./viewer";

interface PageParams {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

export default async function GiftPage({ params }: PageParams) {
  if (!supabaseServerClient) {
    notFound();
  }

  const { data, error } = await supabaseServerClient
    .from("gifts")
    .select("config")
    .eq("slug", params.slug)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const parsed = giftConfigSchema.safeParse(data.config);
  if (!parsed.success) {
    notFound();
  }

  const config: GiftConfig = parsed.data;

  return <GiftViewer config={config} />;
}

