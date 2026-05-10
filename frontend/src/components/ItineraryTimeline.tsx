"use client";

import React, { useState, useMemo } from "react";
import { Trip, TripActivity } from "@/types";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, DollarSign } from "lucide-react";

interface ItineraryTimelineProps {
  trip: Trip;
  loading?: boolean;
}

interface DayGroup {
  date: string;
  dayOfWeek: string;
  activities: TripActivity[];
  totalCost: number;
}

const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  trip,
  loading = false,
}) => {
  const [viewMode, setViewMode] = useState<"timeline" | "calendar">("timeline");

  // Group activities by date
  const dayGroups: DayGroup[] = useMemo(() => {
    if (!trip.stops || trip.stops.length === 0) return [];

    const groupedByDate: Record<string, TripActivity[]> = {};

    // Collect all activities and group by date
    trip.stops.forEach((stop) => {
      if (stop.activities) {
        stop.activities.forEach((activity) => {
          const dateStr = activity.scheduled_date;
          if (!groupedByDate[dateStr]) {
            groupedByDate[dateStr] = [];
          }
          groupedByDate[dateStr].push(activity);
        });
      }
    });

    // Create day groups
    return Object.entries(groupedByDate)
      .map(([dateStr, activities]) => ({
        date: dateStr,
        dayOfWeek: format(parseISO(dateStr), "EEEE"),
        activities: activities.sort((a, b) => {
          // Try to sort by time if available, otherwise by name
          return (a.notes || "").localeCompare(b.notes || "");
        }),
        totalCost: activities.reduce(
          (sum, act) => sum + (act.custom_cost || 0),
          0
        ),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [trip]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 rounded-lg animate-pulse"
            role="status"
            aria-label="Loading timeline"
          />
        ))}
      </div>
    );
  }

  if (dayGroups.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Calendar size={32} className="mx-auto mb-4 opacity-50" />
        <p>
          No activities scheduled. Add activities to your stops to see the
          timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        <button
          onClick={() => setViewMode("timeline")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewMode === "timeline"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          aria-selected={viewMode === "timeline"}
          role="tab"
        >
          Timeline View
        </button>
        <button
          onClick={() => setViewMode("calendar")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewMode === "calendar"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          aria-selected={viewMode === "calendar"}
          role="tab"
        >
          Calendar View
        </button>
      </div>

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <div className="space-y-6">
          {dayGroups.map((day, dayIndex) => (
            <div
              key={day.date}
              className="relative pl-8 pb-8 last:pb-0"
              role="article"
              aria-label={`${day.dayOfWeek}, ${format(
                parseISO(day.date),
                "MMMM d, yyyy"
              )}`}
            >
              {/* Timeline dot */}
              <div className="absolute left-0 top-1 w-4 h-4 bg-primary rounded-full border-4 border-white shadow-md" />

              {/* Timeline line */}
              {dayIndex < dayGroups.length - 1 && (
                <div className="absolute left-2 top-5 w-0.5 h-full bg-gray-300" />
              )}

              {/* Day header */}
              <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold opacity-90">
                      {day.dayOfWeek}
                    </p>
                    <p className="text-lg font-bold">
                      {format(parseISO(day.date), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-90">Total Cost</p>
                    <p className="text-xl font-bold">
                      ${day.totalCost.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Activities for this day */}
              <div className="space-y-2">
                {day.activities.map((activity) => (
                  <div
                    key={activity.trip_activity_id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {activity.name}
                        </h4>
                        {activity.notes && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                            <Clock size={14} />
                            {activity.notes}
                          </p>
                        )}
                      </div>
                      {activity.custom_cost && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <DollarSign size={14} />
                            {activity.custom_cost.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dayGroups.map((day) => (
            <div
              key={day.date}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
              role="article"
              aria-label={`${day.dayOfWeek}, ${format(
                parseISO(day.date),
                "MMMM d, yyyy"
              )}`}
            >
              {/* Day header */}
              <div className="bg-primary text-white p-4">
                <p className="text-xs font-semibold opacity-90">
                  {day.dayOfWeek}
                </p>
                <p className="text-lg font-bold">
                  {format(parseISO(day.date), "MMM d")}
                </p>
              </div>

              {/* Activities */}
              <div className="p-4 space-y-3">
                {day.activities.length > 0 ? (
                  <>
                    {day.activities.map((activity) => (
                      <div key={activity.trip_activity_id} className="text-sm">
                        <p className="font-medium text-gray-900 truncate">
                          {activity.name}
                        </p>
                        {activity.custom_cost && (
                          <p className="text-xs text-gray-600">
                            ${activity.custom_cost.toFixed(2)}
                          </p>
                        )}
                      </div>
                    ))}

                    {/* Day total */}
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm font-semibold text-primary">
                        Day Total: ${day.totalCost.toFixed(2)}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-500 text-center py-4">
                    No activities
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
        <p className="text-sm text-gray-700">
          <strong>Total Activities:</strong>{" "}
          {dayGroups.reduce((sum, day) => sum + day.activities.length, 0)} |
          <strong className="ml-4">Total Cost:</strong> $
          {dayGroups.reduce((sum, day) => sum + day.totalCost, 0).toFixed(2)} |
          <strong className="ml-4">Days with Activities:</strong>{" "}
          {dayGroups.length}
        </p>
      </div>
    </div>
  );
};

export default ItineraryTimeline;
