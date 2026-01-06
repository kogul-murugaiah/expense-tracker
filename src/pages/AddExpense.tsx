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
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Add Expense</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4"
      >
        <input
          type="number"
          name="amount"
          placeholder="Amount (₹)"
          value={form.amount}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <input
          type="text"
          name="item"
          placeholder="Item"
          value={form.item}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        {catLoading ? (
          <p className="text-sm text-gray-400">Loading categories...</p>
        ) : (
          <>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              disabled={!!form.newCategory}
              className="w-full border p-2 rounded"
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
              className="w-full border p-2 rounded"
            />
          </>
        )}

        <select
          name="accountType"
          value={form.accountType}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          {ACCOUNT_TYPES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
