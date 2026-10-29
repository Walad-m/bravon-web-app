import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Review, readReviews, writeReviews, computeReviewsStats } from "@/lib/reviews";
import { verifyAdminSessionToken } from "@/lib/sessionToken";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "approved";

    const allReviews = await readReviews();
    const stats = computeReviewsStats(allReviews);

    let filtered = allReviews;
    if (statusFilter !== "all") {
      filtered = allReviews.filter((r) => r.status === statusFilter);
    }

    return NextResponse.json({
      success: true,
      reviews: filtered,
      stats,
    });
  } catch (error: unknown) {
    console.error("GET /api/reviews error:", error);
    const message = error instanceof Error ? error.message : "Error fetching reviews";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { author, role, rating, title, comment, variantPurchased } = body;

    if (!author || typeof author !== "string" || !author.trim()) {
      return NextResponse.json({ success: false, error: "Reviewer name is required" }, { status: 400 });
    }
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ success: false, error: "Review headline is required" }, { status: 400 });
    }
    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json({ success: false, error: "Review comments are required" }, { status: 400 });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json({ success: false, error: "Rating must be between 1 and 5 stars" }, { status: 400 });
    }

    const reviews = await readReviews();

    const newReview: Review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      author: author.trim(),
      role: role && typeof role === "string" ? role.trim() : "Verified Merchant",
      rating: Math.round(numRating),
      title: title.trim(),
      comment: comment.trim(),
      date: new Date().toISOString().split("T")[0],
      verified: true,
      helpfulCount: 0,
      status: "approved", // Auto-approved by default for instant feedback
      isFeatured: false,
      variantPurchased: variantPurchased || "Dark Slate",
    };

    reviews.unshift(newReview);
    await writeReviews(reviews);

    const stats = computeReviewsStats(reviews);

    return NextResponse.json({
      success: true,
      review: newReview,
      stats,
      message: "Thank you! Your verified review has been published.",
    });
  } catch (error: unknown) {
    console.error("POST /api/reviews error:", error);
    const message = error instanceof Error ? error.message : "Error submitting review";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, status, isFeatured } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Review ID is required" }, { status: 400 });
    }

    const reviews = await readReviews();
    const index = reviews.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    if (action === "helpful") {
      reviews[index].helpfulCount = (reviews[index].helpfulCount || 0) + 1;
    } else if (action === "status" || action === "feature") {
      const cookieStore = await cookies();
      const session = cookieStore.get("bravon_admin_session");
      if (!verifyAdminSessionToken(session?.value)) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      if (action === "status" && status) {
        reviews[index].status = status;
      } else if (action === "feature" && typeof isFeatured === "boolean") {
        reviews[index].isFeatured = isFeatured;
      }
    } else {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    await writeReviews(reviews);
    const stats = computeReviewsStats(reviews);

    return NextResponse.json({
      success: true,
      review: reviews[index],
      stats,
    });
  } catch (error: unknown) {
    console.error("PATCH /api/reviews error:", error);
    const message = error instanceof Error ? error.message : "Error updating review";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("bravon_admin_session");
    if (!verifyAdminSessionToken(session?.value)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Review ID is required" }, { status: 400 });
    }

    let reviews = await readReviews();
    const beforeCount = reviews.length;
    reviews = reviews.filter((r) => r.id !== id);

    if (reviews.length === beforeCount) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    await writeReviews(reviews);
    const stats = computeReviewsStats(reviews);

    return NextResponse.json({
      success: true,
      stats,
      message: "Review successfully deleted",
    });
  } catch (error: unknown) {
    console.error("DELETE /api/reviews error:", error);
    const message = error instanceof Error ? error.message : "Error deleting review";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
