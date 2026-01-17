"use client";

import { useState, useEffect, useRef } from "react";
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
  const formRef = useRef<HTMLDivElement>(null);
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

  // Default attractions to seed
  const defaultAttractions = [
    {
      title: 'White Tower',
      description: "The iconic symbol of Thessaloniki, this 15th-century Ottoman fortification offers panoramic views of the city and the Thermaic Gulf. Now a museum showcasing the city's history.",
      image: 'https://images.unsplash.com/photo-1589834390005-5d4fb9bf3d32?w=800&q=80',
      badge: '15 min walk from waterfront',
      order: 0
    },
    {
      title: 'Rotunda',
      description: 'A UNESCO World Heritage Site dating back to the 4th century. Originally built as a mausoleum, it features stunning Byzantine mosaics and impressive architecture.',
      image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80',
      badge: 'UNESCO World Heritage',
      order: 1
    },
    {
      title: 'Ano Poli (Upper Town)',
      description: 'Wander through narrow cobblestone streets, traditional houses, and Byzantine walls. This historic neighborhood offers breathtaking views and authentic Greek atmosphere.',
      image: 'https://images.unsplash.com/photo-1601823984263-b55f31c1c650?w=800&q=80',
      badge: 'Best sunset views',
      order: 2
    },
    {
      title: 'Archaeological Museum',
      description: 'Home to priceless artifacts from ancient Macedonia, including treasures from the royal tombs of Vergina and stunning gold jewelry from the Hellenistic period.',
      image: 'https://images.unsplash.com/photo-1566127444979-b3d2b3c9e9c0?w=800&q=80',
      badge: 'Ancient Macedonian treasures',
      order: 3
    },
    {
      title: 'Ladadika District',
      description: "A vibrant entertainment district filled with colorful restored buildings, tavernas, bars, and restaurants. Perfect for experiencing Thessaloniki's nightlife and cuisine.",
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      badge: 'Nightlife & dining hub',
      order: 4
    },
    {
      title: 'Waterfront Promenade',
      description: 'A scenic 3.5km promenade along the Thermaic Gulf. Ideal for walking, cycling, or relaxing at seaside cafes while enjoying views of Mount Olympus on clear days.',
      image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80',
      badge: 'Perfect for sunset walks',
      order: 5
    }
  ];

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
    
    // Scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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
    
    // Scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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

  const loadDefaultAttractions = async () => {
    if (!confirm("This will add all default Thessaloniki attractions to the database. Continue?")) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Add each default attraction
      for (const attraction of defaultAttractions) {
        await fetch("/api/attractions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attraction),
        });
      }
      
      // Refresh the list
      await fetchAttractions();
      alert("Default attractions loaded successfully!");
    } catch (error) {
      console.error("Error loading default attractions:", error);
      setError("Failed to load default attractions");
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="flex gap-3">
            {attractions.length === 0 && (
              <button
                onClick={loadDefaultAttractions}
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                📥 Load Defaults
              </button>
            )}
            <button
              onClick={handleAddNew}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              + Add New Attraction
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAddingNew || editingAttraction) && (
          <div ref={formRef} className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border-2 border-yellow-400/50 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingAttraction ? `Edit: ${editingAttraction.title}` : "Add New Attraction"}
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
              className={`bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border-2 transition-all ${
                editingAttraction?.id === attraction.id
                  ? 'border-yellow-400 shadow-xl shadow-yellow-400/30'
                  : 'border-white/20'
              }`}
            >
              <div className="relative h-48">
                <img
                  src={attraction.image}
                  alt={attraction.title}
                  className="w-full h-full object-cover"
                />
                {editingAttraction?.id === attraction.id && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-xs font-bold">
                    ✏️ EDITING
                  </div>
                )}
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
            <div className="flex gap-4 justify-center">
              <button
                onClick={loadDefaultAttractions}
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                📥 Load Default Attractions
              </button>
              <button
                onClick={handleAddNew}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Add Your First Attraction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
