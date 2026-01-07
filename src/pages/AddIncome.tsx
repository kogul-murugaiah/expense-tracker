import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabaseClient";

const ACCOUNT_TYPES = [
  { label: "INDIAN", value: "INDIAN" },
  { label: "SBI", value: "SBI" },
  { label: "UNION", value: "UNION" },
  { label: "CASH", value: "CASH" },
];

const INCOME_SOURCES = [
  { label: "Salary", value: "Salary" },
  { label: "Business", value: "Business" },
  { label: "Bonus", value: "Bonus" },
  { label: "Other", value: "Other" },
];

const initialForm = {
  amount: "",
  date: "",
  source: INCOME_SOURCES[0].value,
  accountType: ACCOUNT_TYPES[0].value,
};

const AddIncome = () => {
  const [form, setForm] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      ...initialForm,
      date: today,
    };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.amount || !form.date) {
      setError("Amount and Date are required");
      return;
    }

    setLoading(true);

    try {
      // Insert income
      const { error } = await supabase.from("income").insert({
        amount: Number(form.amount),
        date: form.date,
        source: form.source,
        account_type: form.accountType,
      });

      if (error) throw error;

      setSuccess("Income added successfully");
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
            Income
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Add Income</h1>
          <p className="text-sm text-slate-500">
            Log your monthly income with a clean, guided form.
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
                id="date"
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
              <label className="text-sm font-medium text-slate-700">Source</label>
              <select
                name="source"
                value={form.source}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {INCOME_SOURCES.map((source) => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Account Type</label>
              <select
                name="accountType"
                value={form.accountType}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {ACCOUNT_TYPES.map((account) => (
                  <option key={account.value} value={account.value}>
                    {account.label}
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
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Add Income"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIncome;
