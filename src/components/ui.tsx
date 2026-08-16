import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bakery-primary text-white font-display font-bold text-lg shadow-soft">
        B
      </span>
      <span className="font-display text-xl font-bold tracking-tight text-bakery-primary-dark">
        THE BAKEST
      </span>
    </Link>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  center?: boolean;
}

export function SectionHeading({ eyebrow, title, subtitle, icon: Icon, center }: SectionHeadingProps) {
  return (
    <div className={`mb-8 ${center ? 'text-center' : ''}`}>
      {eyebrow && (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-bakery-primary ${center ? 'justify-center' : ''}`}>
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {eyebrow}
        </span>
      )}
      <h2 className="mt-2 font-display text-3xl font-bold text-bakery-ink sm:text-4xl">{title}</h2>
      {subtitle && <p className={`mt-3 text-bakery-ink/60 ${center ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}>{subtitle}</p>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  actionTo,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-bakery-primary/20 bg-white/60 px-6 py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bakery-sky text-bakery-primary">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="font-display text-xl font-semibold text-bakery-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-bakery-ink/60">{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-6">
          <ShoppingBag className="h-4 w-4" />
          {actionLabel}
        </Link>
      )}
    </motion.div>
  );
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <div className={`${className} animate-spin rounded-full border-2 border-bakery-primary/20 border-t-bakery-primary`} />
  );
}

export function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-bakery-ink/50">{label}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-44 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="flex justify-between">
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}
