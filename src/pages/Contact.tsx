import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { SectionHeading } from '@/components/ui';

const contactInfo = [
  { icon: MapPin, label: 'Visit Us', value: '24 Artisan Lane, Bakery District, Mumbai 400001' },
  { icon: Phone, label: 'Call Us', value: '+91 98765 43210' },
  { icon: Mail, label: 'Email Us', value: 'hello@thebakest.com' },
  { icon: Clock, label: 'Opening Hours', value: 'Open daily, 8 AM – 10 PM' },
];

export default function Contact() {
  const { notify } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulated contact form — no backend mail server in this environment
    setTimeout(() => {
      setSending(false);
      setForm({ name: '', email: '', message: '' });
      notify('Thanks for reaching out! We\'ll get back to you soon.', 'success');
    }, 800);
  };

  return (
    <div>
      <section className="bg-gradient-to-b from-bakery-sky to-bakery-cream py-12 text-center">
        <div className="container-bk">
          <h1 className="font-display text-4xl font-bold text-bakery-ink sm:text-5xl">Get in Touch</h1>
          <p className="mx-auto mt-3 max-w-lg text-bakery-ink/60">
            Questions, custom cake orders, or catering enquiries — we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="container-bk mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Contact details" title="Reach us directly" />
          <div className="space-y-4">
            {contactInfo.map((c) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card flex items-start gap-4 p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bakery-sky text-bakery-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-bakery-ink">{c.label}</h3>
                  <p className="mt-1 text-sm text-bakery-ink/60">{c.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeading eyebrow="Send a message" title="Drop us a line" />
          <form onSubmit={handleSubmit} className="card space-y-4 p-6">
            <div>
              <label className="label">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input resize-none"
                placeholder="How can we help?"
              />
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full">
              <Send className="h-4 w-4" />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
