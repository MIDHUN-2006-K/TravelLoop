"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { helperService, expenseService } from "@/services/api";
import { BudgetBreakdown, Expense } from "@/types";
import { Button, Select } from "@/components/FormElements";
import toast from "react-hot-toast";
import { format } from "date-fns";

const CATEGORY_ICONS: Record<string, string> = {
  transport: "✈️", hotels: "🏨", meals: "🍽️", activities: "🎡", miscellaneous: "📦",
};

const CATEGORY_COLORS: Record<string, string> = {
  transport: "#3366ff", hotels: "#ff7a11", meals: "#10b981",
  activities: "#8b5cf6", miscellaneous: "#64748b",
};

interface Props { tripId: string; }

export default function TripBudget({ tripId }: Props) {
  const [budget, setBudget] = useState<BudgetBreakdown | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: "transport", estimated_cost: "", description: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [budgetData, expenseData] = await Promise.all([
        helperService.getTripBudget(tripId),
        expenseService.getExpenses(tripId),
      ]);
      setBudget(budgetData);
      setExpenses(expenseData);
    } catch { toast.error("Failed to load budget"); }
    finally { setLoading(false); }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.estimated_cost) return;
    setAdding(true);
    try {
      await expenseService.addExpense(tripId, {
        category: newExpense.category,
        estimated_cost: parseFloat(newExpense.estimated_cost),
        description: newExpense.description || undefined,
      });
      toast.success("Expense added");
      setNewExpense({ category: "transport", estimated_cost: "", description: "" });
      setShowAddExpense(false);
      loadData();
    } catch { toast.error("Failed to add expense"); }
    finally { setAdding(false); }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await expenseService.deleteExpense(tripId, expenseId);
      setExpenses((prev) => prev.filter((e) => e.expense_id !== expenseId));
      loadData();
      toast.success("Expense removed");
    } catch { toast.error("Failed to delete expense"); }
  };

  if (loading) return <div className="skeleton h-96 w-full rounded-2xl" />;

  const pieData = budget ? Object.entries(budget.by_category)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })) : [];

  const barData = budget ? Object.entries(budget.by_day)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 14)
    .map(([date, cost]) => ({ day: format(new Date(date), "MMM d"), cost: Math.round(cost * 100) / 100 })) : [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-surface-500 mb-1">Total Estimated</p>
          <p className="text-3xl font-display font-bold text-surface-900">${Math.round(budget?.total_cost || 0).toLocaleString()}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-surface-500 mb-1">Per Day</p>
          <p className="text-3xl font-display font-bold text-primary-600">${Math.round(budget?.avg_per_day || 0)}</p>
        </div>
        <div className="card p-5 col-span-2 md:col-span-1">
          <p className="text-sm text-surface-500 mb-1">Categories</p>
          <p className="text-3xl font-display font-bold text-secondary-600">{pieData.length}</p>
        </div>
      </div>

      {/* Charts Row */}
      {pieData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div className="card p-6">
            <h3 className="font-display font-semibold text-surface-900 mb-4">By Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`$${v}`, ""]} />
                <Legend iconType="circle" iconSize={10} formatter={(v) => `${CATEGORY_ICONS[v] || ""} ${v}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          {barData.length > 1 && (
            <div className="card p-6">
              <h3 className="font-display font-semibold text-surface-900 mb-4">Daily Spending</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`$${v}`, "Cost"]} />
                  <Bar dataKey="cost" fill="#3366ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Expenses List */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-surface-900">Expenses</h3>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAddExpense(!showAddExpense)}>Add Expense</Button>
        </div>

        {/* Add Form */}
        {showAddExpense && (
          <form onSubmit={handleAddExpense} className="mb-4 p-4 bg-surface-50 rounded-xl space-y-3 animate-fade-in-down">
            <div className="flex gap-3">
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense((p) => ({ ...p, category: e.target.value }))}
                className="px-3 py-2 border border-surface-200 rounded-xl text-sm"
              >
                {["transport", "hotels", "meals", "activities", "miscellaneous"].map((c) => (
                  <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                ))}
              </select>
              <input
                type="number" min="0" step="0.01"
                value={newExpense.estimated_cost}
                onChange={(e) => setNewExpense((p) => ({ ...p, estimated_cost: e.target.value }))}
                placeholder="Amount ($)"
                className="flex-1 px-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                required
              />
            </div>
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) => setNewExpense((p) => ({ ...p, description: e.target.value }))}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30"
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddExpense(false)}>Cancel</Button>
              <Button type="submit" size="sm" loading={adding}>Save</Button>
            </div>
          </form>
        )}

        {expenses.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-6">No expenses added yet</p>
        ) : (
          <div className="space-y-2">
            {expenses.map((exp) => (
              <div key={exp.expense_id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 group transition-colors">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: CATEGORY_COLORS[exp.category] || "#94a3b8" }}
                >
                  {CATEGORY_ICONS[exp.category] || "💰"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 capitalize">{exp.category}</p>
                  {exp.description && <p className="text-xs text-surface-500 truncate">{exp.description}</p>}
                </div>
                <span className="font-semibold text-surface-900 text-sm">${exp.estimated_cost.toFixed(2)}</span>
                <button
                  onClick={() => handleDeleteExpense(exp.expense_id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-surface-300 hover:text-danger transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
