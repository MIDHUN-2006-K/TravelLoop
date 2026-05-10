"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Plus, Trash2, Edit2, X, Save } from "lucide-react";
import { Note } from "@/types";
import { notesService } from "@/services/api";
import { Button, Input, Textarea } from "@/components/FormElements";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";

interface Props { tripId: string; }

export default function TripNotes({ tripId }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: "", content: "", day_date: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await notesService.getNotes(tripId);
      setNotes(data);
    } catch { toast.error("Failed to load notes"); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingNote(null);
    setForm({ title: "", content: "", day_date: "" });
    setShowForm(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setForm({ title: note.title, content: note.content, day_date: note.day_date || "" });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) { toast.error("Title and content are required"); return; }
    setSaving(true);
    try {
      if (editingNote) {
        const updated = await notesService.updateNote(tripId, editingNote.note_id, form);
        setNotes((prev) => prev.map((n) => n.note_id === editingNote.note_id ? updated : n));
        toast.success("Note updated");
      } else {
        const created = await notesService.addNote(tripId, { ...form, day_date: form.day_date || undefined });
        setNotes((prev) => [created, ...prev]);
        toast.success("Note added");
      }
      setShowForm(false);
    } catch { toast.error("Failed to save note"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      await notesService.deleteNote(tripId, noteId);
      setNotes((prev) => prev.filter((n) => n.note_id !== noteId));
      toast.success("Note deleted");
    } catch { toast.error("Failed to delete note"); }
  };

  if (loading) return <div className="skeleton h-64 w-full rounded-2xl" />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-surface-900">Trip Journal</h3>
          <p className="text-sm text-surface-500">{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" icon={<Plus size={14} />} onClick={openCreate}>New Note</Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="card p-5 animate-fade-in-down border-primary-200 border-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-surface-900">{editingNote ? "Edit Note" : "New Note"}</h4>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Note title..."
              required
            />
            <Textarea
              label="Content"
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              placeholder="Write your note, reminder, or journal entry..."
              rows={4}
            />
            <Input
              label="Date (Optional)"
              type="date"
              value={form.day_date}
              onChange={(e) => setForm((p) => ({ ...p, day_date: e.target.value }))}
              hint="Attach this note to a specific day"
            />
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" size="sm" loading={saving} icon={<Save size={14} />}>
                {editingNote ? "Update" : "Save Note"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 && !showForm ? (
        <div className="card p-10 text-center">
          <p className="text-4xl mb-3">📓</p>
          <p className="font-semibold text-surface-700">No notes yet</p>
          <p className="text-sm text-surface-400 mt-1">Keep travel tips, reminders, and journal entries here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.note_id} className="card p-5 group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-surface-900">{note.title}</h4>
                    {note.day_date && (
                      <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full font-medium">
                        {format(parseISO(note.day_date), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-surface-600 mt-2 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-surface-400 mt-3">{format(parseISO(note.created_at), "MMM d, yyyy · h:mm a")}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                  <button onClick={() => openEdit(note)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-primary-600 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(note.note_id)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-danger transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
