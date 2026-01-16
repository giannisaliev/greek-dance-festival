"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import Image from "next/image";
import Cropper from "react-easy-crop";
import type { Point, Area } from "react-easy-crop";

interface Teacher {
  id: string;
  name: string;
  image: string;
  teachingStyle: string;
  country: string;
  countryCode: string;
  imagePadding: number;
}

// Popular countries with their codes
const countries = [
  { name: "Greece", code: "GR" },
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "GB" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "Italy", code: "IT" },
  { name: "Spain", code: "ES" },
  { name: "Netherlands", code: "NL" },
  { name: "Belgium", code: "BE" },
  { name: "Sweden", code: "SE" },
  { name: "Norway", code: "NO" },
  { name: "Denmark", code: "DK" },
  { name: "Finland", code: "FI" },
  { name: "Poland", code: "PL" },
  { name: "Czech Republic", code: "CZ" },
  { name: "Austria", code: "AT" },
  { name: "Switzerland", code: "CH" },
  { name: "Canada", code: "CA" },
  { name: "Australia", code: "AU" },
  { name: "Japan", code: "JP" },
  { name: "China", code: "CN" },
  { name: "India", code: "IN" },
  { name: "Brazil", code: "BR" },
  { name: "Argentina", code: "AR" },
  { name: "Mexico", code: "MX" },
  { name: "Cyprus", code: "CY" },
  { name: "Turkey", code: "TR" },
  { name: "Bulgaria", code: "BG" },
  { name: "Romania", code: "RO" },
  { name: "Serbia", code: "RS" },
].sort((a, b) => a.name.localeCompare(b.name));

