import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Phone, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { Logo } from '@/components/ui';

export default function Signup() {
  const { signUp } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      notify('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.firstName, form.lastName, form.phone);
    setLoading(false);
    if (error) {
      notify(error, 'error');
    } else {
      notify('Account created! Welcome to THE BAKEST.', 'success');
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="container-bk flex min-h-[80vh] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo />
            <h1 className="mt-6 font-display text-2xl font-bold text-bakery-ink">Create your account</h1>
            <p className="mt-1 text-sm text-bakery-ink/55">Join THE BAKEST for fresh treats on demand.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-bakery-ink/40" />
                  <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input pl-10" placeholder="Aisha" />
                </div>
              </div>
              <div>
                <label className="label">Last name</label>
                <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" placeholder="Khan" />
              </div>
            </div>
            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-bakery-ink/40" />
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input pl-10" placeholder="+91 98765 43210" />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-bakery-ink/40" />
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input pl-10" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-bakery-ink/40" />
                <input required type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input pl-10 pr-10" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-bakery-ink/40 hover:text-bakery-ink/70">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              <UserPlus className="h-4 w-4" />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-bakery-ink/60">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-bakery-primary hover:text-bakery-primary-dark">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
