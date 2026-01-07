import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabaseClient";

type Category = {
  id: number;
  name: string;
};

const ACCOUNT_TYPES = [
  { label: "INDIAN", value: "INDIAN" },
  { label: "SBI", value: "SBI" },
  { label: "UNION", value: "UNION" },
  { label: "CASH", value: "CASH" },
];

const initialForm = {
  amount: "",
  date: "",
  item: "",
  description: "",
  category_id: "",
  newCategory: "",
  accountType: ACCOUNT_TYPES[0].value,
};

const AddExpense = () => {
  const [form, setForm] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      ...initialForm,
      date: today,
    };
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        setError("Failed to load categories");
      } else {
        setCategories(data || []);
      }
      setCatLoading(false);
    };

    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "category_id") {
      setForm((prev) => ({ ...prev, newCategory: "" }));
    }
  };

  const handleNewCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      newCategory: e.target.value,
      category_id: "",
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.amount || !form.date) {
      setError("Amount and Date are required");
      return;
    }

    if (!form.category_id && !form.newCategory.trim()) {
      setError("Select or add a category");
      return;
    }

    setLoading(true);

    try {
      let categoryId: number;

      // Insert new category if needed
      if (form.newCategory.trim()) {
        const { data, error } = await supabase
          .from("categories")
          .insert({ name: form.newCategory.trim() })
          .select()
          .single();

        if (error || !data) throw new Error("Category creation failed");
        categoryId = data.id;
        setCategories((prev) => [...prev, data]);
      } else {
        categoryId = Number(form.category_id);
      }

      // Insert expense
      const { error } = await supabase.from("expenses").insert({
        amount: Number(form.amount),
        date: form.date,
        item: form.item || null,
        description: form.description || null,
        category_id: categoryId,
        account_type: form.accountType,
      });

      if (error) throw error;

      setSuccess("Expense added successfully");
      setForm({
        ...initialForm,
        date: new Date().toISOString().slice(0, 10), // Reset to today's date
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Spending
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Add Expense</h1>
          <p className="text-sm text-slate-500">
            Track your daily spending with a clean, guided form.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 space-y-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                placeholder="Enter amount"
                value={form.amount}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Item</label>
              <input
                type="text"
                name="item"
                placeholder="e.g., Grocery, Fuel"
                value={form.item}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Description (optional)</label>
              <input
                type="text"
                name="description"
                placeholder="Add a note"
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Category</label>
              {catLoading ? (
                <div className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-400">
                  Loading categories...
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    disabled={!!form.newCategory}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Or add new category"
                    value={form.newCategory}
                    onChange={handleNewCategory}
                    disabled={!!form.category_id}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Account Type</label>
              <select
                name="accountType"
                value={form.accountType}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {ACCOUNT_TYPES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="pt-2">
            <button
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
