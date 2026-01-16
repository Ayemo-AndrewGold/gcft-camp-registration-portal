"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Upload, X, CheckCircle, XCircle, AlertCircle, UserPlus, RefreshCw, Camera } from "lucide-react";
import Webcam from "react-webcam";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";

interface BackupRegistration {
  phone_number: string;
  first_name: string;
  category: string;
  age_range: string;
  marital_status: string;
  no_children?: number;
  names_children?: string;
  country: string;
  state: string;
  arrival_date: string;
  medical_issues?: string;
  local_assembly?: string;
  local_assembly_address?: string;
}

const BackupReg: React.FC = () => {
  const [formData, setFormData] = useState<Partial<BackupRegistration>>({
  arrival_date: "2026-04-02"
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const countriesList = [
    { value: "Nigeria", label: "Nigeria" },
    { value: "Ghana", label: "Ghana" },
    { value: "USA", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "Canada", label: "Canada" },
  ];

  const countryStates: Record<string, string[]> = {
    Nigeria: [
      "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
      "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
      "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
      "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
      "Yobe","Zamfara"
    ],
    USA: ["California","Texas","New York","Florida"],
    Canada: ["Ontario","Quebec","British Columbia","Alberta"],
    Ghana: ["Greater Accra","Ashanti","Central","Eastern"],
    UK: ["England","Scotland","Wales","Northern Ireland"],
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/category`);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((c: any) => ({
          value: c.category_name,
          label: c.category_name,
        }));
        setCategories(formatted);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
      showToast("Failed to load categories", 'error');
    }
  };

  const handleFieldChange = (field: string, value: string | number) => {
    let updatedData = { ...formData, [field]: value };

    if (field === "category") {
      const categoryMap: Record<string, { gender: string; marital: string; ageRange?: string; country?: string }> = {
        "Young Brothers": { gender: "Male", marital: "Single", ageRange: "18-25", country: "Nigeria" },
        "Married (male)": { gender: "Male", marital: "Married", ageRange: "36-45", country: "Nigeria" },
        "Teens Below 18 (male)": { gender: "Male", marital: "Single", ageRange: "10-17", country: "Nigeria" },
        "Young Sisters": { gender: "Female", marital: "Single", ageRange: "18-25", country: "Nigeria" },
        "Married (female)": { gender: "Female", marital: "Married", ageRange: "36-45", country: "Nigeria" },
        "Teens Below 18 (female)": { gender: "Female", marital: "Single", ageRange: "10-17", country: "Nigeria" },
        "Nursing Mothers": { gender: "Female", marital: "Married", country: "Nigeria", ageRange: "26-35" },
        "Elderly Sisters (56 & Above)": { gender: "Female", marital: "Married", ageRange: "56-65", country: "Nigeria" },
        "Elderly Brothers (56 & Above)": { gender: "Male", marital: "Married", ageRange: "56-65", country: "Nigeria" },
      };
      
      if (categoryMap[value as string]) {
        const { marital, ageRange } = categoryMap[value as string];
        updatedData = { 
          ...updatedData, 
          marital_status: marital,
          age_range: ageRange || "",
          country: categoryMap[value as string].country || ""
        };
      }
    }

    if (field === "country") {
      updatedData = { ...updatedData, state: "" };
    }

    setFormData(updatedData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const capturePhoto = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) {
      showToast('Failed to capture photo. Please try again.', 'error');
      return;
    }

    fetch(screenshot)
      .then(res => res.blob())
      .then(blob => {
        // Critical: Give the file a proper name and type
        const file = new File([blob], "captured-profile-photo.jpg", { type: "image/jpeg" });
        setProfilePicture(file);
        setPreviewUrl(URL.createObjectURL(file));
        setIsCameraOpen(false);
        showToast('Photo captured successfully!', 'success');
      })
      .catch(err => {
        console.error('Error processing captured photo:', err);
        showToast('Failed to process captured photo', 'error');
      });
  }, []);

  const openCamera = () => setIsCameraOpen(true);
  const openFilePicker = () => fileInputRef.current?.click();

  const removePhoto = () => {
    setProfilePicture(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const showChildrenFields = formData.category === "Nursing Mothers";

  const handleSubmit = async () => {
    // Validations
    if (!formData.phone_number || formData.phone_number.length !== 11) {
      showToast("Please enter a valid phone number (11 digits)", 'error');
      return;
    }

    const requiredFields = ['first_name', 'category', 'age_range', 'country', 'state', 'arrival_date'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof BackupRegistration]);
    if (missingFields.length > 0) {
      showToast(`Please fill in: ${missingFields.join(', ')}`, 'error');
      return;
    }

    if (!profilePicture) {
      showToast('Please upload or capture a profile picture', 'error');
      return;
    }

    if (!formData.marital_status) {
      showToast('Please select marital status', 'error');
      return;
    }

    if (showChildrenFields) {
      if (!formData.no_children || formData.no_children <= 0) {
        showToast('Please enter number of children (must be greater than 0)', 'error');
        return;
      }
      if (!formData.names_children?.trim()) {
        showToast('Please enter names of children', 'error');
        return;
      }
    }

    setProcessing(true);

    try {
      const formDataToSend = new FormData();

      // === CRITICAL FIX: Ensure file has a valid filename ===
      let fileToUpload = profilePicture;
      if (!fileToUpload.name || fileToUpload.name.trim() === "" || fileToUpload.name === "blob") {
        fileToUpload = new File([fileToUpload], "profile-picture.jpg", {
          type: fileToUpload.type || "image/jpeg",
        });
      }
      formDataToSend.append('file', fileToUpload);

      // Append all other fields
      formDataToSend.append('category', formData.category || '');
      formDataToSend.append('first_name', formData.first_name || '');
      formDataToSend.append('age_range', formData.age_range || '');
      formDataToSend.append('marital_status', formData.marital_status || '');
      formDataToSend.append('country', formData.country || '');
      formDataToSend.append('state', formData.state || '');
      formDataToSend.append('arrival_date', formData.arrival_date || '');

      if (formData.no_children !== undefined) formDataToSend.append('no_children', String(formData.no_children));
      if (formData.names_children) formDataToSend.append('names_children', formData.names_children);
      if (formData.medical_issues) formDataToSend.append('medical_issues', formData.medical_issues);
      if (formData.local_assembly) formDataToSend.append('local_assembly', formData.local_assembly);
      if (formData.local_assembly_address) formDataToSend.append('local_assembly_address', formData.local_assembly_address);

      // Debug: Check what's being sent (remove in production)
      // console.log("Sending FormData:");
      // for (let [key, value] of formDataToSend.entries()) {
      //   console.log(key, value);
      //   if (value instanceof File) console.log("→ File:", value.name, value.size, value.type);
      // }

      const response = await fetch(
        `${API_BASE}/register-user-backup/${formData.phone_number}`,
        {
          method: 'POST',
          body: formDataToSend,
          // DO NOT set Content-Type header — browser sets it with boundary
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      showToast(
        `✅ ${result.first_name} registered successfully! Hall: ${result.hall_name}, Floor: ${result.floor}, Bed: ${result.bed_number}`,
        'success'
      );

      // Reset form
      setFormData({});
      setProfilePicture(null);
      setPreviewUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (err: any) {
      console.error('Registration error:', err);
      showToast(`❌ ${err.message || 'Registration failed'}`, 'error');
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
    <div className="bg-gradient-to-t from-green-50 via-white to-green-300 w-full mt-2 p-1 sm:p-3 rounded-lg shadow-md">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 
            toast.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
             toast.type === 'error' ? <XCircle className="w-5 h-5" /> :
             <AlertCircle className="w-5 h-5" />}
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

            <div>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user", width: 1280, height: 720 }}
                className="w-full"
              />
            </div>

            <div className="p-2 bg-gray-100 flex justify-center gap-4">
              <button
                onClick={capturePhoto}
                className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-8 py-3 rounded-full text-lg flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Capture Photo
              </button>
              {/* <button
                onClick={() => setIsCameraOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg"
              >
                Cancel
              </button> */}
            </div>
          </div>
        </div>
      )}

      <section className="bg-white min-h-screen rounded-lg shadow-md p-2 lg:p-6">
        <div className="mb-8 pb-6 border-b-2 border-green-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <UserPlus className="w-8 h-8 text-green-600" />
                Backup Registration
              </h1>
              <p className="text-gray-600">Register users without prior registration and allocate beds</p>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1">Backup Registration Info</h4>
              <p className="text-xs text-blue-700">
                This form allows you to register walk-in users who didn't pre-register. All fields marked with <span className="text-red-500">*</span> are required.
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
              onChange={(e) => handleFieldChange('phone_number', e.target.value)}
              placeholder="Enter phone number"
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
                onClick={openCamera}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </button>

              <button
                type="button"
                onClick={openFilePicker}
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

          {/* Rest of the form fields remain exactly the same */}
          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.first_name || ""}
              onChange={(e) => handleFieldChange('first_name', e.target.value)}
              placeholder="Enter first name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category || ""}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Age Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Age Range <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.age_range || ""}
              onChange={(e) => handleFieldChange('age_range', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Select age range</option>
              <option value="10-17">10-17</option>
              <option value="18-25">18-25</option>
              <option value="26-35">26-35</option>
              <option value="36-45">36-45</option>
              <option value="46-55">46-55</option>
              <option value="56-65">56-65</option>
              <option value="66-70">66-70</option>
              <option value="71+">71+</option>
            </select>
          </div>

          {/* Marital Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Marital Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.marital_status || ""}
              onChange={(e) => handleFieldChange('marital_status', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
              
            >
              <option value="">Select marital status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
          </div>

          {/* Children Fields */}
          {showChildrenFields && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Children <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.no_children || ""}
                  onChange={(e) => handleFieldChange('no_children', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Names of Children <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.names_children || ""}
                  onChange={(e) => handleFieldChange('names_children', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* Country, State, Arrival Date, etc. */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.country || ""}
              onChange={(e) => handleFieldChange('country', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Select country</option>
              {countriesList.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.state || ""}
              onChange={(e) => handleFieldChange('state', e.target.value)}
              disabled={!formData.country}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 cursor-pointer"
            >
              <option value="">Select state</option>
              {formData.country && countryStates[formData.country]?.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Arrival Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.arrival_date || ""}
              onChange={(e) => handleFieldChange('arrival_date', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Local Assembly</label>
            <input
              type="text"
              value={formData.local_assembly || ""}
              onChange={(e) => handleFieldChange('local_assembly', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Local Assembly Address</label>
            <textarea
              value={formData.local_assembly_address || ""}
              onChange={(e) => handleFieldChange('local_assembly_address', e.target.value)}
              rows={1}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Medical Issues (Optional)</label>
            <textarea
              value={formData.medical_issues || ""}
              onChange={(e) => handleFieldChange('medical_issues', e.target.value)}
              rows={1}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
               placeholder="Enter any medical issues; blood pressure concerns etc."
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

export default BackupReg;