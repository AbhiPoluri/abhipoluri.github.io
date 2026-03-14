"use client";

import { useEffect, useRef, useState } from "react";
import ScrollReveal from "./ScrollReveal";
import { products } from "@/data/products";

function ProductCard({ product }: { product: (typeof products)[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const noHover = window.matchMedia("(hover: none)").matches;
    setIsTouchDevice(noHover);
    if (noHover) videoRef.current?.play();
  }, []);

  const active = hovered || isTouchDevice;

  const handleEnter = () => {
    if (isTouchDevice) return;
    setHovered(true);
    videoRef.current?.play();
  };
  const handleLeave = () => {
    if (isTouchDevice) return;
    setHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="shipped-card"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={() => { if (product.link) window.open(product.link, "_blank"); }}
      style={{
        borderRadius: 14,
        border: "1px solid var(--border)",
        overflow: "hidden",
        cursor: product.link ? "pointer" : "default",
        background: "var(--bg)",
        transition: "border-color .2s, box-shadow .2s",
        boxShadow: active ? `0 0 0 1px ${product.accent}55, 0 8px 32px ${product.accent}18` : "none",
        borderColor: active ? product.accent + "55" : "var(--border)",
      }}
    >
      {/* Preview area */}
      <div style={{ position: "relative", aspectRatio: "1 / 1", background: "#0a0a0a", overflow: "hidden" }}>
        {product.videoSrc ? (
          <video
            ref={videoRef}
            src={product.videoSrc}
            muted
            playsInline
            loop
            preload="metadata"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              opacity: active ? 1 : 0.85,
              transition: "opacity .3s",
            }}
          />
        ) : (
          /* Placeholder for products without video */
          <div style={{
            inset: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 10,
            background: `radial-gradient(ellipse at 50% 40%, ${product.accent}18 0%, transparent 70%)`,
          }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: product.accent + "22",
              border: `1.5px solid ${product.accent}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 800,
              color: product.accent,
            }}>
              {product.name[0]}
            </div>
            <span style={{ fontSize: 11, color: product.accent, opacity: 0.5, fontWeight: 600, letterSpacing: "0.08em" }}>
              {product.name.toLowerCase()}
            </span>
          </div>
        )}

        {/* Hover hint */}
        {product.videoSrc && !active && !isTouchDevice && (
          <div style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            background: "rgba(0,0,0,0.65)",
            borderRadius: 6,
            padding: "3px 8px",
            fontSize: 10,
            color: "#aaa",
            fontWeight: 600,
            letterSpacing: "0.04em",
            pointerEvents: "none",
          }}>
            hover to preview
          </div>
        )}

        {/* Live badge */}
        {product.link && (
          <div style={{
            position: "absolute",
            top: 10,
            left: 10,
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(0,0,0,0.7)",
            borderRadius: 99,
            padding: "3px 9px",
            fontSize: 10,
            fontWeight: 700,
            color: "#4ade80",
            letterSpacing: "0.05em",
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#4ade80",
              display: "inline-block",
              boxShadow: "0 0 6px #4ade80",
            }} />
            LIVE
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "18px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <span style={{
              fontSize: "clamp(17px, 1.8vw, 20px)",
              fontWeight: 700,
              letterSpacing: "-0.015em",
              color: "var(--ink)",
              display: "block",
            }}>
              {product.name}
            </span>
            <span style={{ fontSize: 12, color: product.accent, fontWeight: 600 }}>
              {product.tagline}
            </span>
          </div>
          {product.link && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              background: product.accent + "18",
              color: product.accent,
              padding: "3px 7px",
              borderRadius: 5,
              flexShrink: 0,
              marginLeft: 8,
            }}>
              Shipped
            </span>
          )}
        </div>

        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: "8px 0 12px" }}>
          {product.description}
        </p>

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {product.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 11,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--muted)",
                padding: "2px 8px",
                borderRadius: 99,
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Shipped() {
  return (
    <section
      id="shipped"
      style={{ paddingTop: 96, borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <ScrollReveal>
          <div style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            paddingBottom: 24,
            borderBottom: "1px solid var(--border)",
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}>
              Products I&apos;ve Shipped
            </span>
          </div>
        </ScrollReveal>

        {/* Cards */}
        <div style={{ paddingTop: 40, paddingBottom: 64, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {products.map((product, i) => (
            <ScrollReveal key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
