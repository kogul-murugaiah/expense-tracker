import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAccountTypes } from "../hooks/useAccountTypes";
import * as XLSX from 'xlsx';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

type Category = {
  id: number;
  name: string;
};

type Expense = {
  id: string;
  amount: number;
  date: string;
  item: string;
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

type MonthTotal = {
  month: number;
  monthName: string;
  total: number;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const Yearly = () => {
  const { accountTypes } = useAccountTypes();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear().toString();
  });

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError(null);

      try {
        const year = Number(selectedYear);
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const { data, error } = await supabase
          .from("expenses")
          .select(
            `
            id,
            amount,
            date,
            item,
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
  }, [selectedYear]);

  // Calculate month-wise totals
  const monthTotals: MonthTotal[] = MONTH_NAMES.map((monthName, index) => {
    const month = index + 1;
    const total = expenses
      .filter((exp) => {
        const expenseDate = new Date(exp.date);
        return expenseDate.getMonth() + 1 === month;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);

    return { month, monthName, total };
  }).filter((mt) => mt.total > 0);

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
  const accountTotals: AccountTotal[] = accountTypes.map((accountType) => {
    const total = expenses
      .filter((exp) => exp.account_type === accountType)
      .reduce((sum, exp) => sum + exp.amount, 0);

    return { accountType, total };
  }).filter((acc) => acc.total > 0);

  accountTotals.sort((a, b) => b.total - a.total);

  // Calculate grand total
  const grandTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;
  const totalPages = Math.ceil(expenses.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentExpenses = expenses.slice(indexOfFirstRecord, indexOfLastRecord);

  // Reset page when year changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear]);

  const handleExport = () => {
    const exportData = expenses.map(exp => ({
      Date: new Date(exp.date).toLocaleDateString('en-IN'),
      Item: exp.item,
      Category: exp.categories?.name || "Uncategorized",
      Account: exp.account_type,
      Amount: exp.amount
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

    // Auto-size columns
    const wscols = [
      { wch: 12 }, // Date
      { wch: 25 }, // Item
      { wch: 20 }, // Category
      { wch: 15 }, // Account
      { wch: 12 }, // Amount
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `Expenses_${selectedYear}.xlsx`);
  };

  return (
    <div className="pb-24 pt-8 md:pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <p className="text-slate-400 font-medium text-sm uppercase tracking-wider">Historical Data</p>
            <h1 className="text-3xl font-bold font-heading text-white">
              Yearly Overview
            </h1>
            <p className="text-slate-400 mt-1">
              Spending analysis for <span className="text-white font-semibold">{selectedYear}</span>
            </p>
          </div>
          <input
            type="number"
            min="2000"
            max="2100"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full max-w-[140px] rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all hover:bg-slate-800/50"
          />
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl bg-slate-800/50" />
            ))}
          </div>
        ) : error ? (
          <div className="mb-6 glass-card border-red-500/20 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {expenses.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Data Available</h3>
                <p className="text-slate-400">No expenses recorded for year {selectedYear}.</p>
              </div>
            ) : (
              <>
                {/* Grand Total Card */}
                <div className="glass-card p-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-purple-200 mb-2">
                      Total Yearly Spend
                    </p>
                    <div className="text-5xl font-bold text-white font-heading tracking-tight">
                      {currencyFormatter.format(grandTotal)}
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Trend Chart */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-white mb-6 font-heading">Monthly Trend</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthTotals.sort((a, b) => a.month - b.month)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                          <XAxis
                            dataKey="monthName"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => val.slice(0, 3)}
                            dy={10}
                          />
                          <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${value}`}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                            itemStyle={{ color: '#f8fafc' }}
                            formatter={(value: any) => currencyFormatter.format(value)}
                          />
                          <Bar dataKey="total" name="Total" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category Breakdown Chart */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-white mb-6 font-heading">Category Breakdown</h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryTotals.filter(c => c.total > 0).map(c => ({ name: c.categoryName, value: c.total }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {categoryTotals.filter(c => c.total > 0).map((_, index) => {
                              const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'];
                              return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />;
                            })}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                            itemStyle={{ color: '#f8fafc' }}
                            formatter={(value: any) => currencyFormatter.format(value)}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Month-wise Totals List */}
                  <div className="glass-card p-0 overflow-hidden">
                    <div className="border-b border-white/5 bg-slate-900/40 px-6 py-4">
                      <h2 className="text-lg font-bold text-white font-heading">Monthly Breakdown</h2>
                    </div>
                    <div className="divide-y divide-white/5">
                      {monthTotals.length === 0 ? (
                        <div className="px-6 py-8 text-center text-slate-400">
                          No monthly data available
                        </div>
                      ) : (
                        monthTotals.map((mt) => {
                          const percentage =
                            grandTotal > 0 ? ((mt.total / grandTotal) * 100).toFixed(1) : "0.0";
                          return (
                            <div
                              key={mt.month}
                              className="px-6 py-4 transition hover:bg-white/5"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-semibold text-slate-200">
                                    {mt.monthName}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {percentage}% of total
                                  </div>
                                </div>
                                <div className="text-base font-bold text-white">
                                  {currencyFormatter.format(mt.total)}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Category Totals List */}
                  <div className="glass-card p-0 overflow-hidden">
                    <div className="border-b border-white/5 bg-slate-900/40 px-6 py-4">
                      <h2 className="text-lg font-bold text-white font-heading">Category Details</h2>
                    </div>
                    <div className="divide-y divide-white/5">
                      {categoryTotals.length === 0 ? (
                        <div className="px-6 py-8 text-center text-slate-400">
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
                              className="px-6 py-4 transition hover:bg-white/5"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-semibold text-slate-200">
                                    {cat.categoryName}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {percentage}% of total
                                  </div>
                                </div>
                                <div className="text-base font-bold text-white">
                                  {currencyFormatter.format(cat.total)}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Transaction History Section */}
                <div className="glass-card p-0 overflow-hidden">
                  <div className="border-b border-white/5 bg-slate-900/40 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-white font-heading">
                        Transaction History
                      </h2>
                      <span className="text-xs font-medium text-slate-400 bg-slate-800/50 px-2 py-1 rounded-md border border-white/5">
                        {expenses.length} Transactions
                      </span>
                    </div>
                    <button
                      onClick={handleExport}
                      className="flex items-center justify-center gap-2 rounded-xl bg-green-500/10 px-4 py-2.5 text-sm font-bold text-green-400 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      Download Excel
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-slate-900/20">
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Date</th>
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Item</th>
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Category</th>
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Account</th>
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {currentExpenses.map((exp) => (
                          <tr key={exp.id} className="group transition hover:bg-white/5">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                              {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                              {exp.item}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                {exp.categories?.name || "Uncategorized"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                              {exp.account_type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white text-right">
                              {currencyFormatter.format(exp.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="border-t border-white/5 bg-slate-900/40 px-6 py-4 flex items-center justify-between">
                      <p className="text-sm text-slate-400">
                        Showing <span className="text-white font-medium">{indexOfFirstRecord + 1}</span> to <span className="text-white font-medium">{Math.min(indexOfLastRecord, expenses.length)}</span> of <span className="text-white font-medium">{expenses.length}</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition duration-200 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-white/5"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition duration-200 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-white/5"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Yearly;
