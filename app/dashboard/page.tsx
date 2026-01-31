"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { useRouter } from "next/navigation";

interface Participant {
  id: string;
  registrantFirstName: string | null;
  registrantLastName: string | null;
  phone: string;
  packageType: string;
  guinnessRecordAttempt: boolean;
  greekNight: boolean;
  totalPrice: number;
  checkedIn: boolean;
  createdAt: string;
  studioName: string | null;
}

const packages = [
  { name: "Guinness Record Only", price: 30 },
  { name: "Greek Night Only", price: 40 },
  { name: "Starter Pass", price: 70 },
  { name: "Explorer Pass", price: 100 },
  { name: "Enthusiast Pass", price: 160 },
  { name: "Full Pass", price: 260 },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [myRegistration, setMyRegistration] = useState<Participant | null>(null);
  const [registeredStudents, setRegisteredStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    studioName: "",
    packageType: "",
    guinnessRecordAttempt: false,
    greekNight: false,
    totalPrice: 0,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, studentsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/participants/my-registrations")
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
        setMyRegistration(userData.user.participant);
      } else {
        router.push("/login");
        return;
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setRegisteredStudents(studentsData.students || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-xl">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const getPackageIcon = (packageType: string) => {
    if (packageType.includes("Full")) return "👑";
    if (packageType.includes("Enthusiast")) return "⭐";
    if (packageType.includes("Explorer")) return "🎭";
    if (packageType.includes("Starter")) return "🌟";
    if (packageType.includes("Guinness")) return "🏆";
    if (packageType.includes("Greek Night")) return "🍷";
    return "🎫";
  };

  const calculatePrice = (
    packageType: string,
    guinness: boolean,
    greek: boolean
  ) => {
    const pkg = packages.find((p) => p.name === packageType);
    if (!pkg) return 0;

    let price = pkg.price;
    if (packageType !== "Full Pass" && packageType !== "Guinness Record Only" && packageType !== "Greek Night Only") {
      if (guinness) price += 30;
      if (greek) price += 40;
    }
    return price;
  };

  const startEdit = (participant: Participant) => {
    setEditingId(participant.id);
    setEditForm({
      firstName: participant.registrantFirstName || user?.firstName || "",
      lastName: participant.registrantLastName || user?.lastName || "",
      studioName: participant.studioName || "",
      packageType: participant.packageType,
      guinnessRecordAttempt: participant.guinnessRecordAttempt,
      greekNight: participant.greekNight,
      totalPrice: participant.totalPrice,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handlePackageChange = (packageType: string) => {
    const pkg = packages.find((p) => p.name === packageType);
    if (!pkg) return;

    let guinness = editForm.guinnessRecordAttempt;
    let greek = editForm.greekNight;

    if (packageType === "Full Pass") {
      guinness = true;
      greek = true;
    } else if (packageType === "Guinness Record Only") {
      guinness = true;
      greek = false;
    } else if (packageType === "Greek Night Only") {
      guinness = false;
      greek = true;
    }

    setEditForm({
      ...editForm,
      packageType,
      guinnessRecordAttempt: guinness,
      greekNight: greek,
      totalPrice: calculatePrice(packageType, guinness, greek),
    });
  };

  const handleAddonChange = (addon: "guinness" | "greek", checked: boolean) => {
    const newForm = {
      ...editForm,
      guinnessRecordAttempt:
        addon === "guinness" ? checked : editForm.guinnessRecordAttempt,
      greekNight: addon === "greek" ? checked : editForm.greekNight,
    };

    newForm.totalPrice = calculatePrice(
      editForm.packageType,
      newForm.guinnessRecordAttempt,
      newForm.greekNight
    );

    setEditForm(newForm);
  };

  const saveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/participants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrantFirstName: editForm.firstName,
          registrantLastName: editForm.lastName,
          studioName: editForm.studioName || null,
          packageType: editForm.packageType,
          guinnessRecordAttempt: editForm.guinnessRecordAttempt,
          greekNight: editForm.greekNight,
          totalPrice: editForm.totalPrice,
        }),
      });

      if (response.ok) {
        await fetchData();
        cancelEdit();
      } else {
        alert("Failed to update registration");
      }
    } catch (error) {
      console.error("Error updating registration:", error);
      alert("Error updating registration");
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const deleteRegistration = async (id: string) => {
    try {
      const response = await fetch(`/api/participants/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchData();
        setDeleteConfirm(null);
      } else {
        alert("Failed to delete registration");
      }
    } catch (error) {
      console.error("Error deleting registration:", error);
      alert("Error deleting registration");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            My Registrations
          </h1>
          <p className="text-xl text-blue-100">
            Manage your festival registrations
          </p>
        </div>

        {/* My Registration */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">My Registration</h2>
          {myRegistration ? (
            editingId === myRegistration.id ? (
              /* Edit Mode for My Registration */
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Edit My Registration</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-semibold mb-2">First Name</label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-semibold mb-2">Last Name</label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Package</label>
                    <select
                      value={editForm.packageType}
                      onChange={(e) => handlePackageChange(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
                    >
                      {packages.map((pkg) => (
                        <option key={pkg.name} value={pkg.name} className="bg-blue-900">
                          {pkg.name} - €{pkg.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  {editForm.packageType !== "Full Pass" &&
                    editForm.packageType !== "Guinness Record Only" &&
                    editForm.packageType !== "Greek Night Only" && (
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 text-white">
                          <input
                            type="checkbox"
                            checked={editForm.guinnessRecordAttempt}
                            onChange={(e) => handleAddonChange("guinness", e.target.checked)}
                            className="w-5 h-5"
                          />
                          <span>🏆 Guinness Record Attempt (+€30)</span>
                        </label>
                        <label className="flex items-center gap-3 text-white">
                          <input
                            type="checkbox"
                            checked={editForm.greekNight}
                            onChange={(e) => handleAddonChange("greek", e.target.checked)}
                            className="w-5 h-5"
                          />
                          <span>🍷 Greek Night (+€40)</span>
                        </label>
                      </div>
                    )}

                  <div className="pt-4 border-t border-white/20">
                    <p className="text-white text-xl font-bold">Total: €{editForm.totalPrice}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => saveEdit(myRegistration.id)}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-6 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
            /* View Mode for My Registration */
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{getPackageIcon(myRegistration.packageType)}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {myRegistration.registrantFirstName || user?.firstName} {myRegistration.registrantLastName || user?.lastName}
                    </h3>
                    <p className="text-blue-100">{myRegistration.packageType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-3xl">€{myRegistration.totalPrice}</p>
                  {myRegistration.checkedIn && (
                    <span className="inline-block bg-green-500 text-white text-sm px-3 py-1 rounded-full mt-2">
                      ✓ Checked In
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-blue-200 text-sm">Phone</p>
                  <p className="text-white font-semibold">{myRegistration.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-sm">Registration Date</p>
                  <p className="text-white font-semibold">
                    {new Date(myRegistration.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {(myRegistration.guinnessRecordAttempt || myRegistration.greekNight) && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-blue-200 text-sm mb-2">Add-ons:</p>
                  <div className="flex gap-2">
                    {myRegistration.guinnessRecordAttempt && (
                      <span className="bg-blue-500/30 text-white px-3 py-1 rounded-full text-sm">
                        🏆 Guinness Record
                      </span>
                    )}
                    {myRegistration.greekNight && (
                      <span className="bg-purple-500/30 text-white px-3 py-1 rounded-full text-sm">
                        🍷 Greek Night
                      </span>
                    )}
                  </div>
                </div>
              )}

              {deleteConfirm === myRegistration.id ? (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mt-4">
                  <p className="text-white font-semibold mb-3">
                    Are you absolutely sure you want to delete your registration?
                  </p>
                  <p className="text-red-200 text-sm mb-4">
                    This will be stored for 7 days before permanent deletion.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => deleteRegistration(myRegistration.id)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-6 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 mt-4 pt-4 border-t border-white/20">
                  <button
                    onClick={() => startEdit(myRegistration)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Edit Registration
                  </button>
                  <button
                    onClick={() => confirmDelete(myRegistration.id)}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Delete Registration
                  </button>
                </div>
              )}
            </div>
            )
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-2xl font-bold text-white mb-4">Not Registered Yet</h3>
              <p className="text-blue-100 mb-6">
                You haven't registered for the festival yet. Register now to secure your spot!
              </p>
              <Link
                href="/register"
                className="inline-block bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all shadow-lg"
              >
                Register Now
              </Link>
            </div>
          )}
        </div>

        {/* Students I Registered */}
        {registeredStudents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">
                Students I Registered ({registeredStudents.length})
              </h2>
              <Link
                href="/register/bulk"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                + Add More Students
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {registeredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all"
                >
                  {editingId === student.participant.id ? (
                    /* Edit Mode for Student */
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-white mb-4">Edit Student</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white text-sm font-semibold mb-2">First Name</label>
                          <input
                            type="text"
                            value={editForm.firstName}
                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-white text-sm font-semibold mb-2">Last Name</label>
                          <input
                            type="text"
                            value={editForm.lastName}
                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white text-sm font-semibold mb-2">
                          Studio Name (Optional) {editForm.studioName && <span className="text-blue-200 font-normal">- Currently: {editForm.studioName}</span>}
                        </label>
                        <input
                          type="text"
                          value={editForm.studioName}
                          onChange={(e) => setEditForm({ ...editForm, studioName: e.target.value })}
                          placeholder={editForm.studioName ? editForm.studioName : "Enter studio name or leave empty"}
                          className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-300"
                        />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-semibold mb-2">Package</label>
                        <select
                          value={editForm.packageType}
                          onChange={(e) => handlePackageChange(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
                        >
                          {packages.map((pkg) => (
                            <option key={pkg.name} value={pkg.name} className="bg-blue-900">
                              {pkg.name} - €{pkg.price}
                            </option>
                          ))}
                        </select>
                      </div>

                      {editForm.packageType !== "Full Pass" &&
                        editForm.packageType !== "Guinness Record Only" &&
                        editForm.packageType !== "Greek Night Only" && (
                          <div className="space-y-2">
                            <label className="flex items-center gap-3 text-white">
                              <input
                                type="checkbox"
                                checked={editForm.guinnessRecordAttempt}
                                onChange={(e) => handleAddonChange("guinness", e.target.checked)}
                                className="w-5 h-5"
                              />
                              <span>🏆 Guinness Record Attempt (+€30)</span>
                            </label>
                            <label className="flex items-center gap-3 text-white">
                              <input
                                type="checkbox"
                                checked={editForm.greekNight}
                                onChange={(e) => handleAddonChange("greek", e.target.checked)}
                                className="w-5 h-5"
                              />
                              <span>🍷 Greek Night (+€40)</span>
                            </label>
                          </div>
                        )}

                      <div className="pt-4 border-t border-white/20">
                        <p className="text-white text-xl font-bold">Total: €{editForm.totalPrice}</p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => saveEdit(student.participant.id)}
                          className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-6 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode for Student */
                    <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{getPackageIcon(student.participant.packageType)}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {student.participant.registrantFirstName} {student.participant.registrantLastName}
                      </h3>
                      <p className="text-blue-200 text-sm">{student.email}</p>
                      {student.participant.studioName && (
                        <p className="text-blue-300 text-sm">🎭 {student.participant.studioName}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100 text-sm">{student.participant.packageType}</span>
                      <span className="text-white font-bold">€{student.participant.totalPrice}</span>
                    </div>
                  </div>

                  {(student.participant.guinnessRecordAttempt || student.participant.greekNight) && (
                    <div className="flex gap-2 mb-3">
                      {student.participant.guinnessRecordAttempt && (
                        <span className="bg-blue-500/20 text-blue-100 px-2 py-1 rounded text-xs">
                          🏆 Guinness
                        </span>
                      )}
                      {student.participant.greekNight && (
                        <span className="bg-purple-500/20 text-purple-100 px-2 py-1 rounded text-xs">
                          🍷 Greek Night
                        </span>
                      )}
                    </div>
                  )}

                  {student.participant.checkedIn && (
                    <div className="mb-3 pb-3 border-b border-white/20">
                      <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ Checked In
                      </span>
                    </div>
                  )}

                  {deleteConfirm === student.participant.id ? (
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                      <p className="text-white font-semibold mb-3">
                        Delete {student.participant.registrantFirstName}'s registration?
                      </p>
                      <p className="text-red-200 text-sm mb-4">
                        This will be stored for 7 days before permanent deletion.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => deleteRegistration(student.participant.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(student.participant)}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(student.participant.id)}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/register/bulk"
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all text-center group"
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
              Register Students
            </h3>
            <p className="text-blue-100 text-sm">
              Register multiple students for your dance studio
            </p>
          </Link>

          <Link
            href="/"
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all text-center group"
          >
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
              View Schedule
            </h3>
            <p className="text-blue-100 text-sm">
              Check the festival program and workshops
            </p>
          </Link>

          <Link
            href="/information"
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all text-center group"
          >
            <div className="text-4xl mb-3">ℹ️</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
              Festival Info
            </h3>
            <p className="text-blue-100 text-sm">
              Location, schedule, and important details
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
