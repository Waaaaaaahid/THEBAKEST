import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Search, X, Save, Cookie, Layers } from 'lucide-react';
import { menuApi, categoriesApi } from '@/lib/api';
import type { Category, MenuItem, PriceVariant } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { slugify, formatINR } from '@/lib/format';

interface EditForm {
  id: string | null;
  name: string;
  slug: string;
  category_id: string;
  description: string;
  image: string;
  price: number;
  price_variants: PriceVariant[];
  available: boolean;
  featured: boolean;
  bestseller: boolean;
  veg: boolean;
  tags: string;
  sort_order: number;
}

const emptyForm: EditForm = {
  id: null, name: '', slug: '', category_id: '', description: '', image: '',
  price: 0, price_variants: [], available: true, featured: false, bestseller: false,
  veg: true, tags: '', sort_order: 0,
};

interface CategoryForm {
  id: string | null;
  name: string;
  slug: string;
  sort_order: number;
}

export default function AdminMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [editing, setEditing] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<MenuItem | null>(null);
  const [tab, setTab] = useState<'items' | 'categories'>('items');
  const [catEditing, setCatEditing] = useState<CategoryForm | null>(null);
  const [catSaving, setCatSaving] = useState(false);
  const [catDelete, setCatDelete] = useState<Category | null>(null);
  const { notify } = useToast();

  const load = async () => {
    const [itemRes, catRes] = await Promise.all([
      menuApi.list(),
      categoriesApi.list(),
    ]);
    setItems((itemRes.data as MenuItem[]) ?? []);
    setCategories((catRes.data as Category[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => setEditing({ ...emptyForm, category_id: categories[0]?.id ?? '' });
  const openEdit = (item: MenuItem) => {
    setEditing({
      id: item.id,
      name: item.name,
      slug: item.slug,
      category_id: item.category_id ?? '',
      description: item.description,
      image: item.image,
      price: item.price,
      price_variants: item.price_variants ?? [],
      available: item.available,
      featured: item.featured,
      bestseller: item.bestseller,
      veg: item.veg,
      tags: item.tags?.join(', ') ?? '',
      sort_order: item.sort_order,
    });
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) { notify('Name is required', 'error'); return; }
    setSaving(true);
    const slug = editing.slug.trim() || slugify(editing.name);
    const tags = editing.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const payload = {
      name: editing.name,
      slug,
      categoryId: editing.category_id || null,
      description: editing.description,
      image: editing.image,
      price: editing.price,
      priceVariants: editing.price_variants,
      available: editing.available,
      featured: editing.featured,
      bestseller: editing.bestseller,
      veg: editing.veg,
      tags,
      sortOrder: editing.sort_order,
    };

    const res = editing.id
      ? await menuApi.update(editing.id, payload)
      : await menuApi.create(payload);
    setSaving(false);
    if (!res.success) {
      notify(res.message?.includes('duplicate') ? 'A product with this slug already exists' : 'Could not save product', 'error');
    } else {
      notify(editing.id ? 'Product updated' : 'Product created', 'success');
      setEditing(null);
      load();
    }
  };

  const deleteItem = async () => {
    if (!confirmDelete) return;
    const res = await menuApi.delete(confirmDelete.id);
    if (!res.success) { notify('Could not delete product', 'error'); }
    else { notify('Product deleted', 'success'); setConfirmDelete(null); load(); }
  };

  // Category management
  const saveCategory = async () => {
    if (!catEditing) return;
    if (!catEditing.name.trim()) { notify('Category name is required', 'error'); return; }
    setCatSaving(true);
    const slug = catEditing.slug.trim() || slugify(catEditing.name);
    const payload = { name: catEditing.name, slug, sortOrder: catEditing.sort_order };
    const res = catEditing.id
      ? await categoriesApi.update(catEditing.id, payload)
      : await categoriesApi.create(payload);
    setCatSaving(false);
    if (!res.success) {
      notify(res.message?.includes('duplicate') ? 'Slug already exists' : 'Could not save category', 'error');
    } else {
      notify(catEditing.id ? 'Category updated' : 'Category created', 'success');
      setCatEditing(null);
      load();
    }
  };

  const deleteCategory = async () => {
    if (!catDelete) return;
    const res = await categoriesApi.delete(catDelete.id);
    if (!res.success) { notify('Could not delete category', 'error'); }
    else { notify('Category deleted', 'success'); setCatDelete(null); load(); }
  };

  const filtered = items.filter((i) => {
    if (catFilter !== 'all' && i.category_id !== catFilter) return false;
    if (query.trim() && !i.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? '—';

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-bakery-ink">Menu Management</h1>
        {tab === 'items' ? (
          <button onClick={openNew} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        ) : (
          <button onClick={() => setCatEditing({ id: null, name: '', slug: '', sort_order: 0 })} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button onClick={() => setTab('items')} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${tab === 'items' ? 'bg-bakery-primary text-white' : 'bg-white text-bakery-ink/60 hover:bg-bakery-sky'}`}>
          <Cookie className="mr-1.5 inline h-4 w-4" /> Items
        </button>
        <button onClick={() => setTab('categories')} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${tab === 'categories' ? 'bg-bakery-primary text-white' : 'bg-white text-bakery-ink/60 hover:bg-bakery-sky'}`}>
          <Layers className="mr-1.5 inline h-4 w-4" /> Categories
        </button>
      </div>

      {tab === 'items' && (
        <>
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-bakery-ink/40" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="input pl-10" />
            </div>
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="input max-w-[180px]">
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-bakery-primary/20 border-t-bakery-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <Cookie className="mx-auto h-10 w-10 text-bakery-primary/30" />
              <p className="mt-3 text-sm text-bakery-ink/50">No products found.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              {/* Table header - desktop */}
              <div className="hidden grid-cols-[1fr_120px_100px_80px_120px] gap-4 border-b border-bakery-primary/10 bg-bakery-sky/40 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bakery-ink/50 lg:grid">
                <span>Product</span><span>Category</span><span>Price</span><span>Status</span><span>Actions</span>
              </div>
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 items-center gap-3 border-b border-bakery-primary/5 px-4 py-3 transition-colors hover:bg-bakery-sky/30 lg:grid-cols-[1fr_120px_100px_80px_120px] lg:gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-bakery-ink">{item.name}</p>
                      <p className="truncate text-xs text-bakery-ink/50">{item.tags?.join(', ')}</p>
                    </div>
                  </div>
                  <span className="text-sm text-bakery-ink/60">{catName(item.category_id)}</span>
                  <span className="text-sm font-semibold text-bakery-primary-dark">
                    {item.price_variants && item.price_variants.length > 0 ? `${formatINR(item.price_variants[0].price)}+` : formatINR(item.price)}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.available ? <span className="badge bg-success/10 text-success">Active</span> : <span className="badge bg-error/10 text-error">Off</span>}
                    {item.bestseller && <span className="badge bg-accent-gold/15 text-accent-gold">Best</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(item)} className="rounded-lg p-2 text-bakery-primary hover:bg-bakery-sky"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => setConfirmDelete(item)} className="rounded-lg p-2 text-error hover:bg-error/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'categories' && (
        <>
          {loading ? (
            <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-bakery-primary/20 border-t-bakery-primary" /></div>
          ) : categories.length === 0 ? (
            <div className="card p-12 text-center">
              <Layers className="mx-auto h-10 w-10 text-bakery-primary/30" />
              <p className="mt-3 text-sm text-bakery-ink/50">No categories yet.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c, i) => {
                const count = items.filter((it) => it.category_id === c.id).length;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="card p-5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-sm font-semibold text-bakery-ink">{c.name}</p>
                        <p className="text-xs text-bakery-ink/50">{c.slug} · {count} items</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setCatEditing({ id: c.id, name: c.name, slug: c.slug, sort_order: c.sort_order })} className="rounded-lg p-2 text-bakery-primary hover:bg-bakery-sky"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => setCatDelete(c)} className="rounded-lg p-2 text-error hover:bg-error/10"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Edit/Create modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditing(null)}
            className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-bakery-ink/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card my-8 w-full max-w-2xl p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-bakery-ink">{editing.id ? 'Edit Product' : 'New Product'}</h3>
                <button onClick={() => setEditing(null)} className="text-bakery-ink/40 hover:text-bakery-ink/70"><X className="h-5 w-5" /></button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Name</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} className="input" /></div>
                <div><label className="label">Slug</label><input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="input" /></div>
                <div className="sm:col-span-2"><label className="label">Image URL</label><input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} className="input" placeholder="https://..." /></div>
                <div><label className="label">Category</label>
                  <select value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })} className="input">
                    <option value="">— None —</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="label">Base Price (₹)</label><input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className="input" /></div>
                <div className="sm:col-span-2"><label className="label">Description</label><textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input resize-none" /></div>
                <div><label className="label">Tags (comma separated)</label><input value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} className="input" placeholder="chocolate, fusion" /></div>
                <div><label className="label">Sort order</label><input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} className="input" /></div>
              </div>

              {/* Price variants */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label className="label">Size Variants</label>
                  <button onClick={() => setEditing({ ...editing, price_variants: [...editing.price_variants, { label: '', price: 0 }] })} className="text-xs font-semibold text-bakery-primary hover:text-bakery-primary-dark">
                    + Add variant
                  </button>
                </div>
                {editing.price_variants.length === 0 ? (
                  <p className="text-xs text-bakery-ink/40">No variants — base price will be used.</p>
                ) : (
                  <div className="space-y-2">
                    {editing.price_variants.map((v, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={v.label} onChange={(e) => { const pv = [...editing.price_variants]; pv[i] = { ...pv[i], label: e.target.value }; setEditing({ ...editing, price_variants: pv }); }} className="input flex-1" placeholder="e.g. 0.5 KG" />
                        <input type="number" value={v.price} onChange={(e) => { const pv = [...editing.price_variants]; pv[i] = { ...pv[i], price: Number(e.target.value) }; setEditing({ ...editing, price_variants: pv }); }} className="input w-28" placeholder="Price" />
                        <button onClick={() => setEditing({ ...editing, price_variants: editing.price_variants.filter((_, idx) => idx !== i) })} className="rounded-lg px-2 text-error hover:bg-error/10"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="mt-4 flex flex-wrap gap-4">
                {([
                  ['available', 'Available'],
                  ['featured', 'Featured'],
                  ['bestseller', 'Bestseller'],
                  ['veg', 'Veg'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-bakery-ink/70 cursor-pointer">
                    <input type="checkbox" checked={editing[key]} onChange={(e) => setEditing({ ...editing, [key]: e.target.checked })} className="h-4 w-4 accent-bakery-primary" />
                    {label}
                  </label>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={save} disabled={saving} className="btn-primary flex-1"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Product'}</button>
                <button onClick={() => setEditing(null)} className="btn-ghost border border-bakery-primary/15">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category modal */}
      <AnimatePresence>
        {catEditing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCatEditing(null)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-bakery-ink/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-md p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-bakery-ink">{catEditing.id ? 'Edit Category' : 'New Category'}</h3>
                <button onClick={() => setCatEditing(null)} className="text-bakery-ink/40 hover:text-bakery-ink/70"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="label">Category Name</label><input value={catEditing.name} onChange={(e) => setCatEditing({ ...catEditing, name: e.target.value, slug: catEditing.id ? catEditing.slug : slugify(e.target.value) })} className="input" placeholder="e.g. Cakes" /></div>
                <div><label className="label">Slug</label><input value={catEditing.slug} onChange={(e) => setCatEditing({ ...catEditing, slug: e.target.value })} className="input" /></div>
                <div><label className="label">Sort Order</label><input type="number" value={catEditing.sort_order} onChange={(e) => setCatEditing({ ...catEditing, sort_order: Number(e.target.value) })} className="input" /></div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={saveCategory} disabled={catSaving} className="btn-primary flex-1"><Save className="h-4 w-4" /> {catSaving ? 'Saving...' : 'Save Category'}</button>
                <button onClick={() => setCatEditing(null)} className="btn-ghost border border-bakery-primary/15">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm - item */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(null)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-bakery-ink/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-sm p-6 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
                <Trash2 className="h-7 w-7 text-error" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-bakery-ink">Delete product?</h3>
              <p className="mt-2 text-sm text-bakery-ink/60">"{confirmDelete.name}" will be removed from the menu permanently.</p>
              <div className="mt-6 flex gap-3">
                <button onClick={deleteItem} className="btn-primary flex-1 !bg-error hover:!bg-error/90">Delete</button>
                <button onClick={() => setConfirmDelete(null)} className="btn-ghost border border-bakery-primary/15">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm - category */}
      <AnimatePresence>
        {catDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCatDelete(null)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-bakery-ink/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-sm p-6 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
                <Trash2 className="h-7 w-7 text-error" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-bakery-ink">Delete category?</h3>
              <p className="mt-2 text-sm text-bakery-ink/60">"{catDelete.name}" will be removed. Items in this category will remain but lose their category link.</p>
              <div className="mt-6 flex gap-3">
                <button onClick={deleteCategory} className="btn-primary flex-1 !bg-error hover:!bg-error/90">Delete</button>
                <button onClick={() => setCatDelete(null)} className="btn-ghost border border-bakery-primary/15">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