// Function to get flag emoji from country code
const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function AdminTeachersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Image cropping states
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    teachingStyle: "",
    country: "",
    countryCode: "",
    imagePadding: 0,
  });

  // Check authentication
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
  }, [session, status, router]);

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers");
      const data = await response.json();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
    const image = document.createElement('img');
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setShowCropModal(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    setUploadingImage(true);
    try {
      const croppedBlob = await createCroppedImage(imageToCrop, croppedAreaPixels);
      
      const formDataUpload = new FormData();
      formDataUpload.append("files", croppedBlob, "teacher-photo.jpg");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await response.json();
      if (data.urls && data.urls.length > 0) {
        setFormData((prev) => ({ ...prev, image: data.urls[0] }));
      }
      setShowCropModal(false);
      setImageToCrop(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle country selection
  const handleCountryChange = (countryName: string) => {
    const selectedCountry = countries.find((c) => c.name === countryName);
    if (selectedCountry) {
      setFormData((prev) => ({
        ...prev,
        country: selectedCountry.name,
        countryCode: selectedCountry.code,
      }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = "/api/teachers";
      const method = editingTeacher ? "PUT" : "POST";
      const body = editingTeacher
        ? { id: editingTeacher.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchTeachers();
        setShowForm(false);
        setEditingTeacher(null);
        setFormData({
          name: "",
          image: "",
          teachingStyle: "",
          country: "",
          countryCode: "",
          imagePadding: 0,
        });
      } else {
        alert("Failed to save teacher");
      }
    } catch (error) {
      console.error("Error saving teacher:", error);
      alert("Failed to save teacher");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      image: teacher.image,
      teachingStyle: teacher.teachingStyle,
      country: teacher.country,
      countryCode: teacher.countryCode,
      imagePadding: teacher.imagePadding || 0,
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;

    try {
      const response = await fetch(`/api/teachers?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTeachers();
      }
    } catch (error) {
      console.error("Error deleting teacher:", error);
    }
  };

  // Show loading while checking auth
  if (status === "loading" || !session || !(session.user as any)?.isAdmin) {
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
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-8 border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Manage Teachers</h2>
              <p className="text-blue-100 mt-2">Add, edit, or remove teachers</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin"
                className="bg-white/20 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-white/30 transition-all"
              >
                ← Back to Admin
              </Link>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingTeacher(null);
                  setFormData({
                    name: "",
                    image: "",
                    teachingStyle: "",
                    country: "",
                    countryCode: "",
                    imagePadding: 0,
                  });
                }}
                className="bg-white text-blue-900 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all"
              >
                {showForm ? "Cancel" : "+ Add Teacher"}
              </button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white/5 rounded-xl p-4 sm:p-6 mb-8 border border-white/10">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
                {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Teacher's full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Country *</label>
                  <div className="relative">
                    <select
                      value={formData.country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none"
                      required
                    >
                      <option value="" className="bg-blue-900">Select a country</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.name} className="bg-blue-900">
                          {getFlagEmoji(country.code)} {country.name}
                        </option>
                      ))}
                    </select>
                    {formData.countryCode && (
                      <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-3xl pointer-events-none">
                        {getFlagEmoji(formData.countryCode)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-2">Teaching Style *</label>
                  <textarea
                    value={formData.teachingStyle}
                    onChange={(e) => setFormData({ ...formData, teachingStyle: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                    placeholder="Describe the teacher's teaching style and expertise..."
                    rows={4}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-2">Teacher Image *</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white file:text-blue-900 hover:file:bg-blue-50 file:cursor-pointer"
                    />
                    {uploadingImage && (
                      <div className="text-blue-100 text-sm">Uploading...</div>
                    )}
                  </div>
                  {formData.image && (
                    <div className="mt-4 flex items-center gap-4">
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                        <Image
                          src={formData.image}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      {editingTeacher && (
                        <button
                          type="button"
                          onClick={() => {
                            setImageToCrop(formData.image);
                            setShowCropModal(true);
                            setCrop({ x: 0, y: 0 });
                            setZoom(1);
                          }}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors text-sm"
                        >
                          Edit Image Position
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-2">Image Top Padding (for card display)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={formData.imagePadding}
                      onChange={(e) => setFormData({ ...formData, imagePadding: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-white font-semibold min-w-[60px]">{formData.imagePadding}px</span>
                  </div>
                  <p className="text-blue-200 text-sm mt-1">Adjust how low the image appears in the teacher card</p>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingImage || !formData.image}
                  className="px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : editingTeacher ? "Update Teacher" : "Add Teacher"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTeacher(null);
                  }}
                  className="px-8 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Teachers List */}
          {isLoading ? (
            <div className="text-center text-white text-xl py-12">Loading...</div>
          ) : teachers.length === 0 ? (
            <div className="text-center text-blue-100 text-xl py-12">
              No teachers added yet. Click "Add Teacher" to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all"
                >
                  <div className="relative h-64">
                    <Image
                      src={teacher.image}
                      alt={teacher.name}
                      fill
                      className="object-cover"
                      unoptimized
                      style={{ objectPosition: `center ${teacher.imagePadding || 0}px` }}
                    />
                    <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-2xl">{getFlagEmoji(teacher.countryCode)}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-white mb-2">{teacher.name}</h3>
                    <div className="flex items-center gap-2 text-blue-100 mb-3">
                      <span>{getFlagEmoji(teacher.countryCode)}</span>
                      <span className="text-sm">{teacher.country}</span>
                    </div>
                    <p className="text-blue-100 text-sm mb-4 line-clamp-3">
                      {teacher.teachingStyle}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Crop Modal */}
      {showCropModal && imageToCrop && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-6 max-w-2xl w-full border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">Position Your Image</h3>
            
            <div className="relative w-full h-96 bg-black/30 rounded-lg overflow-hidden">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-white font-semibold mb-2">Vertical Position</label>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  step={1}
                  value={-crop.y}
                  onChange={(e) => setCrop({ ...crop, y: -Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Horizontal Position</label>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  step={1}
                  value={crop.x}
                  onChange={(e) => setCrop({ ...crop, x: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => setCrop({ x: 0, y: 0 })}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors"
                >
                  Reset Position
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setImageToCrop(null);
                }}
                disabled={uploadingImage}
                className="flex-1 px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCropSave}
                disabled={uploadingImage}
                className="flex-1 px-6 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {uploadingImage ? "Uploading..." : "Save & Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
