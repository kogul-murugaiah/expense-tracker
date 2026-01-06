import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Income = {
  id: number;
  amount: number;
  date: string;
  account_type: string;
};

type Expense = {
  id: number;
  amount: number;
  date: string;
  account_type: string;
};

const ACCOUNT_TYPES = ["SBI", "CASH", "UNION", "INDIAN"];

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const Dashboard = () => {
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Calculate date range for current month
        const startDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

        // Fetch income for current month
        const { data: incomeData, error: incomeError } = await supabase
          .from("income")
          .select("id, amount, date, account_type")
          .gte("date", startDate)
          .lt("date", endDate);

        if (incomeError) throw incomeError;

        // Fetch expenses for current month
        const { data: expenseData, error: expenseError } = await supabase
          .from("expenses")
          .select("id, amount, date, account_type")
          .gte("date", startDate)
          .lt("date", endDate);

        if (expenseError) throw expenseError;

        setIncome(incomeData || []);
        setExpenses(expenseData || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentYear, currentMonth]);

  // Calculate totals
  const monthlyIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyBalance = monthlyIncome - monthlyExpenses;

  // Calculate account-wise balances
  const accountBalances = ACCOUNT_TYPES.map((accountType) => {
    const accountIncome = income
      .filter((inc) => inc.account_type === accountType)
      .reduce((sum, inc) => sum + inc.amount, 0);

    const accountExpenses = expenses
      .filter((exp) => exp.account_type === accountType)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const balance = accountIncome - accountExpenses;

    return {
      accountType,
      income: accountIncome,
      expenses: accountExpenses,
      balance,
    };
  });

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

  const currentMonthName = monthNames[currentMonth - 1];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        Dashboard - {currentMonthName} {currentYear}
      </h1>

      {loading && (
        <div className="py-10 text-center text-gray-500">
          Loading data...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Overall Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Monthly Income Card */}
            <div className="bg-white shadow rounded-xl p-6 text-center">
              <div className="text-gray-600 mb-2 font-medium">
                Monthly Income
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {formatter.format(monthlyIncome)}
              </div>
              {monthlyIncome === 0 && (
                <div className="mt-3 text-xs text-gray-400">
                  No income this month
                </div>
              )}
            </div>

            {/* Monthly Expenses Card */}
            <div className="bg-white shadow rounded-xl p-6 text-center">
              <div className="text-gray-600 mb-2 font-medium">
                Monthly Expenses
              </div>
              <div className="text-3xl font-bold text-red-600">
                {formatter.format(monthlyExpenses)}
              </div>
              {monthlyExpenses === 0 && (
                <div className="mt-3 text-xs text-gray-400">
                  No expenses this month
                </div>
              )}
            </div>

            {/* Monthly Balance Card */}
            <div
              className={`bg-white shadow rounded-xl p-6 text-center ${
                monthlyBalance >= 0
                  ? "border-2 border-green-200"
                  : "border-2 border-red-200"
              }`}
            >
              <div className="text-gray-600 mb-2 font-medium">
                Monthly Balance
              </div>
              <div
                className={`text-3xl font-bold ${
                  monthlyBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatter.format(monthlyBalance)}
              </div>
              {monthlyBalance === 0 && (
                <div className="mt-3 text-xs text-gray-400">
                  Balanced this month
                </div>
              )}
              {monthlyBalance > 0 && (
                <div className="mt-3 text-xs text-green-600 font-medium">
                  Surplus
                </div>
              )}
              {monthlyBalance < 0 && (
                <div className="mt-3 text-xs text-red-600 font-medium">
                  Deficit
                </div>
              )}
            </div>
          </div>

          {/* Account-wise Balances */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Account-wise Balance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {accountBalances.map((account) => (
                <div
                  key={account.accountType}
                  className={`bg-white shadow rounded-xl p-5 text-center ${
                    account.balance >= 0
                      ? "border-2 border-green-200"
                      : "border-2 border-red-200"
                  }`}
                >
                  <div className="text-gray-600 mb-1 font-medium text-sm">
                    {account.accountType}
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      account.balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatter.format(account.balance)}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <div>Income: {formatter.format(account.income)}</div>
                    <div>Expenses: {formatter.format(account.expenses)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
