import fs from "fs/promises";
import path from "path";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

export interface Review {
  id: string;
  author: string;
  role?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpfulCount: number;
  status: "approved" | "pending" | "rejected";
  isFeatured: boolean;
  variantPurchased?: string; // e.g. "Dark Slate" | "Arctic White"
}

export interface ReviewsStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts: { [stars: number]: number };
  recommendRate: number;
}

const LOCAL_PATH = path.join(process.cwd(), "src", "data", "reviews.json");
const TMP_PATH = path.join("/tmp", "bravon-reviews.json");

let memoryReviews: Review[] | null = null;

function mapSupabaseToReview(row: any): Review {
  return {
    id: row.id,
    author: row.author,
    role: row.role || undefined,
    rating: Number(row.rating),
    title: row.title,
    comment: row.comment,
    date: row.date,
    verified: Boolean(row.verified),
    helpfulCount: Number(row.helpful_count || 0),
    status: row.status || "approved",
    isFeatured: Boolean(row.is_featured),
    variantPurchased: row.variant_purchased || undefined,
  };
}

function mapReviewToSupabase(review: Review): any {
  return {
    id: review.id,
    author: review.author,
    role: review.role || null,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    date: review.date,
    verified: review.verified,
    helpful_count: review.helpfulCount || 0,
    status: review.status || "approved",
    is_featured: review.isFeatured || false,
    variant_purchased: review.variantPurchased || null,
  };
}

export async function readReviews(): Promise<Review[]> {
  // 1. Supabase check
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          const mapped = data.map(mapSupabaseToReview);
          memoryReviews = mapped;
          return mapped;
        } else if (error) {
          console.warn("Supabase readReviews warning, falling back to local:", error.message);
        }
      }
    } catch (err) {
      console.warn("Supabase readReviews error:", err);
    }
  }

  // 2. Local fallback
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev && memoryReviews) {
    return memoryReviews;
  }

  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryReviews = parsed;
      return parsed;
    }
  } catch {}

  try {
    const raw = await fs.readFile(TMP_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryReviews = parsed;
      return parsed;
    }
  } catch {}

  return memoryReviews || [];
}

export async function writeReviews(reviews: Review[]): Promise<boolean> {
  memoryReviews = reviews;

  // 1. Supabase sync
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const payload = reviews.map(mapReviewToSupabase);
        const { error } = await supabase.from("reviews").upsert(payload, { onConflict: "id" });
        if (error) console.error("Supabase writeReviews error:", error);
      }
    } catch (err) {
      console.error("Supabase writeReviews exception:", err);
    }
  }

  let wroteAny = false;
  // 2. Local fallback
  try {
    const dir = path.dirname(LOCAL_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(LOCAL_PATH, JSON.stringify(reviews, null, 2), "utf-8");
    wroteAny = true;
  } catch (err) {
    console.warn("Could not write reviews to LOCAL_PATH:", err);
  }

  try {
    const tmpDir = path.dirname(TMP_PATH);
    await fs.mkdir(tmpDir, { recursive: true });
    await fs.writeFile(TMP_PATH, JSON.stringify(reviews, null, 2), "utf-8");
    wroteAny = true;
  } catch {}

  return wroteAny;
}

export function computeReviewsStats(reviews: Review[]): ReviewsStats {
  const approved = reviews.filter((r) => r.status === "approved");
  if (approved.length === 0) {
    return {
      averageRating: 5.0,
      totalReviews: 0,
      ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      recommendRate: 100,
    };
  }

  const counts: { [stars: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalScore = 0;
  let recommendCount = 0;

  for (const r of approved) {
    const score = Math.min(5, Math.max(1, Math.round(r.rating)));
    counts[score] = (counts[score] || 0) + 1;
    totalScore += r.rating;
    if (r.rating >= 4) {
      recommendCount++;
    }
  }

  const avg = Number((totalScore / approved.length).toFixed(1));
  const recRate = Math.round((recommendCount / approved.length) * 100);

  return {
    averageRating: avg,
    totalReviews: approved.length,
    ratingCounts: counts,
    recommendRate: recRate,
  };
}
