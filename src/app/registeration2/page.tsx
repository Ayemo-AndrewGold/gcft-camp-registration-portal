"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import countryList, { CountryData } from "react-select-country-list";

// --------------------------------------------
// Types
// --------------------------------------------
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
export default function Register2() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phone, setPhone] = useState("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [dateError, setDateError] = useState("");

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

  // Load countries from library
  useEffect(() => {
    setCountries(countryList().getData());
  }, []);

  // Form change handler
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;

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
      id: "gender", 
      label: "Gender", 
      required: true,
      options: [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" }
      ]
    },
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
    { id: "country", label: "Country", required: true, options: countries },
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

  const isFormValid =
    fields.filter((f) => f.required).every((f) => formData[f.id]) && 
    formData.state && 
    !dateError;

  // Submit handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      // Prepare data to match backend schema exactly
      const submitData = {
        category: formData.category,
        first_name: formData.first_name,
        gender: formData.gender,
        age_range: formData.age_range, // FIXED: Use age_range instead of age
        marital_status: formData.marital_status,
        no_children: formData.no_children ? parseInt(formData.no_children) : null,
        names_children: formData.names_children || null,
        country: formData.country,
        state: formData.state,
        arrival_date: formData.arrival_date,
        medical_issues: formData.medical_issues || null,
        local_assembly: formData.local_assembly,
        local_assembly_address: formData.local_assembly_address,
      };

      console.log("Submitting data:", submitData);

      const res = await fetch(`${BASE_URL}/register-user/${phone}`, {
        method: "POST",
        body: JSON.stringify(submitData),
        headers: { "Content-Type": "application/json" },
      });

      const responseText = await res.text();
      console.log("Response status:", res.status);
      console.log("Response text:", responseText);

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

      const userData = JSON.parse(responseText);
      toast.success("🎉 Attendance booked successfully!");

      router.push(`/successfulreg?phone=${encodeURIComponent(phone)}`);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------
  // UI
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
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
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

            {/* Submit */}
            <div className="col-span-full flex justify-center mt-10">
              <button
                type="submit"
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
          </form>
        </div>
      </div>
    </section>
  );
}