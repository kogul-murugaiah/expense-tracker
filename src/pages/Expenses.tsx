import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Category = {
  id: number;
  name: string;
};

type Expense = {
  id: string;
  date: string;
  item: string;
  description: string | null;
  category_id: number | null;
  amount: number;
  account_type: string;
  categories: Category | null;
};

type EditingExpense = {
  id: string;
  date: string;
  item: string;
  description: string;
  category_id: string;
  account_type: string;
  amount: string;
};

const ACCOUNT_TYPES = [
  { label: "INDIAN", value: "INDIAN" },
  { label: "SBI", value: "SBI" },
  { label: "UNION", value: "UNION" },
  { label: "CASH", value: "CASH" },
];

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditingExpense | null>(null);

  // Fetch expenses and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch expenses with category join
        const { data: expensesData, error: expensesError } = await supabase
          .from("expenses")
          .select(
            `
            id,
            date,
            item,
            description,
            category_id,
            amount,
            account_type,
            categories (
              id,
              name
            )
          `
          )
          .order("date", { ascending: false });

        if (expensesError) throw expensesError;

        const typedData = (expensesData || []).map((exp: any) => ({
          ...exp,
          categories: Array.isArray(exp.categories)
            ? exp.categories[0] || null
            : exp.categories || null,
        })) as Expense[];

        setExpenses(typedData);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditingData({
      id: expense.id,
      date: expense.date,
      item: expense.item,
      description: expense.description || "",
      category_id: expense.category_id?.toString() || "",
      account_type: expense.account_type,
      amount: expense.amount.toString(),
    });
    setSuccess(null);
    setError(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData(null);
    setError(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!editingData) return;

    const { name, value } = e.target;
    setEditingData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = async (id: string) => {
    if (!editingData) return;

    // Validation
    if (!editingData.item.trim()) {
      setError("Item is required");
      return;
    }

    if (!editingData.amount || Number(editingData.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (!editingData.date) {
      setError("Date is required");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: any = {
        date: editingData.date,
        item: editingData.item.trim(),
        description: editingData.description.trim() || null,
        amount: Number(editingData.amount),
        account_type: editingData.account_type,
      };

      if (editingData.category_id) {
        updateData.category_id = Number(editingData.category_id);
      } else {
        updateData.category_id = null;
      }

      const { error } = await supabase
        .from("expenses")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Refresh expenses list
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select(
          `
          id,
          date,
          item,
          description,
          category_id,
          amount,
          account_type,
          categories (
            id,
            name
          )
        `
        )
        .order("date", { ascending: false });

      if (expensesError) throw expensesError;

      const typedData = (expensesData || []).map((exp: any) => ({
        ...exp,
        categories: Array.isArray(exp.categories)
          ? exp.categories[0] || null
          : exp.categories || null,
      })) as Expense[];

      setExpenses(typedData);
      setSuccess("Expense updated successfully");
      setEditingId(null);
      setEditingData(null);
    } catch (err: any) {
      setError(err.message || "Failed to update expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Manage Expenses</h1>

      {loading && (
        <div className="py-10 text-center text-gray-500">
          Loading expenses...
        </div>
      )}

      {error && !saving && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 mb-4">
          {success}
        </div>
      )}

      {!loading && (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No expenses found
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => {
                    const isEditing = editingId === expense.id;

                    return (
                      <tr
                        key={expense.id}
                        className={`hover:bg-gray-50 ${
                          isEditing ? "bg-blue-50 border-l-4 border-blue-500" : ""
                        }`}
                      >
                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing && editingData ? (
                            <input
                              type="date"
                              name="date"
                              value={editingData.date}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          ) : (
                            <div className="text-sm text-gray-900">
                              {new Date(expense.date).toLocaleDateString("en-IN")}
                            </div>
                          )}
                        </td>

                        {/* Item */}
                        <td className="px-6 py-4">
                          {isEditing && editingData ? (
                            <input
                              type="text"
                              name="item"
                              value={editingData.item}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">
                              {expense.item}
                            </div>
                          )}
                        </td>

                        {/* Description */}
                        <td className="px-6 py-4">
                          {isEditing && editingData ? (
                            <input
                              type="text"
                              name="description"
                              value={editingData.description}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="text-sm text-gray-500">
                              {expense.description || "-"}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing && editingData ? (
                            <select
                              name="category_id"
                              value={editingData.category_id}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">No Category</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="text-sm text-gray-900">
                              {expense.categories?.name || "-"}
                            </div>
                          )}
                        </td>

                        {/* Account Type */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing && editingData ? (
                            <select
                              name="account_type"
                              value={editingData.account_type}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {ACCOUNT_TYPES.map((acc) => (
                                <option key={acc.value} value={acc.value}>
                                  {acc.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="text-sm text-gray-900">
                              {expense.account_type}
                            </div>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {isEditing && editingData ? (
                            <input
                              type="number"
                              name="amount"
                              value={editingData.amount}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                              step="0.01"
                              required
                            />
                          ) : (
                            <div className="text-sm font-semibold text-gray-900">
                              {formatter.format(expense.amount)}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {isEditing ? (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleSave(expense.id)}
                                disabled={saving}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {saving ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEdit(expense)}
                              disabled={editingId !== null}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
