"use client";

import React, { useEffect, useState } from "react";
import { Trash2, Plus, Building2, Layers, Bed, CheckCircle, XCircle, Users } from "lucide-react";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";

interface Hall {
  id?: number;
  _id?: string;
  hall_name: string;
  no_beds: number;
  no_allocated_beds: number;
  no_floors: number;
}

interface Category {
  id?: number;
  _id?: string;
  category_name: string;
  hall_name: string;
  floor_allocated: number[];
  no_beds: number;
}

const HostelManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"halls" | "categories">("halls");
  const [halls, setHalls] = useState<Hall[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Hall form state
  const [hallName, setHallName] = useState("");
  const [noBeds, setNoBeds] = useState("");
  const [noFloors, setNoFloors] = useState("");

  // Category form state
  const [categoryName, setCategoryName] = useState("");
  const [categoryHall, setCategoryHall] = useState("");
  const [floorAllocated, setFloorAllocated] = useState("");
  const [catBeds, setCatBeds] = useState("");

  // Toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchHalls(), fetchCategories()]);
    setLoading(false);
  };

  const fetchHalls = async () => {
    try {
      const res = await fetch(`${API_BASE}/hall/`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setHalls(data);
    } catch (err: any) {
      console.error("Failed to fetch halls:", err);
      showToast("Failed to fetch halls", 'error');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/category/`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
      showToast("Failed to fetch categories", 'error');
    }
  };

  // Add Hall
  const addHall = async () => {
    if (!hallName || !noBeds) {
      showToast("Hall name and beds required", 'error');
      return;
    }

    const newHall = {
      hall_name: hallName,
      no_beds: Number(noBeds),
      no_allocated_beds: 0,
      no_floors: Number(noFloors) || 0,
    };

    try {
      const res = await fetch(`${API_BASE}/hall/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHall),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      showToast("✅ Hall added successfully!", 'success');
      fetchHalls();
      setHallName("");
      setNoBeds("");
      setNoFloors("");
    } catch (err: any) {
      console.error(err);
      showToast("Failed to add hall", 'error');
    }
  };

  // Delete Hall
  const deleteHall = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this hall?")) return;

    try {
      const res = await fetch(`${API_BASE}/hall/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      showToast("✅ Hall deleted successfully!", 'success');
      fetchHalls();
    } catch (err: any) {
      console.error("Failed to delete hall:", err);
      showToast("Failed to delete hall", 'error');
    }
  };

  // Add Category
const addCategory = async () => {
  if (!categoryName || !categoryHall) {
    showToast("Category name & hall required", 'error');
    return;
  }

  // Validate numeric fields
  if (!floorAllocated || !catBeds) {
    showToast("Floor and beds are required", 'error');
    return;
  }

  const newCat = {
    category_name: categoryName,
    hall_name: categoryHall,
    floor_allocated: [Number(floorAllocated)], // ARRAY - Back to original!
    no_beds: Number(catBeds),
  }; // Single object, NOT array

  console.log("Sending category data:", newCat);

  try {
    const res = await fetch(`${API_BASE}/category/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat),
    });

    if (!res.ok) {
      const responseText = await res.text();
      console.log("Error response:", responseText);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    showToast("✅ Category added successfully!", 'success');
    fetchCategories();
    setCategoryName("");
    setCategoryHall("");
    setFloorAllocated("");
    setCatBeds("");
  } catch (err: any) {
    console.error(err);
    showToast("Failed to add category", 'error');
  }
};

  // Delete Category
  const deleteCategory = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`${API_BASE}/category/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      showToast("✅ Category deleted successfully!", 'success');
      fetchCategories();
    } catch (err: any) {
      console.error("Failed to delete category:", err);
      showToast("Failed to delete category", 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-t font-[lexend] from-green-100 via-white to-green-200 w-full mt-4 p-3 rounded-lg shadow-md">
        <section className="bg-white min-h-screen rounded-lg shadow-md p-5 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading hostel data...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-t font-[lexend] from-green-100 via-white to-green-200 w-full mt-4 p-3 rounded-lg shadow-md">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <section className="bg-white min-h-screen rounded-lg shadow-md p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-green-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                🏨 Hostel Management
              </h1>
              <p className="text-gray-600">
                Manage halls and categories for Easter Camp Meeting 2026
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Halls</p>
                <p className="text-2xl font-bold text-green-600">{halls.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Categories</p>
                <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b-2 border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("halls")}
            className={`pb-3 px-6 font-semibold transition-all relative ${
              activeTab === "halls"
                ? "text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Halls
            </div>
            {activeTab === "halls" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`pb-3 px-6 font-semibold transition-all relative ${
              activeTab === "categories"
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Categories
            </div>
            {activeTab === "categories" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>

        {/* Halls Section */}
        {activeTab === "halls" && (
          <div className="space-y-6">
            {/* Add Hall Form */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 shadow-sm border-2 border-green-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Add New Hall
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hall Name
                  </label>
                  <input
                    value={hallName}
                    onChange={(e) => setHallName(e.target.value)}
                    placeholder="e.g., Hall A"
                    className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Beds
                  </label>
                  <input
                    value={noBeds}
                    onChange={(e) => setNoBeds(e.target.value)}
                    placeholder="e.g., 50"
                    type="number"
                    className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Floors
                  </label>
                  <input
                    value={noFloors}
                    onChange={(e) => setNoFloors(e.target.value)}
                    placeholder="e.g., 3"
                    type="number"
                    className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={addHall}
                className="mt-4 flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Hall
              </button>
            </div>

            {/* Halls Table */}
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  All Halls ({halls.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-4 font-semibold text-gray-700">Hall Name</th>
                      <th className="p-4 font-semibold text-gray-700">Total Beds</th>
                      <th className="p-4 font-semibold text-gray-700">Floors</th>
                      <th className="p-4 font-semibold text-gray-700">Allocated Beds</th>
                      <th className="p-4 font-semibold text-gray-700 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {halls.length > 0 ? (
                      halls.map((hall, idx) => (
                        <tr
                          key={hall.id || hall._id}
                          className={`${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-green-50 transition-colors border-b border-gray-200`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-green-600" />
                              </div>
                              <span className="font-semibold text-gray-800">{hall.hall_name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Bed className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{hall.no_beds}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{hall.no_floors}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {hall.no_allocated_beds} / {hall.no_beds}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => deleteHall(hall.id || hall._id!)}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-sm"
                              title="Delete Hall"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center p-8">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <Building2 className="w-16 h-16 mb-4" />
                            <p className="text-lg font-medium">No halls found</p>
                            <p className="text-sm">Add your first hall to get started</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Categories Section */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Add Category Form */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm border-2 border-blue-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Add New Category
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g., VIP"
                    className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Hall
                  </label>
                  <select
                    value={categoryHall}
                    onChange={(e) => setCategoryHall(e.target.value)}
                    className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a hall</option>
                    {halls.map((hall) => (
                      <option key={hall.id || hall._id} value={hall.hall_name}>
                        {hall.hall_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor Allocated
                  </label>
                  <input
                    value={floorAllocated}
                    onChange={(e) => setFloorAllocated(e.target.value)}
                    placeholder="e.g., 1"
                    type="number"
                    className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Beds
                  </label>
                  <input
                    value={catBeds}
                    onChange={(e) => setCatBeds(e.target.value)}
                    placeholder="e.g., 20"
                    type="number"
                    className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={addCategory}
                className="mt-4 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Category
              </button>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  All Categories ({categories.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-4 font-semibold text-gray-700">Category Name</th>
                      <th className="p-4 font-semibold text-gray-700">Hall Name</th>
                      <th className="p-4 font-semibold text-gray-700">Floor(s)</th>
                      <th className="p-4 font-semibold text-gray-700">Beds</th>
                      <th className="p-4 font-semibold text-gray-700 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length > 0 ? (
                      categories.map((cat, idx) => (
                        <tr
                          key={cat.id || cat._id}
                          className={`${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition-colors border-b border-gray-200`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                              </div>
                              <span className="font-semibold text-gray-800">{cat.category_name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{cat.hall_name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">
                                {Array.isArray(cat.floor_allocated)
                                  ? cat.floor_allocated.join(", ")
                                  : cat.floor_allocated}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Bed className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{cat.no_beds}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => deleteCategory(cat.id || cat._id!)}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-sm"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center p-8">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <Users className="w-16 h-16 mb-4" />
                            <p className="text-lg font-medium">No categories found</p>
                            <p className="text-sm">Add your first category to get started</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default HostelManagement;