import { Link } from 'react-router-dom';
import { Croissant, Mail, Phone, MapPin, Instagram, Facebook, Clock } from 'lucide-react';
import { Logo } from './ui';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-bakery-primary/10 bg-white">
      <div className="container-bk py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm leading-relaxed text-bakery-ink/60">
              Freshly Baked. Beautifully Crafted. A premium bakery crafting cakes, pastries,
              cheesecakes and artisan bakes — delivered fresh to your door.
            </p>
            <div className="flex gap-2">
              <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-bakery-sky text-bakery-primary transition-colors hover:bg-bakery-primary hover:text-white">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-bakery-sky text-bakery-primary transition-colors hover:bg-bakery-primary hover:text-white">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-bakery-ink">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/" className="text-bakery-ink/60 hover:text-bakery-primary">Home</Link></li>
              <li><Link to="/menu" className="text-bakery-ink/60 hover:text-bakery-primary">Full Menu</Link></li>
              <li><Link to="/about" className="text-bakery-ink/60 hover:text-bakery-primary">About Us</Link></li>
              <li><Link to="/contact" className="text-bakery-ink/60 hover:text-bakery-primary">Contact</Link></li>
              <li><Link to="/orders" className="text-bakery-ink/60 hover:text-bakery-primary">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-bakery-ink">Categories</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/menu?cat=cakes" className="text-bakery-ink/60 hover:text-bakery-primary">Cakes</Link></li>
              <li><Link to="/menu?cat=cheesecakes" className="text-bakery-ink/60 hover:text-bakery-primary">Cheesecakes</Link></li>
              <li><Link to="/menu?cat=croissants" className="text-bakery-ink/60 hover:text-bakery-primary">Croissants</Link></li>
              <li><Link to="/menu?cat=cake-jars" className="text-bakery-ink/60 hover:text-bakery-primary">Cake Jars</Link></li>
              <li><Link to="/menu?cat=brownies" className="text-bakery-ink/60 hover:text-bakery-primary">Brownies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-bakery-ink">Get in Touch</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-bakery-ink/60">
                <MapPin className="h-4 w-4 text-bakery-primary mt-0.5 shrink-0" />
                24 Artisan Lane, Bakery District, Mumbai 400001
              </li>
              <li className="flex items-center gap-2.5 text-bakery-ink/60">
                <Phone className="h-4 w-4 text-bakery-primary shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2.5 text-bakery-ink/60">
                <Mail className="h-4 w-4 text-bakery-primary shrink-0" />
                hello@thebakest.com
              </li>
              <li className="flex items-start gap-2.5 text-bakery-ink/60">
                <Clock className="h-4 w-4 text-bakery-primary mt-0.5 shrink-0" />
                Open daily, 8 AM – 10 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-bakery-primary/10 pt-6 sm:flex-row">
          <p className="flex items-center gap-1.5 text-xs text-bakery-ink/50">
            <Croissant className="h-3.5 w-3.5 text-bakery-primary" />
            © {new Date().getFullYear()} THE BAKEST. All rights reserved.
          </p>
          <p className="text-xs text-bakery-ink/50">Freshly Baked. Beautifully Crafted.</p>
        </div>
      </div>
    </footer>
  );
}
