import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Cake,
  Cookie,
  Croissant,
  Candy,
  Coffee,
  Star,
  Quote,
  Truck,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { menuApi, reviewsApi } from '@/lib/api';
import type { MenuItem, Review, Category } from '@/lib/types';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { SectionHeading, EmptyState } from '@/components/ui';

const heroImg =
  'https://images.pexels.com/photos/10507819/pexels-photo-10507819.jpeg?auto=compress&cs=tinysrgb&h=900&w=1400';

const categoryShowcase = [
  { name: 'Cakes', slug: 'cakes', icon: Cake, image: 'https://images.pexels.com/photos/28402363/pexels-photo-28402363.jpeg?auto=compress&cs=tinysrgb&h=400&w=600' },
  { name: 'Cheesecakes', slug: 'cheesecakes', icon: Star, image: 'https://images.pexels.com/photos/38495630/pexels-photo-38495630.jpeg?auto=compress&cs=tinysrgb&h=400&w=600' },
  { name: 'Cake Jars', slug: 'cake-jars', icon: Candy, image: 'https://images.pexels.com/photos/4110008/pexels-photo-4110008.jpeg?auto=compress&cs=tinysrgb&h=400&w=600' },
  { name: 'Croissants', slug: 'croissants', icon: Croissant, image: 'https://images.pexels.com/photos/13736076/pexels-photo-13736076.jpeg?auto=compress&cs=tinysrgb&h=400&w=600' },
  { name: 'Brownies', slug: 'brownies', icon: Cookie, image: 'https://images.pexels.com/photos/9501658/pexels-photo-9501658.jpeg?auto=compress&cs=tinysrgb&h=400&w=600' },
  { name: 'Cookies', slug: 'cookies', icon: Cookie, image: 'https://images.pexels.com/photos/2309256/pexels-photo-2309256.jpeg?auto=compress&cs=tinysrgb&h=400&w=600' },
];

const features = [
  { icon: Truck, title: 'Fresh Delivery', desc: 'Free over ₹750, baked & delivered same day' },
  { icon: ShieldCheck, title: 'Premium Quality', desc: 'Hand-crafted with the finest ingredients' },
  { icon: Clock, title: 'Open Daily', desc: '8 AM – 10 PM, every day of the week' },
  { icon: Sparkles, title: 'Beautifully Crafted', desc: 'Every bake made with artistry & care' },
];

