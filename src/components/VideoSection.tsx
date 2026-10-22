"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX, Maximize2, Zap, Shield, Sparkles } from "lucide-react";
import { useSiteConfig } from "@/context/ConfigContext";

export default function VideoSection() {
  const { config } = useSiteConfig();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // If client toggles off video section in dashboard, hide it
  if (config.showVideoSection === false) {
    return null;
  }

  const isYouTube = config.videoUrl && (config.videoUrl.includes("youtube.com") || config.videoUrl.includes("youtu.be"));
  const isVimeo = config.videoUrl && config.videoUrl.includes("vimeo.com");

  // Helper to extract YouTube embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=1&modestbranding=1`;
      }
      if (url.includes("watch?v=")) {
        const id = url.split("watch?v=")[1]?.split("&")[0];
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=1&modestbranding=1`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <section
      id="in-action"
      style={{
        padding: "96px 20px",
        backgroundColor: "#0A0B0E",
        color: "#FFFFFF",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "400px",
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.22) 0%, rgba(10, 11, 14, 0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1140px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "980px",
              backgroundColor: "rgba(124, 58, 237, 0.2)",
              border: "1px solid rgba(124, 58, 237, 0.4)",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#A855F7",
                boxShadow: "0 0 10px #A855F7",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#DDD6FE", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Live Hardware Demonstration
            </span>
          </div>

          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              margin: "0 0 14px",
            }}
          >
            {config.videoHeadline || "See Bravon in Action"}
          </h2>
          <p
            style={{
              fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)",
              color: "#94A3B8",
              maxWidth: "680px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            {config.videoSubhead ||
              "Watch high-speed 160 mm/s direct thermal printing, wireless BLE pairing, and instant label feeding in real time."}
          </p>
        </div>

        {/* Video Player Cinema Frame */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "960px",
            margin: "0 auto",
            borderRadius: "24px",
            overflow: "hidden",
            backgroundColor: "#16181F",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 30px 80px -20px rgba(124, 58, 237, 0.3), 0 20px 40px -15px rgba(0,0,0,0.6)",
          }}
        >
          {isYouTube ? (
            // YouTube Embed
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
              <iframe
                src={getYouTubeEmbedUrl(config.videoUrl)}
                title="Bravon Printer Video Demonstration"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          ) : isVimeo ? (
            // Vimeo Embed
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
              <iframe
                src={config.videoUrl}
                title="Bravon Printer Video"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          ) : (
            // Native HTML5 Video Player with Fallback Poster & Controls
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", backgroundColor: "#0F1117" }}>
              {!hasError ? (
                <video
                  ref={videoRef}
                  src={config.videoUrl || "/bravon-printer-demo.mp4"}
                  poster={config.videoPosterUrl || "/bravon-shipping-action.jpg"}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  onError={() => setHasError(true)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                // Elegant Interactive Fallback if no raw MP4 exists yet
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    backgroundImage: `url(${config.videoPosterUrl || "/bravon-shipping-action.jpg"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(10, 11, 14, 0.45)",
                      backdropFilter: "blur(2px)",
                    }}
                  />
                  <div
                    style={{
                      position: "relative",
                      zIndex: 2,
                      textAlign: "center",
                      padding: "24px",
                      maxWidth: "500px",
                    }}
                  >
                    <div
                      style={{
                        width: "68px",
                        height: "68px",
                        borderRadius: "50%",
                        backgroundColor: "var(--bravon-purple)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 18px",
                        boxShadow: "0 0 30px rgba(124, 58, 237, 0.6)",
                        cursor: "pointer",
                      }}
                      onClick={() => setHasError(false)}
                    >
                      <Play size={28} color="#FFFFFF" style={{ marginLeft: "4px" }} />
                    </div>
                    <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>
                      Bravon Commercial Dispatch in Action
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: "#CBD5E1" }}>
                      Watch continuous 160 mm/s throughput on commercial 4&quot;x6&quot; thermal labels
                    </p>
                  </div>
                </div>
              )}

              {/* Glassy Playback Controls Bar */}
              {!hasError && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "16px",
                    left: "20px",
                    right: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 16px",
                    borderRadius: "14px",
                    backgroundColor: "rgba(15, 23, 42, 0.65)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    zIndex: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={togglePlay}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: 0,
                      }}
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: 0,
                      }}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>

                    <span style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 500 }}>
                      160 mm/s Direct Thermal
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#FFFFFF",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: 0,
                    }}
                    aria-label="Fullscreen"
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Metrics Strip below video */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              backgroundColor: "rgba(22, 24, 31, 0.95)",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "20px 24px",
              gap: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(124, 58, 237, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#C084FC",
                }}
              >
                <Zap size={18} />
              </div>
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>160 mm/s</div>
                <div style={{ fontSize: "0.78rem", color: "#94A3B8" }}>1 full shipping label per second</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#34D399",
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>203 DPI Clarity</div>
                <div style={{ fontSize: "0.78rem", color: "#94A3B8" }}>Zero ink, zero ribbons, zero toner</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#60A5FA",
                }}
              >
                <Shield size={18} />
              </div>
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>2-Year Warranty</div>
                <div style={{ fontSize: "0.78rem", color: "#94A3B8" }}>300,000 meters continuous print rated</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
