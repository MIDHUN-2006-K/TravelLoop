"use client";

import React, { useState } from "react";
import { TripStop, TripActivity } from "@/types";
import { activitiesService } from "@/services/api";
import { Button } from "@/components/FormElements";
import { Trash2, Edit2, X } from "lucide-react";
import toast from "react-hot-toast";

interface ActivityManagerProps {
  tripId: string;
  stop: TripStop;
  onActivityAdded?: () => void; // reuse existing callbacks to refresh parent
  onActivityDeleted?: () => void;
}

const ActivityManager: React.FC<ActivityManagerProps> = ({
  tripId,
  stop,
  onActivityAdded,
  onActivityDeleted,
}) => {
  const [editingActivity, setEditingActivity] = useState<TripActivity | null>(
    null
  );
  const [customCost, setCustomCost] = useState("");
  const [scheduledDate, setScheduledDate] = useState(stop.start_date);
  const [submitting, setSubmitting] = useState(false);

  const openEditModal = (activity: TripActivity) => {
    setEditingActivity(activity);
    setCustomCost(activity.custom_cost?.toString() || "");
    setScheduledDate(activity.scheduled_date);
  };

  const resetModal = () => {
    setEditingActivity(null);
    setCustomCost("");
    setScheduledDate(stop.start_date);
  };

  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    try {
      setSubmitting(true);
      await activitiesService.updateActivity(
        tripId,
        editingActivity.trip_activity_id,
        {
          custom_cost: customCost ? parseFloat(customCost) : undefined,
          scheduled_date: scheduledDate,
        }
      );

      toast.success("Activity updated successfully");
      resetModal();
      onActivityAdded?.();
    } catch (err) {
      toast.error("Failed to update activity");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm("Delete this activity?")) return;

    try {
      await activitiesService.deleteActivity(tripId, activityId);
      toast.success("Activity deleted");
      onActivityDeleted?.();
    } catch (err) {
      toast.error("Failed to delete activity");
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Activities List */}
      {stop.activities && stop.activities.length > 0 ? (
        <div className="space-y-2">
          {stop.activities.map((activity) => (
            <div
              key={activity.trip_activity_id}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.name}</p>
                <p className="text-xs text-gray-600">
                  {new Date(activity.scheduled_date).toLocaleDateString()}
                  {activity.custom_cost &&
                    ` • $${activity.custom_cost.toFixed(2)}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(activity)}
                  className="p-2 text-gray-600 hover:text-primary hover:bg-blue-50 rounded transition"
                  aria-label={`Edit ${activity.name}`}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() =>
                    handleDeleteActivity(activity.trip_activity_id)
                  }
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  aria-label={`Delete ${activity.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          No activities added to this stop
        </p>
      )}

      {/* Edit Activity Modal */}
      {editingActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Edit Activity</h3>
              <button
                onClick={resetModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateActivity} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Cost (optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customCost}
                  onChange={(e) => setCustomCost(e.target.value)}
                  placeholder="e.g., 25.50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={stop.start_date}
                  max={stop.end_date}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={resetModal}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityManager;
