"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";

interface Attraction {
  id: string;
  title: string;
  description: string;
  image: string;
  badge: string;
  order: number;
}

export default function AdminAttractionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    badge: "",
    order: 0,
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }
    
    if (!(session.user as any)?.isAdmin) {
      router.push("/");
      return;
    }

    fetchAttractions();
  }, [session, status, router]);

  // Show loading while checking auth
  if (status === "loading" || !session || !(session.user as any)?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const fetchAttractions = async () => {
    try {
      const res = await fetch("/api/attractions");
      if (res.ok) {
        const data = await res.json();
        setAttractions(data);
      }
    } catch (error) {
      console.error("Error fetching attractions:", error);
      setError("Failed to load attractions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (attraction: Attraction) => {
    setEditingAttraction(attraction);
    setFormData({
      title: attraction.title,
      description: attraction.description,
      image: attraction.image,
      badge: attraction.badge,
      order: attraction.order,
    });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setEditingAttraction(null);
    setFormData({
      title: "",
      description: "",
      image: "",
      badge: "",
      order: attractions.length,
    });
    setIsAddingNew(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const url = "/api/attractions";
      const method = editingAttraction ? "PUT" : "POST";
      const body = editingAttraction
        ? { id: editingAttraction.id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchAttractions();
        setEditingAttraction(null);
        setIsAddingNew(false);
        setFormData({
          title: "",
          description: "",
          image: "",
          badge: "",
          order: 0,
        });
      } else {
        setError("Failed to save attraction");
      }
    } catch (error) {
      console.error("Error saving attraction:", error);
      setError("Failed to save attraction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attraction?")) return;

    try {
      const res = await fetch(`/api/attractions?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchAttractions();
      } else {
        setError("Failed to delete attraction");
      }
    } catch (error) {
      console.error("Error deleting attraction:", error);
      setError("Failed to delete attraction");
    }
  };

  const cancelEdit = () => {
    setEditingAttraction(null);
    setIsAddingNew(false);
    setFormData({
      title: "",
      description: "",
      image: "",
      badge: "",
      order: 0,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/admin"
              className="text-blue-200 hover:text-white mb-2 inline-block"
            >
              ← Back to Admin Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white">
              Manage Sightseeing Attractions
            </h1>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            + Add New Attraction
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAddingNew || editingAttraction) && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingAttraction ? "Edit Attraction" : "Add New Attraction"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
                <p className="text-blue-200 text-sm mt-1">
                  Use Unsplash or any image URL
                </p>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Badge Text *
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) =>
                    setFormData({ ...formData, badge: e.target.value })
                  }
                  placeholder="e.g., 15 min walk from waterfront"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "Saving..." : "Save Attraction"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Attractions List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((attraction) => (
            <div
              key={attraction.id}
              className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20"
            >
              <div className="relative h-48">
                <img
                  src={attraction.image}
                  alt={attraction.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-white mb-2">
                  {attraction.title}
                </h3>
                <p className="text-blue-100 text-sm mb-2 line-clamp-2">
                  {attraction.description}
                </p>
                <p className="text-yellow-300 text-xs mb-4">
                  {attraction.badge}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(attraction)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(attraction.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {attractions.length === 0 && (
          <div className="text-center text-white py-12">
            <p className="text-xl mb-4">No attractions yet</p>
            <button
              onClick={handleAddNew}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Add Your First Attraction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
