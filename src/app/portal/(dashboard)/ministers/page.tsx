"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, CheckCircle, XCircle, AlertCircle, UserPlus, RefreshCw, Camera } from "lucide-react";
import Webcam from "react-webcam";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";

interface MinisterReg {
  phone_number: string;
  first_name: string;
  last_name?: string;
  room_number?: string;
  category?: string;
  medical_issues?: string;
  local_assembly?: string;
  local_assembly_address?: string;
}

const MinisterReg: React.FC = () => {
  const [formData, setFormData] = useState<Partial<MinisterReg>>({});
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("File size must be less than 5MB", "error");
        return;
      }
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const capturePhoto = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) {
      showToast("Failed to capture photo. Please try again.", "error");
      return;
    }
    fetch(screenshot)
      .then((res) => res.blob())
      .then((blob) => {
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
    // Validate phone number
    if (!formData.phone_number || formData.phone_number.length !== 11) {
      showToast("Please enter a valid phone number (11 digits)", "error");
      return;
    }

    // Validate required fields
    if (!formData.first_name) {
      showToast("Please enter the first name", "error");
      return;
    }

    if (!profilePicture) {
      showToast("Please upload or capture a profile picture", "error");
      return;
    }

    setProcessing(true);

    try {
      const formDataToSend = new FormData();

      // Ensure file has a valid filename
      let fileToUpload = profilePicture;
      if (!fileToUpload.name || fileToUpload.name.trim() === "" || fileToUpload.name === "blob") {
        fileToUpload = new File([fileToUpload], "profile-picture.jpg", {
          type: fileToUpload.type || "image/jpeg",
        });
      }
      formDataToSend.append("file", fileToUpload);

      // Append all fields matching the API spec
      formDataToSend.append("phone_number", formData.phone_number || "");
      formDataToSend.append("first_name", formData.first_name || "");
      if (formData.last_name) formDataToSend.append("last_name", formData.last_name);
      if (formData.room_number) formDataToSend.append("room_number", formData.room_number);
      if (formData.category) formDataToSend.append("category", formData.category);
      if (formData.medical_issues) formDataToSend.append("medical_issues", formData.medical_issues);
      if (formData.local_assembly) formDataToSend.append("local_assembly", formData.local_assembly);
      if (formData.local_assembly_address) formDataToSend.append("local_assembly_address", formData.local_assembly_address);

      const response = await fetch(`${API_BASE}/ticketing/ministers/register`, {
        method: "POST",
        body: formDataToSend,
        // DO NOT set Content-Type — browser sets it with boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const result = await response.json();

      showToast(
        `✅ ${result.first_name} ${result.last_name || ""} registered successfully! Meal No: ${result.identification_meal_number}`,
        "success"
      );

      // Reset form
      setFormData({});
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
    setFormData({});
    setProfilePicture(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-linear-to-t font-[lexend] from-green-100 via-white to-green-200 w-full rounded-lg shadow-md">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-green-700 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : toast.type === "error" ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-3">
          <div className="relative bg-white rounded-xl overflow-hidden max-w-[25rem] w-full">
            <button
              onClick={() => setIsCameraOpen(false)}
              className="absolute top-2 right-4 z-10 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:bg-red-700"
            >
              ×
            </button>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user", width: 1280, height: 720 }}
              className="w-full"
            />
            <div className="p-2 bg-gray-100 flex justify-center">
              <button
                onClick={capturePhoto}
                className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-8 py-3 rounded-full text-lg flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Capture Photo
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
                This form is for ordained Ministers, Elders, Deacons and Trustees only. Fields marked with{" "}
                <span className="text-red-500">*</span> are required.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-gray-50 rounded-lg p-6 space-y-6">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone_number || ""}
              onChange={(e) => handleFieldChange("phone_number", e.target.value)}
              placeholder="Enter 11-digit phone number"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Profile Picture <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-center mb-4">
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="w-48 h-48 object-cover rounded-full border-4 border-green-500 shadow-lg"
                  />
                  <button
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                  >
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
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg shadow-md"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md"
              >
                <Upload className="w-5 h-5" />
                Upload Photo
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.first_name || ""}
              onChange={(e) => handleFieldChange("first_name", e.target.value)}
              placeholder="Enter first name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={formData.last_name || ""}
              onChange={(e) => handleFieldChange("last_name", e.target.value)}
              placeholder="Enter last name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={formData.category || ""}
              onChange={(e) => handleFieldChange("category", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Select category</option>
              <option value="Minister">Minister</option>
              <option value="Elder">Elder</option>
              <option value="Deacon">Deacon</option>
              <option value="Trustee">Trustee</option>
            </select>
          </div>

          {/* Room Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number</label>
            <input
              type="text"
              value={formData.room_number || ""}
              onChange={(e) => handleFieldChange("room_number", e.target.value)}
              placeholder="Enter room number "
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Local Assembly */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Local Assembly</label>
            <input
              type="text"
              value={formData.local_assembly || ""}
              onChange={(e) => handleFieldChange("local_assembly", e.target.value)}
              placeholder="Enter local assembly"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Local Assembly Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Local Assembly Address</label>
            <textarea
              value={formData.local_assembly_address || ""}
              onChange={(e) => handleFieldChange("local_assembly_address", e.target.value)}
              rows={2}
              placeholder="Enter local assembly address"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Medical Issues */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Medical Issues (Optional)</label>
            <textarea
              value={formData.medical_issues || ""}
              onChange={(e) => handleFieldChange("medical_issues", e.target.value)}
              rows={2}
              placeholder="Enter any medical issues e.g. blood pressure concerns etc."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handleSubmit}
              disabled={processing}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 shadow-lg"
            >
              {processing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Complete Registration
                </div>
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={processing}
              className="px-6 py-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Reset Form
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MinisterReg;