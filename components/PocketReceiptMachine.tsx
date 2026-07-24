"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type ReceiptPhase = "loose" | "scanning" | "review" | "logged";

const receipts = [
  { merchant: "Mello Coffee", amount: 8.74, category: "Food", confidence: 98, rotation: -8 },
  { merchant: "TransLink", amount: 14.15, category: "Transport", confidence: 96, rotation: 7 },
  { merchant: "London Drugs", amount: 32.48, category: "Household", confidence: 93, rotation: -4 },
];

export default function PocketReceiptMachine() {
  const root = useRef<HTMLDivElement>(null);
  const receipt = useRef<HTMLButtonElement>(null);
  const scanner = useRef<HTMLDivElement>(null);
  const scanTimer = useRef<number | null>(null);
  const drag = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const [receiptIndex, setReceiptIndex] = useState(0);
  const [phase, setPhase] = useState<ReceiptPhase>("loose");
  const selected = receipts[receiptIndex];

  useEffect(() => () => {
    if (scanTimer.current) window.clearTimeout(scanTimer.current);
  }, []);

  const loadReceipt = () => {
    const receiptElement = receipt.current;
    const scannerElement = scanner.current;
    if (!receiptElement || !scannerElement) return;
    const from = receiptElement.getBoundingClientRect();
    const to = scannerElement.getBoundingClientRect();
    const x = to.left + to.width / 2 - (from.left + from.width / 2);
    const y = to.top + to.height / 2 - (from.top + from.height / 2);
    gsap.to(receiptElement, {
      x: `+=${x}`,
      y: `+=${y}`,
      rotation: 0,
      scale: 1.08,
      duration: .85,
      ease: "back.out(1.5)",
      onComplete: () => {
        setPhase("scanning");
        scanTimer.current = window.setTimeout(() => {
          setPhase("review");
          requestAnimationFrame(() => {
            gsap.fromTo(
              ".receipt-review-field",
              { x: 45, opacity: 0, rotation: 3 },
              { x: 0, opacity: 1, rotation: 0, stagger: .1, duration: .5, ease: "back.out(1.65)" },
            );
          });
        }, 1500);
      },
    });
  };

  const receiptDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (phase !== "loose") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      x: Number(gsap.getProperty(event.currentTarget, "x")) || 0,
      y: Number(gsap.getProperty(event.currentTarget, "y")) || 0,
      startX: event.clientX,
      startY: event.clientY,
    };
    gsap.to(event.currentTarget, { scale: 1.08, rotation: 0, duration: .2 });
  };

  const receiptMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    gsap.set(event.currentTarget, {
      x: drag.current.x + event.clientX - drag.current.startX,
      y: drag.current.y + event.clientY - drag.current.startY,
      rotation: (event.clientX - drag.current.startX) * .025,
    });
    const target = scanner.current?.getBoundingClientRect();
    if (!target) return;
    const over = event.clientX >= target.left && event.clientX <= target.right
      && event.clientY >= target.top && event.clientY <= target.bottom;
    scanner.current?.classList.toggle("is-armed", over);
  };

  const receiptUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const target = scanner.current?.getBoundingClientRect();
    const hit = target
      && event.clientX >= target.left && event.clientX <= target.right
      && event.clientY >= target.top && event.clientY <= target.bottom;
    scanner.current?.classList.remove("is-armed");
    if (hit) loadReceipt();
    else {
      gsap.to(event.currentTarget, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: selected.rotation,
        duration: .8,
        ease: "elastic.out(1, .38)",
      });
    }
  };

  const logExpense = () => {
    setPhase("logged");
    requestAnimationFrame(() => {
      gsap.fromTo(
        ".receipt-dashboard-output",
        { y: 90, scale: .72, opacity: 0, rotation: 5 },
        { y: 0, scale: 1, opacity: 1, rotation: 0, duration: 1, ease: "elastic.out(1, .42)" },
      );
    });
  };

  const reset = () => {
    setPhase("loose");
    setReceiptIndex((current) => (current + 1) % receipts.length);
    requestAnimationFrame(() => {
      gsap.set(receipt.current, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: receipts[(receiptIndex + 1) % receipts.length].rotation,
        opacity: 1,
      });
    });
  };

  return (
    <div className={`receipt-machine is-${phase}`} ref={root}>
      <header>
        <div><span>POCKETLOG LAB</span><strong>Turn paper into a useful decision.</strong></div>
        <p>
          {phase === "loose" && "Drag the receipt into the scanner."}
          {phase === "scanning" && "PocketLog is reading the merchant, total, and line items."}
          {phase === "review" && "Review the extracted expense before it touches the budget."}
          {phase === "logged" && "The dashboard and category budget update immediately."}
        </p>
      </header>

      <div className="receipt-workbench">
        <div className="receipt-pocket">
          <span>YOUR POCKET</span>
          <i /><i /><i />
        </div>

        <div className="receipt-scanner" ref={scanner}>
          <span>DROP RECEIPT HERE</span>
          <b>{phase === "scanning" ? "SCANNING…" : "CAMERA FRAME"}</b>
          <i />
        </div>

        {phase !== "logged" && (
          <button
            className="physical-receipt"
            ref={receipt}
            type="button"
            style={{ "--receipt-rotation": `${selected.rotation}deg` } as React.CSSProperties}
            onClick={() => phase === "loose" && loadReceipt()}
            onPointerDown={receiptDown}
            onPointerMove={receiptMove}
            onPointerUp={receiptUp}
            onPointerCancel={receiptUp}
            aria-label={`Drag ${selected.merchant} receipt into scanner`}
          >
            <small>THANK YOU</small>
            <strong>{selected.merchant}</strong>
            <span>•••• •••• •••• 3814</span>
            <ul>
              <li><span>purchase</span><b>${selected.amount.toFixed(2)}</b></li>
              <li><span>tax</span><b>${(selected.amount * .05).toFixed(2)}</b></li>
            </ul>
            <em>TOTAL ${selected.amount.toFixed(2)}</em>
            <i className="receipt-fold one" />
            <i className="receipt-fold two" />
            <div className="receipt-scan-beam" />
          </button>
        )}

        {phase === "scanning" && (
          <div className="receipt-scanning-card">
            <span>SCANNING RECEIPT</span>
            <strong>Hold still.</strong>
            <div><i /></div>
          </div>
        )}

        {phase === "review" && (
          <aside className="receipt-review">
            <header><span>LOG EXPENSE</span><strong>Review scan</strong></header>
            <div className="receipt-review-field"><small>Amount</small><strong>${selected.amount.toFixed(2)}</strong></div>
            <div className="receipt-review-field"><small>Description</small><strong>{selected.merchant}</strong></div>
            <div className="receipt-review-field"><small>Category</small><strong>{selected.category}</strong></div>
            <div className="receipt-review-field"><small>Paid by</small><strong>Abhiram</strong></div>
            <div className="receipt-review-split">
              <span>Split expense</span>
              <button type="button" aria-label="Split expense off" />
            </div>
            <button type="button" onClick={logExpense}>Log expense <span>→</span></button>
          </aside>
        )}

        {phase === "logged" && (
          <div className="receipt-dashboard-output">
            <header>
              <div><span>OVERVIEW</span><small>Total expenses · Jul 1–31</small></div>
              <strong>${(1284.63 + selected.amount).toFixed(2)}</strong>
            </header>
            <div className="pocket-dashboard-grid">
              <div className="pocket-donut">
                <i />
                <span>{selected.category}<strong>+${selected.amount.toFixed(2)}</strong></span>
              </div>
              <div className="pocket-budget-progress">
                <span>MONTHLY BUDGET <b>$1,293 / $2,100</b></span>
                <i><b /></i>
                <small>$807 remaining</small>
              </div>
            </div>
            <div className="pocket-recent-expense">
              <span>RECENT EXPENSE</span>
              <div><i>{selected.merchant.slice(0, 1)}</i><strong>{selected.merchant}<small>{selected.category} · paid by Abhiram</small></strong><b>−${selected.amount.toFixed(2)}</b></div>
            </div>
            <button type="button" onClick={reset}>Pull another receipt</button>
          </div>
        )}
      </div>

      <footer>
        <span><i>input</i><strong>paper receipt</strong></span>
        <span><i>model</i><strong>vision extraction</strong></span>
        <span><i>result</i><strong>{phase === "logged" ? "budget updated" : phase}</strong></span>
      </footer>
    </div>
  );
}
