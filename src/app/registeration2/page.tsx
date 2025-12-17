"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

// --------------------------------------------
// Types
// --------------------------------------------
interface CountryData {
  value: string;
  label: string;
}

interface FieldType {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface FormFieldProps extends FieldType {
  value?: string | number;
  error?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

// --------------------------------------------
// Countries List
// --------------------------------------------
const countriesList: CountryData[] = [
  { value: "Nigeria", label: "Nigeria" },
  { value: "Ghana", label: "Ghana" },
  { value: "South Africa", label: "South Africa" },
  { value: "Kenya", label: "Kenya" },
  { value: "USA", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "India", label: "India" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "Italy", label: "Italy" },
  { value: "Spain", label: "Spain" },
  { value: "Brazil", label: "Brazil" },
  { value: "Mexico", label: "Mexico" },
  { value: "China", label: "China" },
  { value: "Japan", label: "Japan" },
  { value: "South Korea", label: "South Korea" },
  { value: "Singapore", label: "Singapore" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "Egypt", label: "Egypt" },
  { value: "Morocco", label: "Morocco" },
  { value: "Algeria", label: "Algeria" },
  { value: "Tunisia", label: "Tunisia" },
  { value: "Ethiopia", label: "Ethiopia" },
  { value: "Uganda", label: "Uganda" },
  { value: "Tanzania", label: "Tanzania" },
  { value: "Rwanda", label: "Rwanda" },
  { value: "Zambia", label: "Zambia" },
  { value: "Zimbabwe", label: "Zimbabwe" },
  { value: "Botswana", label: "Botswana" },
  { value: "Namibia", label: "Namibia" },
  { value: "Cameroon", label: "Cameroon" },
  { value: "Senegal", label: "Senegal" },
  { value: "Ivory Coast", label: "Ivory Coast" },
  { value: "Benin", label: "Benin" },
  { value: "Togo", label: "Togo" },
  { value: "Burkina Faso", label: "Burkina Faso" },
  { value: "Mali", label: "Mali" },
  { value: "Niger", label: "Niger" },
  { value: "Chad", label: "Chad" },
  { value: "Liberia", label: "Liberia" },
  { value: "Sierra Leone", label: "Sierra Leone" },
  { value: "Guinea", label: "Guinea" },
  { value: "Gambia", label: "Gambia" },
];

// --------------------------------------------
// Country & States
// --------------------------------------------
const countryStates: Record<string, string[]> = {
  Nigeria: [
    "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
    "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
    "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
    "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
    "Yobe","Zamfara"
  ],
  USA: ["California","Texas","New York","Florida","Illinois","Pennsylvania"],
  Canada: ["Ontario","Quebec","British Columbia","Alberta"],
  India: ["Delhi","Maharashtra","Karnataka","Tamil Nadu","Kerala"],
  Ghana: ["Greater Accra","Ashanti","Central","Eastern","Western","Northern","Volta"],
  UK: ["England","Scotland","Wales","Northern Ireland"],
  "South Africa": ["Gauteng","KwaZulu-Natal","Western Cape","Eastern Cape","Free State"],
};

// --------------------------------------------
// Reusable Form Input Component
// --------------------------------------------
const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = "text",
  options,
  required,
  placeholder,
  onChange,
  value,
  error,
}) => {
  return (
    <div className="flex flex-col gap-1 font-[lexend]">
      <label htmlFor={id} className="text-white font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {options ? (
        <select
          id={id}
          className="bg-white/90 rounded-md px-3 py-2"
          value={value || ""}
          onChange={onChange}
        >
          <option value="" disabled>
            -- Select {label.toLowerCase()} --
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className={`bg-white/90 rounded-md px-3 py-2 ${
            error ? "border-red-500" : "focus:ring-green-600"
          }`}
          value={value || ""}
          onChange={onChange}
        />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

// --------------------------------------------
// Main Component
// --------------------------------------------
function Register2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phone, setPhone] = useState("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [dateError, setDateError] = useState("");

  // Camera states
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://gcft-camp.onrender.com/api/v1";

  // Load phone from query param
  useEffect(() => {
    const phoneParam = searchParams.get("phone");

    if (!phoneParam) {
      toast.error("No phone number found. Please start registration again.");
      router.push("/register");
    } else {
      setPhone(phoneParam);
    }
  }, [searchParams, router]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/category`);
        if (!res.ok) throw new Error("Failed to load categories");
        const data = await res.json();
        const formatted = data.map((c: any) => ({
          value: c.category_name,
          label: c.category_name,
        }));
        setCategories(formatted);
      } catch {
        toast.error("Could not load categories");
      }
    };
    fetchCategories();
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Camera functions
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      toast.error('Camera access denied or not available');
      console.error('Error accessing camera:', err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
        closeCamera();
        toast.success('Photo captured successfully!');
      }
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

// Form change handler
const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { id, value } = e.target;

  // Auto-fill gender and marital status based on category selection
  if (id === "category") {
    let autoGender = "";
    let autoMaritalStatus = "";
    
    // Define category mappings
    const categoryMap: Record<string, { gender: string; marital: string }> = {
      "Young Brothers": { gender: "Male", marital: "Single" },
      "Married Brothers": { gender: "Male", marital: "Married" },
      "Teens below 18 (male)": { gender: "Male", marital: "Single" },
      "Young Sisters": { gender: "Female", marital: "Single" },
      "Married Sisters": { gender: "Female", marital: "Married" },
      "Teens below 18 (female)": { gender: "Female", marital: "Single" },
      "Nursing Mothers": { gender: "Female", marital: "Married" },
    };
    
    // Get auto-filled values based on category
    if (categoryMap[value]) {
      autoGender = categoryMap[value].gender;
      autoMaritalStatus = categoryMap[value].marital;
    }
    
    // Update category, gender, and marital_status
    setFormData({ 
      ...formData, 
      [id]: value, 
      gender: autoGender,
      marital_status: autoMaritalStatus 
    });
    return;
  }

  if (id === "arrival_date") {
    const selectedDate = new Date(value);
    const min = new Date("2026-03-01");
    const max = new Date("2026-04-30");

    if (selectedDate < min || selectedDate > max) {
      setDateError("❌ Please select a date between March and April 2026.");
      setFormData({ ...formData, arrival_date: "" });
      return;
    } else {
      setDateError("");
    }
  }

  setFormData({ ...formData, [id]: value });
};
  // Show/hide children fields based on marital status
  const showChildrenFields = formData.marital_status === "Married";

  // Required fields - matches backend schema
  const fields: FieldType[] = [
    { id: "category", label: "Category", required: true, options: categories },
    { id: "first_name", label: "Full Name", required: true },
    { 
      id: "age_range", 
      label: "Age Range", 
      required: true,
      options: [
        { value: "10-17", label: "10-17" },
        { value: "18-25", label: "18-25" },
        { value: "26-35", label: "26-35" },
        { value: "36-45", label: "36-45" },
        { value: "46-55", label: "46-55" },
        { value: "56-65", label: "56-65" },
        { value: "66-70", label: "66-70" },
        { value: "71+", label: "71+" },
      ],
    },
    {
      id: "marital_status",
      label: "Marital Status",
      required: true,
      options: [
        { value: "Single", label: "Single" },
        { value: "Married", label: "Married" },
        { value: "Widowed", label: "Widowed" },
        { value: "Divorced", label: "Divorced" }
      ],
    },
    { id: "country", label: "Country", required: true, options: countriesList },
    { id: "arrival_date", label: "Arrival Date", type: "date", required: true },
    { id: "medical_issues", label: "Disability / Allergy", placeholder: "Optional" },
    { id: "local_assembly", label: "Local Assembly", required: true },
    { id: "local_assembly_address", label: "Assembly Address", required: true },
  ];

  // Children fields (conditional)
  const childrenFields: FieldType[] = [
    { 
      id: "no_children", 
      label: "Number of Children", 
      type: "number",
      placeholder: "e.g., 2"
    },
    { 
      id: "names_children", 
      label: "Names of Children", 
      placeholder: "e.g., John, Mary"
    },
  ];

  // UNCOMMENT THIS LINE TO MAKE PHOTO REQUIRED
  // const isFormValid =
  //   fields.filter((f) => f.required).every((f) => formData[f.id]) && 
  //   formData.state && 
  //   capturedImage && // Photo is required
  //   !dateError;

  // COMMENT THIS LINE WHEN PHOTO IS REQUIRED
  const isFormValid =
    fields.filter((f) => f.required).every((f) => formData[f.id]) && 
    formData.state && 
    !dateError;

  // Submit handler with debug logging
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Please fill all required fields");
      return;
    }

    // UNCOMMENT THIS BLOCK WHEN PHOTO IS REQUIRED
    // if (!capturedImage) {
    //   toast.error("Please take your profile photo before submitting");
    //   return;
    // }

    setLoading(true);

    try {
      // Prepare data to match backend schema exactly
      const submitData = {
        category: formData.category,
        first_name: formData.first_name,
        age_range: formData.age_range,
        marital_status: formData.marital_status,
        no_children: formData.no_children ? parseInt(formData.no_children) : null,
        names_children: formData.names_children || null,
        country: formData.country,
        state: formData.state,
        arrival_date: formData.arrival_date,
        medical_issues: formData.medical_issues || null,
        local_assembly: formData.local_assembly,
        local_assembly_address: formData.local_assembly_address,
        photo: capturedImage || null, // Include the captured photo
      };

      console.log("Submitting data:", submitData);

      // =================================================================
      // TODO: REPLACE THIS WITH YOUR PHOTO UPLOAD API ENDPOINT
      // =================================================================
      // If your backend needs the photo uploaded separately:
      // 
      // let photoUrl = null;
      // if (capturedImage) {
      //   const photoFormData = new FormData();
      //   const blob = await fetch(capturedImage).then(r => r.blob());
      //   photoFormData.append('photo', blob, 'profile.png');
      //   
      //   const photoResponse = await fetch(`${BASE_URL}/upload-photo`, {
      //     method: 'POST',
      //     body: photoFormData,
      //   });
      //   
      //   if (photoResponse.ok) {
      //     const photoData = await photoResponse.json();
      //     photoUrl = photoData.url; // Get the uploaded photo URL
      //   }
      // }
      // 
      // Then include photoUrl in submitData instead of base64:
      // photo: photoUrl || null,
      // =================================================================

      // Register the full user details directly
      const res = await fetch(`${BASE_URL}/register-user/${encodeURIComponent(phone)}`, {
        method: "POST",
        body: JSON.stringify(submitData),
        headers: { "Content-Type": "application/json" },
      });

      const responseText = await res.text();
      
      // DEBUG LOGGING
      console.log("=== DEBUG INFO ===");
      console.log("Response status:", res.status);
      console.log("Response OK?:", res.ok);
      console.log("Response text:", responseText);
      console.log("Response text length:", responseText.length);
      console.log("==================");

      if (!res.ok) {
        let errorMessage = "Failed to register";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch {
          errorMessage = responseText || errorMessage;
        }
        
        toast.error(`Registration failed: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      // Check if response is empty
      if (!responseText || responseText.trim() === '') {
        console.warn("Empty response received but status was OK");
        toast.success("🎉 Registration successful!");
        router.push(`/successfulreg?phone=${encodeURIComponent(phone)}`);
        return;
      }

      // Try to parse response
      try {
        const userData = JSON.parse(responseText);
        console.log("Parsed user data:", userData);
        toast.success("🎉 Attendance booked successfully!");
        router.push(`/successfulreg?phone=${encodeURIComponent(phone)}`);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        console.error("Response that failed to parse:", responseText);
        // Still redirect even if parse fails, since registration was successful
        toast.success("🎉 Registration completed!");
        router.push(`/successfulreg?phone=${encodeURIComponent(phone)}`);
      }

    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------
  // UI (Using div instead of form)
  // --------------------------------------------
  return (
    <section
      className="w-full py-16 px-6 sm:px-10 lg:px-20 min-h-screen flex items-center justify-center bg-cover bg-center relative font-[lexend] bg-white dark:bg-white text-[#0E0E1D] dark:text-[#0E0E1D]"
      style={{ backgroundImage: `url('/images/campBg.jpg')` }}
    >
      <div className="absolute inset-0 bg-green-800/70"></div>

      <div className="relative w-full z-10 px-6 sm:px-10 lg:px-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Welcome To Easter Camp Meeting
          </h1>
          <p className="text-green-100 mt-2 text-lg sm:text-xl">
            Fill in your information to book a bed space
          </p>
        </div>

        <div className="p-8 sm:p-12 bg-white/30 backdrop-blur-md rounded-3xl shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((f) => (
              <FormField
                key={f.id}
                {...f}
                value={formData[f.id]}
                onChange={handleChange}
                error={f.id === "arrival_date" ? dateError : ""}
              />
            ))}

            {/* State */}
            {formData.country && (
              <div className="flex flex-col gap-1">
                <label className="text-white font-medium">
                  State / Province <span className="text-red-400">*</span>
                </label>

                {countryStates[formData.country] ? (
                  <select
                    id="state"
                    className="bg-white/90 rounded-md px-3 py-2"
                    value={formData.state || ""}
                    onChange={handleChange}
                  >
                    <option value="">-- Select State --</option>
                    {countryStates[formData.country].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="state"
                    className="bg-white/90 rounded-md px-3 py-2"
                    placeholder="Enter your state"
                    value={formData.state || ""}
                    onChange={handleChange}
                  />
                )}
              </div>
            )}

            {/* Children fields - only show if married */}
            {showChildrenFields && childrenFields.map((f) => (
              <FormField
                key={f.id}
                {...f}
                value={formData[f.id]}
                onChange={handleChange}
              />
            ))}

            {/* Camera Section - Professional Design */}
            <div className="col-span-full mt-5">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 sm:p-8 shadow-xl">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <span className="text-3xl">📸</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Profile Photo
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
                    Please take a clear, well-lit photo of yourself. Make sure your face is visible and centered in the frame. This helps us verify your identity during check-in.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      ✓ Face clearly visible
                    </span>
                    <span className="flex items-center gap-1">
                      ✓ Good lighting
                    </span>
                    <span className="flex items-center gap-1">
                      ✓ Neutral background
                    </span>
                  </div>
                </div>

                {!capturedImage && !isCameraOpen && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={openCamera}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 sm:py-6 px-4 sm:px-8 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-3 font-semibold"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Open Camera
                    </button>
                  </div>
                )}

                {isCameraOpen && (
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative w-full max-w-lg">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded-2xl shadow-2xl border-4 border-green-200"
                      />
                      <div className="absolute inset-0 rounded-2xl border-4 border-dashed border-white/50 pointer-events-none"></div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-semibold"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Capture Photo
                      </button>
                      <button
                        type="button"
                        onClick={closeCamera}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-semibold"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {capturedImage && (
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative w-full max-w-lg">
                      <img
                        src={capturedImage}
                        alt="Your Profile Photo"
                        className="w-full rounded-2xl shadow-2xl border-4 border-green-200"
                      />
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Photo Captured
                      </div>
                    </div>
                    <p className="text-green-700 font-medium text-center">
                      Great! Your photo looks good. You can retake it if needed.
                    </p>
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 font-semibold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Retake Photo
                    </button>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>

            {/* Submit */}
            <div className="col-span-full flex justify-center mt-10">
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
                className={`${isFormValid ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"} text-white py-3 px-6 rounded-lg shadow-md transition`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Booking...
                  </div>
                ) : (
                  "Book Attendance"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Register2() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center bg-green-800">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading registration form...</p>
        </div>
      </div>
    }>
      <Register2Content />
    </Suspense>
  );
}