"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Activity } from "@/types";
import { allActivitiesService } from "@/services/api";
import { Search, Zap, DollarSign } from "lucide-react";

interface ActivitySearchProps {
  onSelectActivity?: (activity: Activity) => void;
  showAddButton?: boolean;
}

const ActivitySearch: React.FC<ActivitySearchProps> = ({
  onSelectActivity,
  showAddButton = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [costRange, setCostRange] = useState({ min: 0, max: 500 });

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(
      new Set(activities.map((a) => a.category).filter(Boolean))
    ).sort();
  }, [activities]);

  // Debounced search
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setActivities([]);
        return;
      }

      try {
        setLoading(true);
        const results = await allActivitiesService.searchActivities(query);
        setActivities(Array.isArray(results) ? results : results.data || []);
        setError("");
      } catch (err) {
        setError("Failed to search activities");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    performSearch(value);
  };

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(activity.category || "");
      const costMatch =
        (!activity.estimated_cost ||
          activity.estimated_cost >= costRange.min) &&
        (!activity.estimated_cost || activity.estimated_cost <= costRange.max);
      return categoryMatch && costMatch;
    });
  }, [activities, selectedCategories, costRange]);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search activities..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Search activities"
        />
      </div>

      {/* Filters */}
      {categories.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>

          {/* Category Filter */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategories([])}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  selectedCategories.length === 0
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {categories.slice(0, 10).map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategories((prev) =>
                      prev.includes(category || "")
                        ? prev.filter((c) => c !== category)
                        : [...prev, category || ""]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    selectedCategories.includes(category || "")
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Cost Range Filter */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">
              Max Cost: ${costRange.max}
            </p>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={costRange.max}
              onChange={(e) =>
                setCostRange({ ...costRange, max: parseInt(e.target.value) })
              }
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredActivities.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-500">
          <Zap size={32} className="mx-auto mb-2 opacity-50" />
          <p>No activities found. Try a different search.</p>
        </div>
      )}

      {!loading && filteredActivities.length === 0 && !searchQuery && (
        <div className="text-center py-8 text-gray-500">
          <Search size={32} className="mx-auto mb-2 opacity-50" />
          <p>Start typing to search for activities...</p>
        </div>
      )}

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActivities.map((activity) => (
          <div
            key={activity.activity_id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-primary transition cursor-pointer"
            onClick={() => onSelectActivity?.(activity)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSelectActivity?.(activity);
              }
            }}
          >
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900">{activity.name}</h3>
              {activity.category && (
                <p className="text-xs text-gray-600 mt-1 inline-block px-2 py-1 bg-gray-100 rounded">
                  {activity.category}
                </p>
              )}
            </div>

            {activity.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {activity.description}
              </p>
            )}

            {/* Cost Badge */}
            {activity.estimated_cost && (
              <div className="flex items-center gap-1 text-sm text-gray-700 mb-3">
                <DollarSign size={14} />
                {activity.estimated_cost.toFixed(2)}
              </div>
            )}

            {/* Select Button */}
            {showAddButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectActivity?.(activity);
                }}
                className="w-full mt-3 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Select Activity
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Results Summary */}
      {!loading && filteredActivities.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Found {filteredActivities.length}{" "}
          {filteredActivities.length === 1 ? "activity" : "activities"}
        </div>
      )}
    </div>
  );
};

export default ActivitySearch;

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}
