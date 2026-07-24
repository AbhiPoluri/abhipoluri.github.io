import type { Metadata } from "next";
import "./prototypes.css";

export const metadata: Metadata = {
  title: "Motion prototypes — Abhi Poluri",
  description: "Three GSAP-driven motion directions for the Abhi Poluri portfolio.",
};

export default function PrototypeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
