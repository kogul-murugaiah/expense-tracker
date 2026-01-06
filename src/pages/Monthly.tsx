import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Category = {
  id: number;
  name: string;
};

type Expense = {
  id: number;
  amount: number;
  date: string;
  category_id: number;
  account_type: string;
  categories: Category | null;
};

type CategoryTotal = {
  categoryId: number;
  categoryName: string;
  total: number;
};

type AccountTotal = {
  accountType: string;
  total: number;
};

const ACCOUNT_TYPES = ["INDIAN", "SBI", "UNION", "CASH"];

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const Monthly = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError(null);

      try {
        const [year, month] = selectedMonth.split("-").map(Number);
        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const endDate = new Date(year, month, 0).toISOString().split("T")[0];

        const { data, error } = await supabase
          .from("expenses")
          .select(
            `
            id,
            amount,
            date,
            category_id,
            account_type,
            categories (
              id,
              name
            )
          `
          )
          .gte("date", startDate)
          .lte("date", endDate)
          .order("date", { ascending: false });

        if (error) throw error;

        const typedData = (data || []).map((exp: any) => ({
          ...exp,
          categories: Array.isArray(exp.categories)
            ? exp.categories[0] || null
            : exp.categories || null,
        })) as Expense[];

        setExpenses(typedData);
      } catch (err: any) {
        setError(err.message || "Failed to fetch expenses");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [selectedMonth]);

  // Calculate category totals
  const categoryTotals: CategoryTotal[] = expenses.reduce(
    (acc, exp) => {
      const categoryId = exp.category_id;
      const categoryName = exp.categories?.name || "Unknown";

      const existing = acc.find((item) => item.categoryId === categoryId);

      if (existing) {
        existing.total += exp.amount;
      } else {
        acc.push({
          categoryId,
          categoryName,
          total: exp.amount,
        });
      }

      return acc;
    },
    [] as CategoryTotal[]
  );

  categoryTotals.sort((a, b) => b.total - a.total);

  // Calculate account type totals
  const accountTotals: AccountTotal[] = ACCOUNT_TYPES.map((accountType) => {
    const total = expenses
      .filter((exp) => exp.account_type === accountType)
      .reduce((sum, exp) => sum + exp.amount, 0);

    return { accountType, total };
  }).filter((acc) => acc.total > 0);

  accountTotals.sort((a, b) => b.total - a.total);

  // Calculate grand total
  const grandTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [year, month] = selectedMonth.split("-").map(Number);
  const monthName = monthNames[month - 1];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Monthly Expenses</h1>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && (
        <div className="py-10 text-center text-gray-500">
          Loading expenses...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {expenses.length === 0 ? (
            <div className="bg-white shadow rounded-xl p-8 text-center">
              <p className="text-gray-500">
                No expenses found for {monthName} {year}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Grand Total Card */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg rounded-xl p-6">
                <div className="text-blue-100 mb-2 font-medium">
                  Total Expenses for {monthName} {year}
                </div>
                <div className="text-4xl font-bold">
                  {formatter.format(grandTotal)}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Totals */}
                <div className="bg-white shadow rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Category-wise Totals
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {categoryTotals.length === 0 ? (
                      <div className="px-6 py-8 text-center text-gray-500">
                        No category data available
                      </div>
                    ) : (
                      categoryTotals.map((cat) => {
                        const percentage =
                          grandTotal > 0
                            ? ((cat.total / grandTotal) * 100).toFixed(1)
                            : "0.0";
                        return (
                          <div
                            key={cat.categoryId}
                            className="px-6 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {cat.categoryName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {percentage}% of total
                                </div>
                              </div>
                              <div className="text-lg font-semibold text-gray-900">
                                {formatter.format(cat.total)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Account Type Totals */}
                <div className="bg-white shadow rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Account-type Totals
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {accountTotals.length === 0 ? (
                      <div className="px-6 py-8 text-center text-gray-500">
                        No account data available
                      </div>
                    ) : (
                      accountTotals.map((acc) => {
                        const percentage =
                          grandTotal > 0
                            ? ((acc.total / grandTotal) * 100).toFixed(1)
                            : "0.0";
                        return (
                          <div
                            key={acc.accountType}
                            className="px-6 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {acc.accountType}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {percentage}% of total
                                </div>
                              </div>
                              <div className="text-lg font-semibold text-gray-900">
                                {formatter.format(acc.total)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Monthly;
