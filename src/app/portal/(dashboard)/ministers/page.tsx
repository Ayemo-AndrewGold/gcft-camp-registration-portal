"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, CheckCircle, XCircle, AlertCircle, UserPlus, RefreshCw, Camera } from "lucide-react";
import Webcam from "react-webcam";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";

interface MinisterReg {
  phone_number: string;
  first_name: string;
  gender: string;
  age_range: string;
  marital_status: string;
  country: string;
  state: string;
  arrival_date: string;
  last_name?: string;
  room_number?: string;
  category?: string;
  medical_issues?: string;
  local_assembly?: string;
  local_assembly_address?: string;
  hall_name?: string;
  floor_id?: string;
  bed_number?: string;
}

interface Hall {
  id: number;
  hall_name: string;
  gender: string;
  no_floors: number;
}

interface Floor {
  floor_id: string;
  floor_no: number;
  hall_id: number;
  categories: number[];
  age_ranges: string[];
  no_beds: number;
  status: string;
}

const countryStates: Record<string, string[]> = {
  Nigeria: [
    "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
    "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
    "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
    "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
    "Yobe","Zamfara",
  ],
  USA: ["California","Texas","New York","Florida"],
  Canada: ["Ontario","Quebec","British Columbia","Alberta"],
  Ghana: ["Greater Accra","Ashanti","Central","Eastern"],
  UK: ["England","Scotland","Wales","Northern Ireland"],
};

const countriesList = [
  "Nigeria","Ghana","USA","UK","Canada","South Africa","Kenya","Uganda",
  "Tanzania","Rwanda","Zambia","Zimbabwe","Cameroon","Senegal","Ivory Coast",
  "Benin","Togo","Liberia","Sierra Leone","Guinea","Gambia","India","Australia",
  "Germany","France","Italy","Spain","Brazil","Mexico","United Arab Emirates",
  "Saudi Arabia","Egypt","Morocco","Singapore","South Korea","Japan","China",
];

