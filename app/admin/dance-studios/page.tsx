"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import Image from "next/image";

interface DanceStudio {
  id: string;
  name: string;
  logo: string;
  country: string;
  countryCode: string;
  order: number;
}

const countries = [
  { name: "Albania", code: "AL" },
  { name: "Argentina", code: "AR" },
  { name: "Australia", code: "AU" },
  { name: "Austria", code: "AT" },
  { name: "Belgium", code: "BE" },
  { name: "Brazil", code: "BR" },
  { name: "Bulgaria", code: "BG" },
  { name: "Canada", code: "CA" },
  { name: "China", code: "CN" },
  { name: "Croatia", code: "HR" },
  { name: "Cyprus", code: "CY" },
  { name: "Czech Republic", code: "CZ" },
  { name: "Denmark", code: "DK" },
  { name: "Finland", code: "FI" },
  { name: "France", code: "FR" },
  { name: "Germany", code: "DE" },
  { name: "Greece", code: "GR" },
  { name: "Hungary", code: "HU" },
  { name: "India", code: "IN" },
  { name: "Italy", code: "IT" },
  { name: "Japan", code: "JP" },
  { name: "Mexico", code: "MX" },
  { name: "Netherlands", code: "NL" },
  { name: "North Macedonia", code: "MK" },
  { name: "Norway", code: "NO" },
  { name: "Poland", code: "PL" },
  { name: "Portugal", code: "PT" },
  { name: "Romania", code: "RO" },
  { name: "Russia", code: "RU" },
  { name: "Serbia", code: "RS" },
  { name: "Slovakia", code: "SK" },
  { name: "Slovenia", code: "SI" },
  { name: "Spain", code: "ES" },
  { name: "Sweden", code: "SE" },
  { name: "Switzerland", code: "CH" },
  { name: "Turkey", code: "TR" },
  { name: "Ukraine", code: "UA" },
  { name: "United Kingdom", code: "GB" },
  { name: "United States", code: "US" },
].sort((a, b) => a.name.localeCompare(b.name));

const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function AdminDanceStudiosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [studios, setStudios] = useState<DanceStudio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudio, setEditingStudio] = useState<DanceStudio | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    country: "Greece",
    countryCode: "GR",
    order: 0,
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    fetchStudios();
  }, [session, status, router]);

  const fetchStudios = async () => {
    try {
      const res = await fetch("/api/dance-studios");
      const data = await res.json();
      setStudios(data.studios || []);
    } catch (error) {
      console.error("Error fetching dance studios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("files", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData((prev) => ({ ...prev, logo: data.urls[0] }));
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo. Please try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCountryChange = (code: string) => {
    const found = countries.find((c) => c.code === code);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        country: found.name,
        countryCode: found.code,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = editingStudio ? "PUT" : "POST";
      const body = editingStudio
        ? { ...formData, id: editingStudio.id }
        : formData;

      const res = await fetch("/api/dance-studios", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save studio");
      }

      await fetchStudios();
      resetForm();
      alert(editingStudio ? "Studio updated!" : "Studio added!");
    } catch (error: any) {
      console.error("Error saving studio:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (studio: DanceStudio) => {
    setEditingStudio(studio);
    setFormData({
      name: studio.name,
      logo: studio.logo,
      country: studio.country,
      countryCode: studio.countryCode,
      order: studio.order,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (studio: DanceStudio) => {
    if (!confirm(`Delete "${studio.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/dance-studios?id=${studio.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchStudios();
    } catch (error) {
      console.error("Error deleting studio:", error);
      alert("Failed to delete studio.");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", logo: "", country: "Greece", countryCode: "GR", order: 0 });
    setEditingStudio(null);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/admin"
              className="text-blue-200 hover:text-white text-sm mb-2 inline-block"
            >
              ← Back to Admin
            </Link>
            <h1 className="text-3xl font-bold text-white">
              🏛️ Dance Studios
            </h1>
            <p className="text-blue-200 mt-1">
              Manage participating dance studios for the Guinness Record slider
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-blue-900 px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-all"
            >
              + Add Studio
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingStudio ? "Edit Studio" : "Add New Studio"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Studio Name */}
              <div>
                <label className="block text-white font-semibold mb-2 text-sm">
                  Studio Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Athens Dance Academy"
                  className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2.5 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-white font-semibold mb-2 text-sm">
                  Country *
                </label>
                <select
                  value={formData.countryCode}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full bg-blue-900 border border-white/30 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {getFlagEmoji(c.code)} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-white font-semibold mb-2 text-sm">
                  Studio Logo <span className="text-blue-300 font-normal">(optional — initials shown if not uploaded)</span>
                </label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="flex items-center gap-2 cursor-pointer bg-white/10 border border-white/30 border-dashed rounded-lg px-4 py-3 hover:bg-white/20 transition-all">
                      <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-blue-200 text-sm">
                        {uploadingLogo ? "Uploading..." : "Click to upload logo"}
                      </span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={uploadingLogo}
                      />
                    </label>
                    {formData.logo && (
                      <p className="text-green-300 text-xs mt-1">✓ Logo uploaded</p>
                    )}
                  </div>
                {/* Preview: logo or initials */}
                <div className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/20 bg-white/10">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Preview" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-white font-bold text-lg leading-tight text-center px-1">
                      {formData.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3) || '?'}
                    </span>
                  )}
                </div>
                </div>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-white font-semibold mb-2 text-sm">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))
                  }
                  className="w-32 bg-white/10 border border-white/30 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="text-blue-300 text-xs mt-1">Lower number = appears first in slider</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingLogo}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingStudio ? "Update Studio" : "Add Studio"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-2.5 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Studios Grid */}
        {studios.length === 0 ? (
          <div className="text-center py-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <div className="text-6xl mb-4">🏛️</div>
            <p className="text-white text-xl font-semibold">No dance studios yet</p>
            <p className="text-blue-200 mt-2">Add studios to display in the homepage slider</p>
          </div>
        ) : (
          <>
            <p className="text-blue-200 text-sm mb-4">{studios.length} studio{studios.length !== 1 ? "s" : ""} in the slider</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {studios.map((studio) => (
                <div
                  key={studio.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 flex flex-col items-center gap-3"
                >
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden bg-white/10 border border-white/20">
                    {studio.logo ? (
                      <img src={studio.logo} alt={studio.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-white font-bold text-lg leading-tight text-center px-1">
                        {studio.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 3)}
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-sm leading-tight">{studio.name}</p>
                    <div className="flex items-center gap-1 mt-1 justify-center">
                      <img
                        src={`https://flagcdn.com/w20/${studio.countryCode.toLowerCase()}.png`}
                        alt={studio.country}
                        className="w-4 h-auto rounded-sm"
                      />
                      <p className="text-blue-200 text-xs">{studio.country}</p>
                    </div>
                    <p className="text-blue-300 text-xs">Order: {studio.order}</p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleEdit(studio)}
                      className="flex-1 bg-blue-500/30 hover:bg-blue-500/50 text-white text-xs px-2 py-1.5 rounded-lg transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(studio)}
                      className="flex-1 bg-red-500/30 hover:bg-red-500/50 text-white text-xs px-2 py-1.5 rounded-lg transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