export default function Home() {
  const [bestsellers, setBestsellers] = useState<MenuItem[]>([]);
  const [cakes, setCakes] = useState<MenuItem[]>([]);
  const [cheesecakes, setCheesecakes] = useState<MenuItem[]>([]);
  const [pastries, setPastries] = useState<MenuItem[]>([]);
  const [jars, setJars] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [menuRes, reviewsRes] = await Promise.all([
        menuApi.list(),
        reviewsApi.approved(),
      ]);
      const allItems = (menuRes.data as MenuItem[]) ?? [];
      const allReviews = (reviewsRes.data as Review[]) ?? [];

      const cats = allItems
        .map((i) => i.category as Category | undefined)
        .filter((c, idx, arr) => c && arr.findIndex((x) => x?.id === c?.id) === idx) as Category[];
      const cakesCat = cats.find((c) => c.slug === 'cakes');
      const cheeseCat = cats.find((c) => c.slug === 'cheesecakes');
      const pastryCat = cats.find((c) => c.slug === 'pastries');
      const jarCat = cats.find((c) => c.slug === 'cake-jars');

      const available = allItems.filter((i) => i.available);
      const byCat = (catId?: string) => available.filter((i) => i.category_id === catId);

      setBestsellers(available.filter((i) => i.bestseller).slice(0, 4));
      setCakes(byCat(cakesCat?.id).slice(0, 4));
      setCheesecakes(byCat(cheeseCat?.id).slice(0, 4));
      setPastries(byCat(pastryCat?.id).slice(0, 4));
      setJars(byCat(jarCat?.id).slice(0, 4));
      setReviews(allReviews.slice(0, 6));
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Bakery display" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-bakery-primary-dark/85 via-bakery-primary/75 to-bakery-primary-dark/70" />
        </div>
        <div className="container-bk relative flex min-h-[88vh] items-center py-20 lg:min-h-[92vh]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" /> Premium Bakery & Patisserie
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              THE BAKEST
            </h1>
            <p className="mt-4 font-display text-xl text-bakery-cream/90 sm:text-2xl">
              Freshly Baked. Beautifully Crafted.
            </p>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80">
              From decadent cakes and silky cheesecakes to flaky croissants and gooey brownies —
              every treat is hand-crafted by our bakers and delivered fresh to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/menu" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-bakery-primary-dark shadow-card transition-all hover:scale-[1.02] hover:bg-bakery-cream active:scale-[0.98]">
                Order Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/menu" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20">
                Explore Menu
              </Link>
            </div>
          </motion.div>
        </div>
        {/* wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0 80L1440 80L1440 20C1200 50 960 60 720 50C480 40 240 20 0 40L0 80Z" fill="#FFF8ED" />
          </svg>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container-bk -mt-2 relative z-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card flex items-start gap-3 p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bakery-sky text-bakery-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-bakery-ink">{f.title}</h3>
                <p className="mt-1 text-xs text-bakery-ink/55">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CATEGORY SHOWCASE */}
      <section className="container-bk mt-20">
        <SectionHeading
          eyebrow="Browse by craving"
          title="Find your favourite treat"
          subtitle="Sixteen categories of freshly baked goodness — from celebration cakes to everyday bites."
          center
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categoryShowcase.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/menu?cat=${c.slug}`}
                className="group relative block aspect-square overflow-hidden rounded-2xl shadow-soft"
              >
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-bakery-primary-dark/80 via-bakery-primary/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 p-3">
                  <c.icon className="h-4 w-4 text-white" />
                  <span className="font-display text-sm font-semibold text-white">{c.name}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link to="/menu" className="btn-secondary">
            View all 16 categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="container-bk mt-20">
        <SectionHeading
          eyebrow="Most loved"
          title="Best Sellers"
          subtitle="The bakes our customers can't stop ordering."
          icon={Star}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : bestsellers.map((item) => <ProductCard key={item.id} item={item} />)}
        </div>
      </section>

      {/* CAKES */}
      <ProductRow title="Popular Cakes" items={cakes} loading={loading} to="/menu?cat=cakes" />

      {/* CHEESECAKES */}
      <ProductRow title="Cheesecakes" items={cheesecakes} loading={loading} to="/menu?cat=cheesecakes" />

      {/* PASTRIES */}
      <ProductRow title="Pastries" items={pastries} loading={loading} to="/menu?cat=pastries" />

      {/* CAKE JARS */}
      <ProductRow title="Cake Jars" items={jars} loading={loading} to="/menu?cat=cake-jars" />

      {/* REVIEWS */}
      <section className="container-bk mt-20">
        <SectionHeading
          eyebrow="Testimonials"
          title="What People Say"
          subtitle="Real reviews from real Bakest customers."
          icon={Quote}
          center
        />
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-6 space-y-3">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={Quote}
            title="No reviews yet"
            message="Be the first to review! Place an order, then share your experience."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card p-6"
              >
                <div className="flex items-center gap-1 text-accent-gold">
                  {Array.from({ length: r.rating }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-accent-gold" />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-bakery-ink/70">"{r.comment}"</p>
                <p className="mt-4 font-display text-sm font-semibold text-bakery-ink">— {r.user_name || 'Bakest Customer'}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container-bk mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-bakery-primary to-bakery-primary-dark px-8 py-14 text-center shadow-card">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/5" />
          <div className="relative">
            <Coffee className="mx-auto h-10 w-10 text-bakery-cream" />
            <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
              Ready for something delicious?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-white/80">
              Browse the full menu and have your favourites delivered fresh, straight from our oven to your table.
            </p>
            <Link to="/menu" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-bakery-primary-dark shadow-soft transition-transform hover:scale-[1.03]">
              Start Your Order <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductRow({ title, items, loading, to }: { title: string; items: MenuItem[]; loading: boolean; to: string }) {
  if (!loading && items.length === 0) return null;
  return (
    <section className="container-bk mt-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-bakery-ink sm:text-3xl">{title}</h2>
        <Link to={to} className="inline-flex items-center gap-1 text-sm font-semibold text-bakery-primary hover:text-bakery-primary-dark">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : items.map((item) => <ProductCard key={item.id} item={item} />)}
      </div>
    </section>
  );
}
