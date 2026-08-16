import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Leaf, Award, Clock, ArrowRight, Sparkles, Croissant } from 'lucide-react';
import { SectionHeading } from '@/components/ui';

const values = [
  { icon: Heart, title: 'Crafted with Love', desc: 'Every bake is made by hand, in small batches, by our passionate bakers.' },
  { icon: Leaf, title: 'Finest Ingredients', desc: 'We source premium Belgian chocolate, real fruit, and farm-fresh dairy.' },
  { icon: Award, title: 'Award-Winning', desc: 'Recognised for our cheesecakes, croissants, and signature fusion cakes.' },
  { icon: Clock, title: 'Baked Fresh Daily', desc: 'Our ovens run from dawn — you always get same-day freshness.' },
];

export default function About() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-bakery-primary to-bakery-primary-dark py-20 text-white">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-white/5" />
        <div className="container-bk relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" /> Our Story
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold sm:text-5xl">About THE BAKEST</h1>
            <p className="mt-4 text-lg leading-relaxed text-white/85">
              We're a premium bakery & patisserie born from a simple belief — that beautifully crafted,
              freshly baked treats can turn any moment into a celebration.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container-bk mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <img
            src="https://images.pexels.com/photos/20543564/pexels-photo-20543564.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Bakery interior"
            className="rounded-3xl shadow-card object-cover w-full aspect-[4/3]"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl font-bold text-bakery-ink">From our oven to your table</h2>
          <p className="mt-4 text-bakery-ink/70 leading-relaxed">
            THE BAKEST started as a tiny neighbourhood kitchen with one oven and a big dream.
            Today we craft over 120 baked delights — from classic fruit cakes and viral mango
            cheesecakes to flaky croissants and Korean cream cheese buns.
          </p>
          <p className="mt-3 text-bakery-ink/70 leading-relaxed">
            Every item is baked fresh daily using the finest ingredients. No shortcuts, no
            preservatives — just real, honest, beautifully crafted baking.
          </p>
          <Link to="/menu" className="btn-primary mt-6">
            Explore Our Menu <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      <section className="container-bk mt-20">
        <SectionHeading eyebrow="What we stand for" title="Our Values" center />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card p-6 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-bakery-sky text-bakery-primary">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-bakery-ink">{v.title}</h3>
              <p className="mt-2 text-sm text-bakery-ink/55">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-bk mt-20">
        <div className="grid gap-6 rounded-3xl bg-bakery-sky p-10 text-center sm:grid-cols-3">
          {[
            { num: '120+', label: 'Baked Delights' },
            { num: '16', label: 'Categories' },
            { num: '10K+', label: 'Happy Customers' },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl font-bold text-bakery-primary-dark">{s.num}</p>
              <p className="mt-1 text-sm text-bakery-ink/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-bk mt-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-bakery-primary to-bakery-primary-dark px-8 py-12 text-center">
          <Croissant className="mx-auto h-8 w-8 text-bakery-cream" />
          <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">Taste the difference today</h2>
          <Link to="/menu" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-bakery-primary-dark transition-transform hover:scale-105">
            Start Your Order <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
