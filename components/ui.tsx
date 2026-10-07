"use client";

import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="label-caps mt-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`gh-card rounded-2xl border border-earth/30 bg-white/60 p-5 shadow-[0_1px_2px_rgba(65,73,59,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

const pillTones: Record<string, string> = {
  sage: "bg-sage text-ink",
  sky: "bg-sky text-ink",
  blush: "bg-blush text-ink",
  olive: "bg-olive text-white",
  earth: "bg-earth/40 text-ink",
};

export function Pill({
  tone = "sage",
  children,
}: {
  tone?: keyof typeof pillTones;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] tracking-wide ${pillTones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "danger";
  className?: string;
  disabled?: boolean;
}) {
  const styles =
    variant === "primary"
      ? "bg-olive-deep text-cream hover:bg-ink"
      : variant === "danger"
        ? "text-blush-700 text-ink/50 hover:text-red-800 hover:bg-blush/40"
        : "border border-earth/40 text-ink hover:bg-sage/50";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`gh-press rounded-full px-4 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

const fieldCls =
  "w-full rounded-lg border border-earth/40 bg-white/80 px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] duration-200 focus:border-olive-deep focus:shadow-[0_0_0_3px_rgba(167,183,157,0.22)] placeholder:text-ink/35";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldCls} ${props.className ?? ""}`} />;
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`${fieldCls} ${props.className ?? ""}`}
      rows={props.rows ?? 2}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${fieldCls} ${props.className ?? ""}`}>
      {props.children}
    </select>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="py-8 text-center font-display text-lg italic text-ink/40">
      <span className="gh-sway mr-2 not-italic text-olive/70">❧</span>
      {children}
    </p>
  );
}

export function statusLabel(s: string) {
  return s.replaceAll("_", " ");
}
