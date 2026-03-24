"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload, X, CheckCircle, XCircle, AlertCircle,
  RefreshCw, Camera, MapPin,
} from "lucide-react";
import Webcam from "react-webcam";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";

interface AttendanceReg {
  category: string;
  first_name: string;
  age_range: string;
  marital_status: string;
  country: string;
  state: string;
  arrival_date: string;
  no_children?: number;
  names_children?: string;
  medical_issues?: string;
  local_assembly?: string;
  local_assembly_address?: string;
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

const AttendanceOnlyReg: React.FC = () => {
  const [phoneNumber, setPhoneNumber]   = useState("");
  const [formData, setFormData]         = useState<Partial<AttendanceReg>>({
    arrival_date: "2026-04-02",
    country: "Nigeria",
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]         = useState<string>("");
  const [categories, setCategories]         = useState<{ value: string; label: string }[]>([]);
  const [processing, setProcessing]         = useState(false);
  const [isCameraOpen, setIsCameraOpen]     = useState(false);
  const [toast, setToast]                   = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const webcamRef    = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 6000);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/category`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.map((c: any) => ({ value: c.category_name, label: c.category_name })));
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  // ── Auto-fill based on category ───────────────────────────────────────────
  const handleFieldChange = (field: string, value: string | number) => {
    let updated: Partial<AttendanceReg> = { ...formData, [field]: value };

    if (field === "category") {
      const categoryMap: Record<string, { marital_status: string; age_range: string }> = {
        "Young Brothers":               { marital_status: "Single",  age_range: "18-25" },
        "Married (male)":               { marital_status: "Married", age_range: "36-45" },
        "Teens Below 18 (male)":        { marital_status: "Single",  age_range: "10-17" },
        "Young Sisters":                { marital_status: "Single",  age_range: "18-25" },
        "Married (female)":             { marital_status: "Married", age_range: "36-45" },
        "Teens Below 18 (female)":      { marital_status: "Single",  age_range: "10-17" },
        "Nursing Mothers":              { marital_status: "Married", age_range: "26-35" },
        "Elderly Sisters (56 & Above)": { marital_status: "Married", age_range: "56-65" },
        "Elderly Brothers (56 & Above)":{ marital_status: "Married", age_range: "56-65" },
      };
      if (categoryMap[value as string]) {
        updated = { ...updated, ...categoryMap[value as string] };
      }
    }

    if (field === "country") updated = { ...updated, state: "" };

    setFormData(updated);
  };

  // ── Photo handlers ────────────────────────────────────────────────────────
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

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!phoneNumber || phoneNumber.length !== 11) {
      showToast("Please enter a valid 11-digit phone number", "error"); return;
    }
    const required: (keyof AttendanceReg)[] = [
      "first_name","category","age_range","marital_status","country","state","arrival_date",
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

      // Required fields
      fd.append("category",       formData.category       || "");
      fd.append("first_name",     formData.first_name     || "");
      fd.append("age_range",      formData.age_range      || "");
      fd.append("marital_status", formData.marital_status || "");
      fd.append("country",        formData.country        || "");
      fd.append("state",          formData.state          || "");
      fd.append("arrival_date",   formData.arrival_date   || "");

      // Optional fields
      if (formData.no_children)          fd.append("no_children",           String(formData.no_children));
      if (formData.names_children)       fd.append("names_children",        formData.names_children);
      if (formData.medical_issues)       fd.append("medical_issues",        formData.medical_issues);
      if (formData.local_assembly)       fd.append("local_assembly",        formData.local_assembly);
      if (formData.local_assembly_address) fd.append("local_assembly_address", formData.local_assembly_address);

      const res = await fetch(`${API_BASE}/register-attendance-only/${phoneNumber}`, {
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
        `✅ ${result.first_name} registered successfully! They are accounted for on the camp ground.`,
        "success"
      );

      // Reset
      setPhoneNumber("");
      setFormData({ arrival_date: "2026-04-02", country: "Nigeria" });
      setProfilePicture(null);
      setPreviewUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Registration error:", err);
      showToast(`❌ ${err.message || "Registration failed"}`, "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setPhoneNumber("");
    setFormData({ arrival_date: "2026-04-02", country: "Nigeria" });
    setProfilePicture(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const showChildrenFields = formData.category === "Nursing Mothers";
  const inputCls = "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="bg-gradient-to-t from-green-50 via-white to-green-300 w-full p-2 rounded-lg shadow-md">

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

      <section className="bg-white min-h-screen rounded-lg shadow-md p-2">

        {/* Header */}
        <div className="mb-3 pb-4 border-b-2 border-green-500">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-green-600" />
            Attendance Registration
          </h1>
          <p className="text-gray-600">For attendees with external accommodation (hotel / private)</p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-green-800 mb-1">Who is this for?</h4>
              <p className="text-xs text-green-700">
                Register attendees who will be present on the camp ground but are <strong>not sleeping on-site</strong>, those staying in hotels or private accommodation. This ensures everyone on the grounds is accounted for. Fields marked <span className="text-red-500">*</span> are required.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-gray-50 rounded-lg p-6 space-y-6">

          {/* Phone Number */}
          <div>
            <label className={labelCls}>Phone Number <span className="text-red-500">*</span></label>
            <input type="tel" value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
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

          {/* Full Name */}
          <div>
            <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={formData.first_name || ""}
              onChange={e => handleFieldChange("first_name", e.target.value)}
              placeholder="Enter full name" className={inputCls} />
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>Category <span className="text-red-500">*</span></label>
            <select value={formData.category || ""} onChange={e => handleFieldChange("category", e.target.value)}
              className={`${inputCls} cursor-pointer`}>
              <option value="">Select category</option>
              {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
            </select>
          </div>

          {/* Age Range */}
          <div>
            <label className={labelCls}>Age Range <span className="text-red-500">*</span></label>
            <select value={formData.age_range || ""} onChange={e => handleFieldChange("age_range", e.target.value)}
              className={`${inputCls} cursor-pointer`}>
              <option value="">Select age range</option>
              {["10-17","18-25","26-35","36-45","46-55","56-65","66-70","71+"].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Marital Status */}
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

          {/* Children fields — only for Nursing Mothers */}
          {showChildrenFields && (
            <>
              <div>
                <label className={labelCls}>Number of Children</label>
                <input type="number" min="1" value={formData.no_children || ""}
                  onChange={e => handleFieldChange("no_children", parseInt(e.target.value) || 0)}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Names of Children</label>
                <textarea value={formData.names_children || ""}
                  onChange={e => handleFieldChange("names_children", e.target.value)}
                  rows={3} className={inputCls} />
              </div>
            </>
          )}

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
            <label className={labelCls}>Medical Issues (Optional)</label>
            <textarea value={formData.medical_issues || ""}
              onChange={e => handleFieldChange("medical_issues", e.target.value)}
              rows={2} placeholder="e.g. blood pressure concerns etc." className={inputCls} />
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

export default AttendanceOnlyReg;