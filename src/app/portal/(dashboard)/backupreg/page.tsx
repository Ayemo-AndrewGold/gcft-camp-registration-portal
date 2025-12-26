"use client";

import React, { useState, useEffect } from "react";
import { Upload, X, CheckCircle, XCircle, AlertCircle, UserPlus, RefreshCw } from "lucide-react";

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
  const [formData, setFormData] = useState<Partial<BackupRegistration>>({});
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

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
      let autoGender = "";
      let autoMaritalStatus = "";
      let autoAgeRange = "";

      const categoryMap: Record<string, { gender: string; marital: string; ageRange?: string }> = {
        "Young Brothers": { gender: "Male", marital: "Single", ageRange: "18-25" },
        "Married (male)": { gender: "Male", marital: "Married", ageRange: "26-55" },
        "Teens Below 18 (male)": { gender: "Male", marital: "Single", ageRange: "10-17" },
        "Young Sisters": { gender: "Female", marital: "Single", ageRange: "18-25" },
        "Married (female)": { gender: "Female", marital: "Married", ageRange: "26-55" },
        "Teens Below 18 (female)": { gender: "Female", marital: "Single", ageRange: "10-17" },
        "Nursing Mothers": { gender: "Female", marital: "Married", ageRange: "26-55" },
        "Elder Sisters (56 & Above)": { gender: "Female", marital: "Married", ageRange: "56+" },
        "Elder Brothers (56 & Above)": { gender: "Male", marital: "Married", ageRange: "56+" },
      };
      
      if (categoryMap[value as string]) {
        autoGender = categoryMap[value as string].gender;
        autoMaritalStatus = categoryMap[value as string].marital;
        autoAgeRange = categoryMap[value as string].ageRange || "";
      }
      
      updatedData = { 
        ...updatedData, 
        marital_status: autoMaritalStatus,
        age_range: autoAgeRange
      };
    }

    if (field === "country") {
      updatedData = {
        ...updatedData,
        state: ""
      };
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

  const showChildrenFields = formData.category === "Nursing Mothers";

  const handleSubmit = async () => {
    // Validate phone number
    if (!formData.phone_number || formData.phone_number.length < 10) {
      showToast("Please enter a valid phone number (minimum 10 digits)", 'error');
      return;
    }

    // Required fields validation
    const requiredFields = ['first_name', 'category', 'age_range', 'country', 'state', 'arrival_date'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof BackupRegistration]);
    
    if (missingFields.length > 0) {
      showToast(`Please fill in: ${missingFields.join(', ')}`, 'error');
      return;
    }

    if (!profilePicture) {
      showToast('Please upload a profile picture', 'error');
      return;
    }

    if (!formData.marital_status) {
      showToast('Please select marital status', 'error');
      return;
    }

    // Special validation for Nursing Mothers
    if (showChildrenFields) {
      if (!formData.no_children || formData.no_children <= 0) {
        showToast('Please enter number of children (must be greater than 0)', 'error');
        return;
      }
      if (!formData.names_children || formData.names_children.trim() === '') {
        showToast('Please enter names of children', 'error');
        return;
      }
    }

    setProcessing(true);
    try {
      const formDataToSend = new FormData();
      
      // Add file
      formDataToSend.append('file', profilePicture);
      
      // Add all required fields
      formDataToSend.append('category', formData.category || '');
      formDataToSend.append('first_name', formData.first_name || '');
      formDataToSend.append('age_range', formData.age_range || '');
      formDataToSend.append('marital_status', formData.marital_status || '');
      formDataToSend.append('country', formData.country || '');
      formDataToSend.append('state', formData.state || '');
      formDataToSend.append('arrival_date', formData.arrival_date || '');
      
      // Add optional fields
      if (formData.no_children) {
        formDataToSend.append('no_children', String(formData.no_children));
      }
      if (formData.names_children) {
        formDataToSend.append('names_children', formData.names_children);
      }
      if (formData.medical_issues) {
        formDataToSend.append('medical_issues', formData.medical_issues);
      }
      if (formData.local_assembly) {
        formDataToSend.append('local_assembly', formData.local_assembly);
      }
      if (formData.local_assembly_address) {
        formDataToSend.append('local_assembly_address', formData.local_assembly_address);
      }

      const response = await fetch(
        `${API_BASE}/register-user-backup/${formData.phone_number}`,
        {
          method: 'POST',
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        throw new Error(errorData.detail || `Registration failed with status ${response.status}`);
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
      
    } catch (err: any) {
      console.error('Registration error:', err);
      showToast(`❌ ${err.message}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFormData({});
    setProfilePicture(null);
    setPreviewUrl("");
  };

  return (
    <div className="bg-gradient-to-t from-green-50 via-white to-green-300 w-full mt-2 p-1 sm:p-3 rounded-lg shadow-md">
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

      <section className="bg-white min-h-screen rounded-lg shadow-md p-2 lg:p-6">
        <div className="mb-8 pb-6 border-b-2 border-green-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <UserPlus className="w-8 h-8 text-green-600" />
                Backup Registration
              </h1>
              <p className="text-gray-600">
                Register users without prior registration and allocate beds
              </p>
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
            <div className="flex items-center gap-4">
              {previewUrl && (
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300" />
                  <button
                    onClick={() => {
                      setProfilePicture(null);
                      setPreviewUrl("");
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-green-500 transition-all">
                <Upload className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Upload Photo (Max 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
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
              <option value="26-55">26-55</option>
              <option value="56+">56+</option>
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

          {/* Children Fields (for Nursing Mothers) */}
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
                  onChange={(e) => handleFieldChange('no_children', parseInt(e.target.value))}
                  placeholder="Enter number of children"
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
                  placeholder="Enter names of children (comma separated)"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* Country */}
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
              {countriesList.map((country) => (
                <option key={country.value} value={country.value}>{country.label}</option>
              ))}
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.state || ""}
              onChange={(e) => handleFieldChange('state', e.target.value)}
              disabled={!formData.country}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="">Select state</option>
              {formData.country && countryStates[formData.country]?.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Arrival Date */}
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

          {/* Local Assembly */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Local Assembly
            </label>
            <input
              type="text"
              value={formData.local_assembly || ""}
              onChange={(e) => handleFieldChange('local_assembly', e.target.value)}
              placeholder="Enter local assembly"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Local Assembly Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Local Assembly Address
            </label>
            <textarea
              value={formData.local_assembly_address || ""}
              onChange={(e) => handleFieldChange('local_assembly_address', e.target.value)}
              placeholder="Enter local assembly address"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Medical Issues (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Medical Issues (Optional)
            </label>
            <textarea
              value={formData.medical_issues || ""}
              onChange={(e) => handleFieldChange('medical_issues', e.target.value)}
              placeholder="Enter any medical issues or conditions"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handleSubmit}
              disabled={processing}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {processing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Registration...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Complete Registration</span>
                </div>
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={processing}
              className="px-6 py-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50 flex items-center gap-2"
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