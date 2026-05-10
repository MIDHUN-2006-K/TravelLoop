"use client";

import React, { useEffect, useState } from "react";
import { CheckSquare, Plus, Trash2, RefreshCcw, Package, Laptop, FileText, Star, Pill, Droplets } from "lucide-react";
import { PackingItem } from "@/types";
import { packingService } from "@/services/api";
import { Button, Badge } from "@/components/FormElements";
import toast from "react-hot-toast";

const CATEGORIES = [
  { id: "clothing", label: "Clothing", icon: "👕", color: "from-blue-400 to-blue-500" },
  { id: "electronics", label: "Electronics", icon: "💻", color: "from-purple-400 to-purple-500" },
  { id: "documents", label: "Documents", icon: "📄", color: "from-amber-400 to-amber-500" },
  { id: "essentials", label: "Essentials", icon: "⭐", color: "from-emerald-400 to-emerald-500" },
  { id: "medicine", label: "Medicine", icon: "💊", color: "from-red-400 to-red-500" },
  { id: "toiletries", label: "Toiletries", icon: "🧴", color: "from-pink-400 to-pink-500" },
];

interface Props { tripId: string; }

export default function PackingChecklist({ tripId }: Props) {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: "", category: "essentials" });
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await packingService.getPackingList(tripId);
      setItems(data);
    } catch { toast.error("Failed to load packing list"); }
    finally { setLoading(false); }
  };

  const handleToggle = async (item: PackingItem) => {
    try {
      await packingService.toggleItem(tripId, item.packing_item_id, !item.is_packed);
      setItems((prev) => prev.map((i) => i.packing_item_id === item.packing_item_id ? { ...i, is_packed: !i.is_packed } : i));
    } catch { toast.error("Failed to update item"); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    try {
      setAdding(true);
      const item = await packingService.addItem(tripId, { name: newItem.name, category: newItem.category });
      setItems((prev) => [...prev, item]);
      setNewItem({ name: "", category: "essentials" });
      setShowAdd(false);
      toast.success("Item added!");
    } catch { toast.error("Failed to add item"); }
    finally { setAdding(false); }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await packingService.deleteItem(tripId, itemId);
      setItems((prev) => prev.filter((i) => i.packing_item_id !== itemId));
    } catch { toast.error("Failed to remove item"); }
  };

  const handleReset = async () => {
    if (!confirm("Unpack all items?")) return;
    try {
      await packingService.resetAll(tripId);
      setItems((prev) => prev.map((i) => ({ ...i, is_packed: false })));
      toast.success("All items unpacked");
    } catch { toast.error("Failed to reset"); }
  };

  const byCategory = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category === cat.id),
  })).filter((c) => c.items.length > 0);

  const packedCount = items.filter((i) => i.is_packed).length;
  const progress = items.length > 0 ? Math.round((packedCount / items.length) * 100) : 0;

  if (loading) return <div className="skeleton h-64 w-full rounded-2xl" />;

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display font-bold text-surface-900">Packing Progress</h3>
            <p className="text-sm text-surface-500">{packedCount} of {items.length} items packed</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-display font-bold text-primary-600">{progress}%</span>
          </div>
        </div>
        <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-3">
          <Button size="sm" variant="ghost" icon={<Plus size={14} />} onClick={() => setShowAdd(!showAdd)}>
            Add Item
          </Button>
          {items.length > 0 && (
            <Button size="sm" variant="ghost" icon={<RefreshCcw size={14} />} onClick={handleReset}>
              Reset All
            </Button>
          )}
        </div>
      </div>

      {/* Add Item Form */}
      {showAdd && (
        <div className="card p-4 animate-fade-in-down">
          <form onSubmit={handleAdd} className="flex gap-3">
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
              placeholder="Item name..."
              className="flex-1 px-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
              autoFocus
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))}
              className="px-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>
            <Button type="submit" size="sm" loading={adding}>Add</Button>
          </form>
        </div>
      )}

      {/* Items by Category */}
      {items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-4xl mb-3">🎒</p>
          <p className="font-semibold text-surface-700">Your packing list is empty</p>
          <p className="text-sm text-surface-400 mt-1">Click "Add Item" to start building your list</p>
        </div>
      ) : (
        byCategory.map((cat) => {
          const catPacked = cat.items.filter((i) => i.is_packed).length;
          const isCollapsed = collapsed[cat.id];
          return (
            <div key={cat.id} className="card overflow-hidden">
              <button
                onClick={() => setCollapsed((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
                className="w-full flex items-center gap-3 p-4 hover:bg-surface-50 transition-colors text-left"
              >
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1">
                  <span className="font-semibold text-surface-900">{cat.label}</span>
                </div>
                <Badge variant={catPacked === cat.items.length ? "success" : "neutral"}>
                  {catPacked}/{cat.items.length}
                </Badge>
              </button>

              {!isCollapsed && (
                <div className="border-t border-surface-100">
                  {cat.items.map((item) => (
                    <div key={item.packing_item_id} className={`flex items-center gap-3 px-4 py-3 group hover:bg-surface-50 transition-colors ${item.is_packed ? "opacity-60" : ""}`}>
                      <button
                        onClick={() => handleToggle(item)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          item.is_packed
                            ? "bg-accent-500 border-accent-500 text-white"
                            : "border-surface-300 hover:border-primary-400"
                        }`}
                      >
                        {item.is_packed && <CheckSquare size={12} strokeWidth={3} />}
                      </button>
                      <span className={`flex-1 text-sm ${item.is_packed ? "line-through text-surface-400" : "text-surface-700"}`}>
                        {item.name}
                      </span>
                      {item.quantity > 1 && <span className="text-xs text-surface-400">×{item.quantity}</span>}
                      <button
                        onClick={() => handleDelete(item.packing_item_id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-surface-300 hover:text-danger transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
