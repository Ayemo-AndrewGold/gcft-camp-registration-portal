"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent, Suspense, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Webcam from "react-webcam";
import { count } from "console";

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
// Photo Capture Field Component
// --------------------------------------------
interface PhotoCaptureFieldProps {
  onPhotoSelect: (file: File | null) => void;
}

const PhotoCaptureField: React.FC<PhotoCaptureFieldProps> = ({ onPhotoSelect }) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capturePhoto = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) {
      fetch(screenshot)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "captured-photo.jpg", { type: "image/jpeg" });
          setPhotoPreview(screenshot);
          onPhotoSelect(file);
          setIsCameraOpen(false);
        });
    }
  }, [webcamRef, onPhotoSelect]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      onPhotoSelect(file);
    }
  };

  const openCamera = () => setIsCameraOpen(true);
  const openFilePicker = () => fileInputRef.current?.click();

  return (
    <div className="flex flex-col gap-3 font-[lexend] col-span-full">
      <label className="text-white font-medium">
        Passport Photo <span className="text-red-400">*</span>
      </label>

      {/* Preview */}
      <div className="flex justify-center">
        {photoPreview ? (
          <img
            src={photoPreview}
            alt="Passport preview"
            className="w-48 h-48 object-cover rounded-full border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-48 h-48 bg-gray-300 border-4 border-dashed border-white rounded-full flex items-center justify-center">
            <p className="text-gray-600 text-center px-4">No photo yet</p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-6 mt-4">
        <button
          type="button"
          onClick={openCamera}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition flex items-center gap-2"
        >
          📸 Take Photo
        </button>

        <button
          type="button"
          onClick={openFilePicker}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition flex items-center gap-2"
        >
          📁 Upload Photo
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl overflow-hidden max-w-lg w-full">
            <button
              onClick={() => setIsCameraOpen(false)}
              className="absolute top-4 right-4 z-10 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:bg-red-700"
            >
              ×
            </button>

            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              className="w-full aspect-video"
            />

            <div className="p-6 bg-gray-100 flex justify-center">
              <button
                onClick={capturePhoto}
                className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-full text-lg flex items-center gap-2"
              >
                📸 Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [formData, setFormData] = useState<Record<string, any>>({
    arrival_date: "2026-04-02"
  });
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [dateError, setDateError] = useState("");

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://gcft-camp.onrender.com/api/v1";

  useEffect(() => {
    const phoneParam = searchParams.get("phone");

    if (!phoneParam) {
      toast.error("No phone number found. Please start registration again.");
      router.push("/register");
    } else {
      setPhone(phoneParam);
    }
  }, [searchParams, router]);

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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;

    if (id === "category") {
      let autoGender = "";
      let autoMaritalStatus = "";
      let autoAgeRange = "";
      let autoCountry = "";
      
      const categoryMap: Record<string, { gender: string; marital: string; ageRange?: string; country?: string }> = {
        "Young Brothers": { gender: "Male", marital: "Single", ageRange: "18-25", country: "Nigeria" },
        "Married (male)": { gender: "Male", marital: "Married", ageRange: "26-35", country: "Nigeria" },
        "Teens Below 18 (male)": { gender: "Male", marital: "Single", ageRange: "10-17", country: "Nigeria" },
        "Young Sisters": { gender: "Female", marital: "Single", ageRange: "18-25", country: "Nigeria" },
        "Married (female)": { gender: "Female", marital: "Married", ageRange: "26-35", country: "Nigeria" },
        "Teens Below 18 (female)": { gender: "Female", marital: "Single", ageRange: "10-17", country: "Nigeria" },
        "Nursing Mothers": { gender: "Female", marital: "Married", country: "Nigeria", ageRange: "26-35" },
        "Elderly Sisters (56 & Above)": { gender: "Female", marital: "Married", ageRange: "56-65", country: "Nigeria" },
        "Elderly Brothers (56 & Above)": { gender: "Male", marital: "Married", ageRange: "56-65", country: "Nigeria" },
      };
      
      if (categoryMap[value]) {
        autoGender = categoryMap[value].gender;
        autoCountry = categoryMap[value].country || "";
        autoMaritalStatus = categoryMap[value].marital;
        autoAgeRange = categoryMap[value].ageRange || "";
      }
      
      setFormData({ 
        ...formData, 
        [id]: value, 
        gender: autoGender,
        marital_status: autoMaritalStatus,
        age_range: autoAgeRange,
        country: autoCountry
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

  // Hide children fields for "Married (male)" category, otherwise show only if Married
 const showChildrenFields = formData.category === "Nursing Mothers";

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
    { id: "medical_issues", label: "Medical Issues (Optional)", placeholder: "Blood pressure, diabetes, etc." },
    { id: "local_assembly", label: "Local Assembly", required: true },
    { id: "local_assembly_address", label: "Assembly Address", required: true },
  ];

  const childrenFields: FieldType[] = [
    { 
      id: "no_children", 
      label: "Number of Children (age 0-10)", 
      type: "number",
      placeholder: "e.g., 2"
    },
    { 
      id: "names_childre", 
      label: "Names of Children (age 0-10)", 
      placeholder: "e.g., John, Mary"
    },
  ];

  const isFormValid =
    fields.filter((f) => f.required).every((f) => formData[f.id]) && 
    formData.state && 
    passportPhoto && 
    !dateError;

  // FIXED: Backend requires the file to be sent as "file"
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isFormValid || !passportPhoto) {
      toast.error("Please fill all required fields and add a photo");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("category", formData.category);
      formDataToSend.append("first_name", formData.first_name);
      formDataToSend.append("age_range", formData.age_range);
      formDataToSend.append("marital_status", formData.marital_status);
      if (formData.no_children) formDataToSend.append("no_children", formData.no_children.toString());
      if (formData.names_children) formDataToSend.append("names_children", formData.names_children);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("arrival_date", formData.arrival_date);
      if (formData.medical_issues) formDataToSend.append("medical_issues", formData.medical_issues);
      formDataToSend.append("local_assembly", formData.local_assembly);
      formDataToSend.append("local_assembly_address", formData.local_assembly_address);

      // ← CRITICAL FIX: Backend expects the image file under the name "file"
      formDataToSend.append("file", passportPhoto);

      console.log("Submitting registration with photo:", passportPhoto.name);

      const res = await fetch(`${BASE_URL}/register-user/${encodeURIComponent(phone)}`, {
        method: "POST",
        body: formDataToSend,
      });

      const responseText = await res.text();

      console.log("=== RESPONSE DEBUG ===");
      console.log("Status:", res.status);
      console.log("OK:", res.ok);
      console.log("Body:", responseText);
      console.log("=====================");

      if (!res.ok) {
        let errorMessage = "Registration failed";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch {
          errorMessage = responseText || "Unknown error";
        }
        toast.error(`Error: ${errorMessage}`);
        return;
      }

      toast.success("🎉 Registration successful!");
      router.push(`/successfulreg?phone=${encodeURIComponent(phone)}`);

    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

            {showChildrenFields && childrenFields.map((f) => (
              <FormField
                key={f.id}
                {...f}
                value={formData[f.id]}
                onChange={handleChange}
              />
            ))}

            <PhotoCaptureField onPhotoSelect={setPassportPhoto} />

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