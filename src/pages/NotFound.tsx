import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Croissant, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
        <Croissant className="h-20 w-20 text-bakery-primary/30" />
      </motion.div>
      <h1 className="mt-6 font-display text-6xl font-bold text-bakery-primary">404</h1>
      <p className="mt-2 text-lg text-bakery-ink/60">This page went off to bake and never came back.</p>
      <Link to="/" className="btn-primary mt-8">
        <Home className="h-4 w-4" /> Back to Home
      </Link>
    </div>
  );
}
