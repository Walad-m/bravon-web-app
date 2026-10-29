"use client";

import React, { useState, useEffect } from "react";
import { Star, CheckCircle2, ThumbsUp, PenTool, X, ShieldCheck, Sparkles, Filter } from "lucide-react";
import { Review, ReviewsStats } from "@/lib/reviews";

interface ReviewsSectionProps {
  productName?: string;
  defaultColor?: string;
}

export default function ReviewsSection({
  productName = "Bravon POS-9260-L",
  defaultColor = "dark",
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewsStats>({
    averageRating: 4.9,
    totalReviews: 6,
    ratingCounts: { 5: 5, 4: 1, 3: 0, 2: 0, 1: 0 },
    recommendRate: 100,
  });
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"helpful" | "recent" | "rating">("helpful");
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [votedReviews, setVotedReviews] = useState<{ [id: string]: boolean }>({});

  // Form state for writing a review
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formAuthor, setFormAuthor] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formVariant, setFormVariant] = useState(defaultColor === "dark" ? "Dark Slate" : "Arctic White");
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews?status=approved", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (id: string) => {
    if (votedReviews[id]) return;
    setVotedReviews((prev) => ({ ...prev, [id]: true }));

    // Optimistic UI update
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
    );

    try {
      await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "helpful" }),
      });
    } catch (err) {
      console.error("Error upvoting helpful:", err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formAuthor.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    if (!formTitle.trim()) {
      setFormError("Please enter a headline for your review.");
      return;
    }
    if (!formComment.trim()) {
      setFormError("Please write your detailed feedback.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: formAuthor,
          role: formRole.trim() || "Verified Buyer",
          rating: formRating,
          variantPurchased: formVariant,
          title: formTitle,
          comment: formComment,
        }),
      });
      const data = await res.json();
      if (data.success && data.review) {
        setFormSuccess(true);
        setReviews((prev) => [data.review, ...prev]);
        if (data.stats) setStats(data.stats);
        setTimeout(() => {
          setIsWriteModalOpen(false);
          setFormSuccess(false);
          setFormAuthor("");
          setFormRole("");
          setFormTitle("");
          setFormComment("");
          setFormRating(5);
        }, 1500);
      } else {
        setFormError(data.error || "Failed to submit review.");
      }
    } catch (err) {
      setFormError("Network error while submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter & Sort reviews
  const filteredReviews = reviews
    .filter((r) => {
      if (selectedFilter === "all") return true;
      return Math.round(r.rating) === selectedFilter;
    })
    .sort((a, b) => {
      if (sortBy === "helpful") return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      if (sortBy === "recent") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  return (
    <section
      id="reviews"
      style={{
        padding: "80px 20px",
        backgroundColor: "#FAFAFC",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span className="eyebrow" style={{ display: "inline-block", marginBottom: "8px" }}>
            Real Merchant Feedback
          </span>
          <h2
            style={{
              fontSize: "clamp(2rem, 3.8vw, 2.75rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#0F172A",
              marginBottom: "12px",
            }}
          >
            Customer Reviews & Ratings
          </h2>
          <p style={{ color: "#64748B", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto" }}>
            See how small businesses, e-commerce founders, and warehouse teams rely on the {productName} every day.
          </p>
        </div>

        {/* Scorecard Overview Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            padding: "36px 32px",
            boxShadow: "0 4px 24px rgba(15, 23, 42, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            marginBottom: "36px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px",
            alignItems: "center",
          }}
        >
          {/* Left: Overall Score */}
          <div style={{ textAlign: "center", borderRight: "1px solid rgba(0,0,0,0.06)", paddingRight: "20px" }}>
            <div
              style={{
                fontSize: "4rem",
                fontWeight: 900,
                color: "#0F172A",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                marginBottom: "8px",
              }}
            >
              {stats.averageRating.toFixed(1)}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "8px" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={20}
                  fill={s <= Math.round(stats.averageRating) ? "#F59E0B" : "none"}
                  color={s <= Math.round(stats.averageRating) ? "#F59E0B" : "#CBD5E1"}
                />
              ))}
            </div>
            <p style={{ fontSize: "0.9rem", color: "#64748B", fontWeight: 600, marginBottom: "4px" }}>
              Based on {stats.totalReviews} verified reviews
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#7C3AED",
                backgroundColor: "rgba(124, 58, 237, 0.08)",
                padding: "4px 12px",
                borderRadius: "999px",
              }}
            >
              <Sparkles size={13} />
              <span>{stats.recommendRate}% of merchants recommend this printer</span>
            </div>
          </div>

          {/* Middle: Star Distribution Bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[5, 4, 3, 2, 1].map((starNum) => {
              const count = stats.ratingCounts[starNum] || 0;
              const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
              return (
                <div
                  key={starNum}
                  onClick={() => setSelectedFilter(selectedFilter === starNum ? "all" : starNum)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    padding: "2px 4px",
                    borderRadius: "6px",
                    backgroundColor: selectedFilter === starNum ? "rgba(124, 58, 237, 0.06)" : "transparent",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", width: "45px" }}>
                    {starNum} star
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "8px",
                      backgroundColor: "#F1F5F9",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        backgroundColor: "#F59E0B",
                        borderRadius: "999px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600, width: "35px", textAlign: "right" }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right: CTA Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "16px",
              backgroundColor: "#F8FAFC",
              borderRadius: "14px",
              border: "1px dashed rgba(124, 58, 237, 0.25)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "rgba(124, 58, 237, 0.1)",
                color: "#7C3AED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>
              Verified Owner?
            </h4>
            <p style={{ fontSize: "0.84rem", color: "#64748B", marginBottom: "16px", maxWidth: "240px" }}>
              Share your printing workflow and help fellow sellers elevate their shipping desk.
            </p>
            <button
              onClick={() => setIsWriteModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#7C3AED",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "999px",
                padding: "10px 22px",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <PenTool size={15} />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Filters and Controls Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
            marginBottom: "24px",
            padding: "8px 4px",
          }}
        >
          {/* Star Filter Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748B", marginRight: "4px" }}>
              <Filter size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
              Filter:
            </span>
            <button
              onClick={() => setSelectedFilter("all")}
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "0.85rem",
                fontWeight: 600,
                border: selectedFilter === "all" ? "1px solid #7C3AED" : "1px solid rgba(0,0,0,0.08)",
                backgroundColor: selectedFilter === "all" ? "#7C3AED" : "#FFFFFF",
                color: selectedFilter === "all" ? "#FFFFFF" : "#475569",
                cursor: "pointer",
              }}
            >
              All ({reviews.length})
            </button>
            {[5, 4, 3].map((star) => {
              const count = reviews.filter((r) => Math.round(r.rating) === star).length;
              return (
                <button
                  key={star}
                  onClick={() => setSelectedFilter(star)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    border: selectedFilter === star ? "1px solid #7C3AED" : "1px solid rgba(0,0,0,0.08)",
                    backgroundColor: selectedFilter === star ? "#7C3AED" : "#FFFFFF",
                    color: selectedFilter === star ? "#FFFFFF" : "#475569",
                    cursor: "pointer",
                  }}
                >
                  <span>{star}</span>
                  <Star size={13} fill={selectedFilter === star ? "#FFFFFF" : "#F59E0B"} color="none" />
                  <span>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.1)",
                backgroundColor: "#FFFFFF",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#1E293B",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="helpful">Most Helpful</option>
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94A3B8" }}>Loading verified reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 20px",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ color: "#64748B", fontSize: "0.95rem", marginBottom: "12px" }}>
              No reviews match your selected star filter.
            </p>
            <button
              onClick={() => setSelectedFilter("all")}
              style={{
                backgroundColor: "#7C3AED",
                color: "#FFFFFF",
                border: "none",
                padding: "8px 18px",
                borderRadius: "999px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Show All Reviews
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredReviews.map((review) => {
              const initials = review.author
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <div
                  key={review.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 2px 12px rgba(15, 23, 42, 0.04)",
                    border: "1px solid rgba(0, 0, 0, 0.06)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(15, 23, 42, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(15, 23, 42, 0.04)";
                  }}
                >
                  <div>
                    {/* Top User Info Bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "50%",
                          backgroundColor: "#0F172A",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          flexShrink: 0,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <h4
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: 700,
                              color: "#0F172A",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {review.author}
                          </h4>
                          {review.verified && (
                            <span
                              title="Verified Purchase"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                color: "#16A34A",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                              }}
                            >
                              <CheckCircle2 size={13} fill="#16A34A" color="#FFFFFF" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        {review.role && (
                          <p style={{ fontSize: "0.78rem", color: "#64748B", margin: 0 }}>{review.role}</p>
                        )}
                      </div>
                    </div>

                    {/* Star Rating and Variant Tag */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                        flexWrap: "wrap",
                        gap: "6px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "3px" }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={16}
                            fill={s <= review.rating ? "#F59E0B" : "none"}
                            color={s <= review.rating ? "#F59E0B" : "#CBD5E1"}
                          />
                        ))}
                      </div>
                      {review.variantPurchased && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            color: "#475569",
                            backgroundColor: "#F1F5F9",
                            padding: "2px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          Finish: {review.variantPurchased}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h5
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#0F172A",
                        marginBottom: "8px",
                        lineHeight: 1.35,
                      }}
                    >
                      &ldquo;{review.title}&rdquo;
                    </h5>

                    {/* Body Comment */}
                    <p
                      style={{
                        fontSize: "0.88rem",
                        color: "#475569",
                        lineHeight: 1.6,
                        marginBottom: "16px",
                      }}
                    >
                      {review.comment}
                    </p>
                  </div>

                  {/* Card Footer: Date & Helpful button */}
                  <div
                    style={{
                      borderTop: "1px solid rgba(0,0,0,0.06)",
                      paddingTop: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.78rem",
                      color: "#94A3B8",
                    }}
                  >
                    <span>{review.date}</span>
                    <button
                      type="button"
                      onClick={() => handleHelpful(review.id)}
                      disabled={votedReviews[review.id]}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "none",
                        border: "none",
                        color: votedReviews[review.id] ? "#7C3AED" : "#64748B",
                        fontWeight: votedReviews[review.id] ? 700 : 500,
                        fontSize: "0.78rem",
                        cursor: votedReviews[review.id] ? "default" : "pointer",
                      }}
                    >
                      <ThumbsUp size={13} />
                      <span>
                        Helpful ({review.helpfulCount || 0})
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Write a Review Modal */}
      {isWriteModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsWriteModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "540px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              onClick={() => setIsWriteModalOpen(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                color: "#64748B",
                cursor: "pointer",
                padding: "6px",
              }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: "20px" }}>
              <span className="eyebrow" style={{ display: "inline-block", marginBottom: "4px" }}>
                Verified Review
              </span>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0F172A" }}>
                Review the {productName}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#64748B", marginTop: "4px" }}>
                Your review helps other founders and merchants choose the best thermal printing setup.
              </p>
            </div>

            {formSuccess ? (
              <div
                style={{
                  padding: "32px 20px",
                  textAlign: "center",
                  backgroundColor: "rgba(22, 163, 74, 0.08)",
                  borderRadius: "14px",
                  color: "#16A34A",
                }}
              >
                <CheckCircle2 size={40} style={{ margin: "0 auto 12px" }} />
                <h4 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Review Published!</h4>
                <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>
                  Thank you for contributing to the Bravon merchant community.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                {formError && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      color: "#DC2626",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "16px",
                    }}
                  >
                    {formError}
                  </div>
                )}

                {/* Star Selector */}
                <div style={{ marginBottom: "20px", textAlign: "center" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>
                    Overall Rating
                  </label>
                  <div style={{ display: "inline-flex", gap: "8px" }}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const fill = (hoverRating || formRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setFormRating(star)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                          }}
                        >
                          <Star
                            size={28}
                            fill={fill ? "#F59E0B" : "none"}
                            color={fill ? "#F59E0B" : "#CBD5E1"}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600, marginTop: "4px" }}>
                    {formRating === 5 && "5 Stars — Outstanding (Fast, Reliable, Zero Jams)"}
                    {formRating === 4 && "4 Stars — Great Performance"}
                    {formRating === 3 && "3 Stars — Average"}
                    {formRating === 2 && "2 Stars — Needs Improvement"}
                    {formRating === 1 && "1 Star — Poor Experience"}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(0,0,0,0.12)",
                        fontSize: "0.88rem",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Role or Business Name
                    </label>
                    <input
                      type="text"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder="e.g. Etsy Seller, Logistics Lead"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(0,0,0,0.12)",
                        fontSize: "0.88rem",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Model Finish Purchased
                  </label>
                  <select
                    value={formVariant}
                    onChange={(e) => setFormVariant(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0,0,0,0.12)",
                      fontSize: "0.88rem",
                      outline: "none",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <option value="Dark Slate">Dark Slate (Commercial Stealth Matte)</option>
                    <option value="Arctic White">Arctic White (Clean Studio Finish)</option>
                  </select>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Headline / Summary *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Prints 450 labels daily without a single jam"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0,0,0,0.12)",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Your Detailed Review *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="How does the printer perform on your packing station? Mention speed, label stand, software, Mac/Windows connection..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0,0,0,0.12)",
                      fontSize: "0.88rem",
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setIsWriteModalOpen(false)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0,0,0,0.12)",
                      backgroundColor: "#FFFFFF",
                      color: "#475569",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#7C3AED",
                      color: "#FFFFFF",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      cursor: submitting ? "wait" : "pointer",
                      boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
                    }}
                  >
                    {submitting ? "Publishing..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
