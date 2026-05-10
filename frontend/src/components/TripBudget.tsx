"use client";

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { BudgetBreakdown } from "@/types";
import { helperService } from "@/services/api";
import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface TripBudgetProps {
  tripId: string;
  loading?: boolean;
}

const COLORS = [
  "#1e40af",
  "#7c3aed",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
];

const TripBudget: React.FC<TripBudgetProps> = ({
  tripId,
  loading: initialLoading = false,
}) => {
  const [budget, setBudget] = useState<BudgetBreakdown | null>(null);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBudget();
  }, [tripId]);

  const loadBudget = async () => {
    try {
      setLoading(true);
      const data = await helperService.getTripBudget(tripId);
      setBudget(data);
      setError("");
    } catch (err) {
      setError("Failed to load budget data");
      toast.error("Failed to load budget information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton loaders */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 bg-gray-200 rounded-lg animate-pulse"
            role="status"
            aria-label="Loading budget chart"
          />
        ))}
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
        <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
        <div>
          <h3 className="font-semibold text-red-900">Budget Error</h3>
          <p className="text-red-700 text-sm mt-1">
            {error || "No budget data available"}
          </p>
        </div>
      </div>
    );
  }

  // Prepare data for pie chart (category breakdown)
  const categoryData = Object.entries(budget.by_category).map(
    ([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    })
  );

  // Prepare data for bar chart (daily breakdown)
  const dailyData = Object.entries(budget.by_day)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, cost]) => ({
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      cost: parseFloat(cost.toFixed(2)),
    }));

  const isOverBudget = (cost: number) => cost > budget.avg_per_day * 1.5;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <p className="text-gray-700 text-sm font-medium mb-2">Total Budget</p>
          <p className="text-3xl font-bold text-primary">
            ${budget.total_cost.toFixed(2)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <p className="text-gray-700 text-sm font-medium mb-2">Avg Per Day</p>
          <p className="text-3xl font-bold text-secondary">
            ${budget.avg_per_day.toFixed(2)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <p className="text-gray-700 text-sm font-medium mb-2">Days Planned</p>
          <p className="text-3xl font-bold text-green-600">
            {Object.keys(budget.by_day).length}
          </p>
        </div>
      </div>

      {/* Pie Chart - Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cost by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) =>
                  `${name}: $${value} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                fill="#1e40af"
                dataKey="value"
              >
                {categoryData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) =>
                  `$${typeof value === "number" ? value.toFixed(2) : value}`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bar Chart - Daily Breakdown */}
      {dailyData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cost per Day
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                angle={dailyData.length > 7 ? -45 : 0}
                textAnchor={dailyData.length > 7 ? "end" : "middle"}
                height={dailyData.length > 7 ? 80 : 30}
              />
              <YAxis
                label={{
                  value: "Cost ($)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value: any) =>
                  `$${typeof value === "number" ? value.toFixed(2) : value}`
                }
              />
              <Bar
                dataKey="cost"
                fill="#7c3aed"
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const isOver = payload?.cost > budget.avg_per_day * 1.5;
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={isOver ? "#ef4444" : "#3b82f6"}
                      rx={4}
                      ry={4}
                    />
                  );
                }}
              />
              <ReferenceLine
                y={budget.avg_per_day}
                stroke="#10b981"
                strokeDasharray="5,5"
                label={{
                  value: "Avg Per Day",
                  position: "right",
                  fill: "#10b981",
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Over-Budget Warning */}
      {dailyData.some(({ cost }) => isOverBudget(cost)) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h4 className="font-semibold text-amber-900 mb-3">
            ⚠️ Over-Budget Days
          </h4>
          <div className="space-y-2">
            {dailyData
              .filter(({ cost }) => isOverBudget(cost))
              .map(({ date, cost }) => (
                <div key={date} className="flex justify-between text-sm">
                  <span className="text-amber-800">{date}</span>
                  <span className="font-semibold text-amber-900">
                    ${cost.toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {categoryData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>
            No budget data available. Add activities to your stops to see budget
            breakdown.
          </p>
        </div>
      )}
    </div>
  );
};

// Re-export component for use
export default TripBudget;