const MinisterRegForm: React.FC = () => {
  const [formData, setFormData] = useState<Partial<MinisterReg>>({
    arrival_date: "2026-04-02",
    country: "Nigeria",
    age_range: "46-55",
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]         = useState<string>("");
  const [processing, setProcessing]         = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen]     = useState(false);
  const [toast, setToast]                   = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Hall & Floor state
  const [halls, setHalls]               = useState<Hall[]>([]);
  const [floors, setFloors]             = useState<Floor[]>([]);
  const [hallsLoading, setHallsLoading] = useState(false);
  const [floorsLoading, setFloorsLoading] = useState(false);
  const [selectedHallName, setSelectedHallName] = useState<string>("");

  const webcamRef    = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all halls on mount
  useEffect(() => {
    const fetchHalls = async () => {
      setHallsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/hall/`);
        if (!res.ok) throw new Error("Failed to fetch halls");
        const data: Hall[] = await res.json();
        setHalls(data);
      } catch (err) {
        showToast("Could not load halls. Please refresh.", "error");
      } finally {
        setHallsLoading(false);
      }
    };
    fetchHalls();
  }, []);

  // Fetch floors when a hall is selected
  useEffect(() => {
    if (!selectedHallName) {
      setFloors([]);
      return;
    }
    const fetchFloors = async () => {
      setFloorsLoading(true);
      setFloors([]);
      try {
        const res = await fetch(`${API_BASE}/hall/${encodeURIComponent(selectedHallName)}/floors`);
        if (!res.ok) throw new Error("Failed to fetch floors");
        const data: Floor[] = await res.json();
        setFloors(data);
      } catch (err) {
        showToast("Could not load floors for selected hall.", "error");
      } finally {
        setFloorsLoading(false);
      }
    };
    fetchFloors();
  }, [selectedHallName]);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 6000);
  };

  const handleFieldChange = (field: string, value: string) => {
    let updated: Partial<MinisterReg> = { ...formData, [field]: value };

    if (field === "category") {
      const map: Record<string, { gender: string; marital_status: string }> = {
        "Minister":       { gender: "Male",   marital_status: "Married" },
        "Elder":          { gender: "Male",   marital_status: "Married" },
        "Deacon":         { gender: "Male",   marital_status: "Married" },
        "Trustee":        { gender: "Male",   marital_status: "Married" },
        "Deaconess":      { gender: "Female", marital_status: "Married" },
        "Pastor's Wife":  { gender: "Female", marital_status: "Married" },  
      };
      if (map[value]) updated = { ...updated, ...map[value] };
    }

    if (field === "country") updated = { ...updated, state: "" };

    setFormData(updated);
  };

  // Handle hall selection — store hall_name in formData, trigger floor fetch
  const handleHallChange = (hallName: string) => {
    setSelectedHallName(hallName);
    setFormData(prev => ({ ...prev, hall_name: hallName, floor_id: "" }));
  };

  // Handle floor selection — store floor_id (UUID) in formData
  const handleFloorChange = (floorId: string) => {
    setFormData(prev => ({ ...prev, floor_id: floorId }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("File size must be less than 5MB", "error"); return; }
    setProfilePicture(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const capturePhoto = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) { showToast("Failed to capture photo. Try again.", "error"); return; }
    fetch(screenshot)
      .then(r => r.blob())
      .then(blob => {
        const file = new File([blob], "captured-profile-photo.jpg", { type: "image/jpeg" });
        setProfilePicture(file);
        setPreviewUrl(URL.createObjectURL(file));
        setIsCameraOpen(false);
        showToast("Photo captured successfully!", "success");
      })
      .catch(() => showToast("Failed to process captured photo", "error"));
  }, []);

  const removePhoto = () => {
    setProfilePicture(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!formData.phone_number || formData.phone_number.length !== 11) {
      showToast("Please enter a valid 11-digit phone number", "error"); return;
    }
    const required: (keyof MinisterReg)[] = [
      "first_name","gender","age_range","marital_status","country","state","arrival_date",
    ];
    const missing = required.filter(f => !formData[f]);
    if (missing.length > 0) {
      showToast(`Please fill in: ${missing.join(", ")}`, "error"); return;
    }
    if (!profilePicture) {
      showToast("Please upload or capture a profile picture", "error"); return;
    }

    setProcessing(true);
    try {
      const fd = new FormData();

      let file = profilePicture;
      if (!file.name || file.name === "blob") {
        file = new File([file], "profile-picture.jpg", { type: file.type || "image/jpeg" });
      }
      fd.append("file", file);

      fd.append("phone_number",   formData.phone_number   || "");
      fd.append("first_name",     formData.first_name     || "");
      fd.append("gender",         formData.gender         || "");
      fd.append("age_range",      formData.age_range      || "");
      fd.append("marital_status", formData.marital_status || "");
      fd.append("country",        formData.country        || "");
      fd.append("state",          formData.state          || "");
      fd.append("arrival_date",   formData.arrival_date   || "");

      const optional: (keyof MinisterReg)[] = [
        "last_name","room_number","category","medical_issues",
        "local_assembly","local_assembly_address","hall_name","floor_id","bed_number",
      ];
      optional.forEach(f => { if (formData[f]) fd.append(f, formData[f] as string); });

      const res = await fetch(`${API_BASE}/ticketing/ministers/register`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const rawText = await res.text();
        let detail = `Server error: ${res.status}`;
        try { detail = JSON.parse(rawText).detail || detail; } catch {}
        throw new Error(detail);
      }

      const result = await res.json();
      showToast(
        `✅ ${result.first_name} ${result.last_name || ""} registered! Meal No: ${result.identification_meal_number}`,
        "success"
      );

      setFormData({ arrival_date: "2026-04-02", country: "Nigeria" });
      setProfilePicture(null);
      setPreviewUrl("");
      setSelectedHallName("");
      setFloors([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Registration error:", err);
      showToast(`❌ ${err.message || "Registration failed"}`, "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFormData({ arrival_date: "2026-04-02", country: "Nigeria" });
    setProfilePicture(null);
    setPreviewUrl("");
    setSelectedHallName("");
    setFloors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const inputCls = "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="bg-gradient-to-t from-green-50 via-white to-green-300 w-full mt-2 p-1 sm:p-3 rounded-lg shadow-md">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90vw] max-w-lg">
          <div className={`flex items-start gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white border-2 font-medium ${
            toast.type === "success" ? "bg-green-600 border-green-400" :
            toast.type === "error"   ? "bg-red-600 border-red-400" :
                                       "bg-green-800 border-green-600"
          }`}>
            <div className="shrink-0 mt-0.5">
              {toast.type === "success" ? <CheckCircle className="w-6 h-6" /> :
               toast.type === "error"   ? <XCircle     className="w-6 h-6" /> :
                                          <AlertCircle  className="w-6 h-6" />}
            </div>
            <span className="text-sm leading-relaxed break-words">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-3">
          <div className="relative bg-white rounded-xl overflow-hidden max-w-[25rem] w-full">
            <button onClick={() => setIsCameraOpen(false)}
              className="absolute top-2 right-4 z-10 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:bg-red-700">
              ×
            </button>
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user", width: 1280, height: 720 }} className="w-full" />
            <div className="p-2 bg-gray-100 flex justify-center">
              <button onClick={capturePhoto}
                className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-8 py-3 rounded-full text-lg flex items-center gap-2">
                <Camera className="w-5 h-5" /> Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="bg-white min-h-screen rounded-lg shadow-md p-2 lg:p-6">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-green-500">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-green-600" />
            Ministers Registration
          </h1>
          <p className="text-gray-600">Register ordained Ministers, Elders, Deacons and Trustees</p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-green-800 mb-1">Ministers Registration Info</h4>
              <p className="text-xs text-green-700">
                For ordained Ministers, Elders, Deacons and Trustees only. Fields marked <span className="text-red-500">*</span> are required.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-gray-50 rounded-lg p-6 space-y-6">

          {/* Phone */}
          <div>
            <label className={labelCls}>Phone Number <span className="text-red-500">*</span></label>
            <input type="tel" value={formData.phone_number || ""}
              onChange={e => handleFieldChange("phone_number", e.target.value)}
              placeholder="Enter 11-digit phone number" className={inputCls} />
          </div>

          {/* Profile Picture */}
          <div>
            <label className={labelCls}>Profile Picture <span className="text-red-500">*</span></label>
            <div className="flex justify-center mb-4">
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Preview"
                    className="w-48 h-48 object-cover rounded-full border-4 border-green-500 shadow-lg" />
                  <button onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="w-48 h-48 bg-gray-200 border-4 border-dashed border-gray-400 rounded-full flex items-center justify-center">
                  <p className="text-gray-500 text-center px-4 text-sm">No photo yet</p>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-4">
              <button type="button" onClick={() => setIsCameraOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg shadow-md">
                <Camera className="w-5 h-5" /> Take Photo
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md">
                <Upload className="w-5 h-5" /> Upload Photo
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          {/* First Name + Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>First Name <span className="text-red-500">*</span></label>
              <input type="text" value={formData.first_name || ""}
                onChange={e => handleFieldChange("first_name", e.target.value)}
                placeholder="Enter first name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Last Name</label>
              <input type="text" value={formData.last_name || ""}
                onChange={e => handleFieldChange("last_name", e.target.value)}
                placeholder="Enter last name" className={inputCls} />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>Category</label>
              <select value={formData.category || ""} onChange={e => handleFieldChange("category", e.target.value)}
                className={`${inputCls} cursor-pointer`}>
                <option value="">Select category</option>
                <option value="Minister">Pastor</option>
                <option value="Pastor's Wife">Pastor's Wife</option>  {/* 👈 unique value now */}
                <option value="Minister">Minister</option>
                <option value="Elder">Elder</option>
                <option value="Deacon">Deacon</option>
                <option value="Trustee">Trustee</option>
              </select>
          </div>

          {/* Gender + Marital Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Gender <span className="text-red-500">*</span></label>
              <select value={formData.gender || ""} onChange={e => handleFieldChange("gender", e.target.value)}
                className={`${inputCls} cursor-pointer`}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Marital Status <span className="text-red-500">*</span></label>
              <select value={formData.marital_status || ""} onChange={e => handleFieldChange("marital_status", e.target.value)}
                className={`${inputCls} cursor-pointer`}>
                <option value="">Select marital status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>

          {/* Age Range */}
          <div>
            <label className={labelCls}>Age Range <span className="text-red-500">*</span></label>
            <select value={formData.age_range || ""} onChange={e => handleFieldChange("age_range", e.target.value)}
              className={`${inputCls} cursor-pointer`}>
              <option value="">Select age range</option>
              {["18-25","26-35","36-45","46-55","56-65","66-70","71+"].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Country + State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Country <span className="text-red-500">*</span></label>
              <select value={formData.country || ""} onChange={e => handleFieldChange("country", e.target.value)}
                className={`${inputCls} cursor-pointer`}>
                <option value="">Select country</option>
                {countriesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>State <span className="text-red-500">*</span></label>
              <select value={formData.state || ""} onChange={e => handleFieldChange("state", e.target.value)}
                disabled={!formData.country}
                className={`${inputCls} cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed`}>
                <option value="">Select state</option>
                {formData.country && countryStates[formData.country]
                  ? countryStates[formData.country].map(s => <option key={s} value={s}>{s}</option>)
                  : formData.country
                  ? <option value={formData.country}>{formData.country}</option>
                  : null}
              </select>
            </div>
          </div>

          {/* Arrival Date */}
          <div>
            <label className={labelCls}>Arrival Date <span className="text-red-500">*</span></label>
            <input type="date" value={formData.arrival_date || ""}
              onChange={e => handleFieldChange("arrival_date", e.target.value)} className={inputCls} />
          </div>

          {/* ── Optional Fields ── */}
          <div className="pt-4 border-t-2 border-dashed border-gray-200">
            <div className="space-y-4">

              {/* Hall + Floor — API-driven */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Hall Name</label>
                  {hallsLoading ? (
                    <div className={`${inputCls} flex items-center gap-2 text-gray-400 bg-gray-100`}>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Loading halls...
                    </div>
                  ) : (
                    <select
                      value={selectedHallName}
                      onChange={e => handleHallChange(e.target.value)}
                      className={`${inputCls} cursor-pointer`}
                    >
                      <option value="">Select hall</option>
                      {halls.map(h => (
                        <option key={h.id} value={h.hall_name}>{h.hall_name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Floor</label>
                  {floorsLoading ? (
                    <div className={`${inputCls} flex items-center gap-2 text-gray-400 bg-gray-100`}>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Loading floors...
                    </div>
                  ) : (
                    <select
                      value={formData.floor_id || ""}
                      onChange={e => handleFloorChange(e.target.value)}
                      disabled={!selectedHallName || floors.length === 0}
                      className={`${inputCls} cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    >
                      <option value="">
                        {!selectedHallName ? "Select a hall first" : floors.length === 0 ? "No floors available" : "Select floor"}
                      </option>
                      {floors.map(f => (
                        <option key={f.floor_id} value={f.floor_id}>
                          Floor {f.floor_no} — {f.no_beds} beds ({f.status})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Room + Bed — manual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Room Number</label>
                  <input type="text" value={formData.room_number || ""}
                    onChange={e => handleFieldChange("room_number", e.target.value)}
                    placeholder="e.g. 101" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Bed Number</label>
                  <input type="text" value={formData.bed_number || ""}
                    onChange={e => handleFieldChange("bed_number", e.target.value)}
                    placeholder="e.g. 5A" className={inputCls} />
                </div>
              </div>

              {/* Local Assembly */}
              <div>
                <label className={labelCls}>Local Assembly</label>
                <input type="text" value={formData.local_assembly || ""}
                  onChange={e => handleFieldChange("local_assembly", e.target.value)}
                  placeholder="Enter local assembly" className={inputCls} />
              </div>

              {/* Local Assembly Address */}
              <div>
                <label className={labelCls}>Local Assembly Address</label>
                <textarea value={formData.local_assembly_address || ""}
                  onChange={e => handleFieldChange("local_assembly_address", e.target.value)}
                  rows={2} placeholder="Enter local assembly address" className={inputCls} />
              </div>

              {/* Medical Issues */}
              <div>
                <label className={labelCls}>Medical Issues</label>
                <textarea value={formData.medical_issues || ""}
                  onChange={e => handleFieldChange("medical_issues", e.target.value)}
                  rows={2} placeholder="e.g. blood pressure concerns etc." className={inputCls} />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button onClick={handleSubmit} disabled={processing}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 shadow-lg">
              {processing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Complete Registration
                </div>
              )}
            </button>
            <button onClick={handleReset} disabled={processing}
              className="px-6 py-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 flex items-center gap-2 disabled:opacity-50">
              <RefreshCw className="w-5 h-5" /> Reset Form
            </button>
          </div>

        </div>
      </section>
    </div>
  );
};

export default MinisterRegForm;