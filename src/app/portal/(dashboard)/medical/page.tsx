"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, AlertCircle, CheckCircle, XCircle, RefreshCw, Printer, Download, Heart } from "lucide-react";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";
const BATCH_SIZE = 50;

let _cachedMedical: MedicalRecord[] | null = null;
let _isFetchingMedical = false;

interface MedicalRecord {
  user_name: string;
  phone_number: string;
  medical_condition: string;
}

// ✅ Filter out invalid/empty/placeholder conditions
const isValidMedicalCondition = (condition: string): boolean => {
  if (!condition) return false;
  const c = condition.trim().toLowerCase();

  return (
    // Blood pressure variants
    c.includes("blood pressure") ||
    c.includes("hypertension") ||
    c.includes("high blood pressure") ||
    c.includes("low blood pressure") ||
    c === "hbp" ||
    c === "lbp" ||
    c === "bp" ||

    // Diabetes variants
    c.includes("diabet") ||
    c.includes("sugar") ||
    c === "dm" ||

    // Leg variants
    c.includes("leg") ||
    c.includes("knee") ||
    c.includes("waist") ||
    c.includes("back pain") ||
    c.includes("spine") ||
    c.includes("leg challenge")
  );
};

const normalizeCondition = (condition: string): string => {
  const c = condition.trim().toLowerCase();

  if (c.includes("blood pressure") || c.includes("high blood pressure") ||
      c.includes("low blood pressure") || c.includes("hypertension") ||
      c.includes("bp") || c === "hbp" || c === "lbp") {
    return "Blood Pressure";
  }
  if (c.includes("diabet") || c.includes("sugar") || c === "dm") {
    return "Diabetes";
  }
  if (c.includes("asthma") || c.includes("asma") || c.includes("inhaler")) {
    return "Asthma";
  }
  if (c.includes("ulcer") || c.includes("gastric") || c.includes("stomach")) {
    return "Ulcer / Stomach";
  }
  if (c.includes("sickle") || c.includes("scd") || c === "ss" || c === "sc") {
    return "Sickle Cell";
  }
  if (c.includes("heart") || c.includes("cardiac") || c.includes("cardio")) {
    return "Heart Condition";
  }
  if (c.includes("arthritis") || c.includes("joint") || c.includes("rheumat")) {
    return "Arthritis / Joint";
  }
  if (c.includes("leg") || c.includes("knee") || c.includes("waist") ||
      c.includes("back pain") || c.includes("spine")) {
    return "Leg / Mobility";
  }
  if (c.includes("eye") || c.includes("vision") || c.includes("blind") || c.includes("glaucom")) {
    return "Eye / Vision";
  }

  return condition.trim().split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

const Medical: React.FC = () => {
  const [medicalRecords, setMedicalRecords]   = useState<MedicalRecord[]>(_cachedMedical || []);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>(_cachedMedical || []);
  const [searchTerm, setSearchTerm]           = useState<string>("");
  const [currentPage, setCurrentPage]         = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage]   = useState<number>(10);
  const [loading, setLoading]                 = useState<boolean>(!_cachedMedical);
  const [refreshing, setRefreshing]           = useState<boolean>(false);
  const [fetchProgress, setFetchProgress]     = useState<string>("");
  const [loadingMore, setLoadingMore]         = useState(false);
  const [toast, setToast]                     = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isDarkMode, setIsDarkMode]           = useState(false);

  const printRef      = useRef<HTMLDivElement>(null);
  const searchTermRef = useRef(searchTerm);

  useEffect(() => { searchTermRef.current = searchTerm; }, [searchTerm]);

  // Dark mode listener
  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ isDarkMode: boolean }>;
      setIsDarkMode(customEvent.detail.isDarkMode);
    };
    window.addEventListener('themeToggle', handleThemeChange);
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') setIsDarkMode(true);
    }
    return () => window.removeEventListener('themeToggle', handleThemeChange);
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchMedicalRecords = async (showRefreshing = false) => {
    if (_cachedMedical && !showRefreshing) {
      setMedicalRecords(_cachedMedical);
      setFilteredRecords(_cachedMedical);
      setLoading(false);
      return;
    }
    if (showRefreshing) {
      setRefreshing(true);
      _cachedMedical = null;
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(
        `${API_BASE}/analytics/users-medical-conditions?skip=0&limit=${BATCH_SIZE}`,
        { headers: { "Cache-Control": "no-cache" } }
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const firstData: MedicalRecord[] = await res.json();

      // ✅ Filter out invalid/empty conditions from first batch
      const validFirst = firstData.filter(r => isValidMedicalCondition(r.medical_condition));

      _cachedMedical = validFirst;
      setMedicalRecords(validFirst);
      setFilteredRecords(validFirst);
      setCurrentPage(1);
      setLoading(false);
      setRefreshing(false);
      showToast(`Loaded ${validFirst.length} valid records`, "success");

      if (firstData.length < BATCH_SIZE) return;
      if (_isFetchingMedical) return;
      _isFetchingMedical = true;
      setLoadingMore(true);
      let skip = BATCH_SIZE;
      let all = [...validFirst];

      while (true) {
        setFetchProgress(`Loading more... ${all.length} records so far`);
        const r = await fetch(
          `${API_BASE}/analytics/users-medical-conditions?skip=${skip}&limit=${BATCH_SIZE}`,
          { headers: { "Cache-Control": "no-cache" } }
        );
        if (!r.ok) break;
        const batch: MedicalRecord[] = await r.json();
        if (!Array.isArray(batch) || batch.length === 0) break;

        // ✅ Filter each subsequent batch too
        const validBatch = batch.filter(r => isValidMedicalCondition(r.medical_condition));
        all = [...all, ...validBatch];

        _cachedMedical = all;
        setMedicalRecords(all);
        if (!searchTermRef.current) setFilteredRecords(all);
        if (batch.length < BATCH_SIZE) break;
        skip += BATCH_SIZE;
      }

      showToast(`All ${all.length} valid records loaded`, "success");
    } catch (err: any) {
      console.error("Error fetching medical records:", err.message);
      showToast("Failed to fetch medical records.", "error");
      setLoading(false);
      setRefreshing(false);
    } finally {
      _isFetchingMedical = false;
      setLoadingMore(false);
      setFetchProgress("");
    }
  };

  useEffect(() => { fetchMedicalRecords(); }, []);

  useEffect(() => {
    const results = medicalRecords.filter((record) =>
      Object.values(record).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredRecords(results);
    setCurrentPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const indexOfLast    = currentPage * entriesPerPage;
  const indexOfFirst   = indexOfLast - entriesPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirst, indexOfLast);
  const totalPages     = Math.ceil(filteredRecords.length / entriesPerPage);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) { showToast("Unable to open print window. Check your browser settings.", "error"); return; }
    const printHTML = `
      <!DOCTYPE html><html><head><title>Medical Records Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 12px; text-align: left; }
        th { background-color: #059669; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f3f4f6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #059669; padding-bottom: 20px; }
        .header h1 { color: #059669; margin: 0; font-size: 28px; }
        .header p { color: #6b7280; margin: 5px 0; }
        .summary { margin: 20px 0; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #059669; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #d1d5db; padding-top: 20px; }
      </style></head><body>
        <div class="header">
          <h1>GCFT Medical Records Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Camp Medical Management System</p>
        </div>
        <div class="summary">
          <strong>Summary:</strong> Total Records: ${filteredRecords.length}
          ${searchTerm ? ` | Filtered by: "${searchTerm}"` : ""}
        </div>
        ${printContent.innerHTML}
        <div class="footer">
          <p>This is a confidential medical report. Handle with care.</p>
          <p>© ${new Date().getFullYear()} GCFT Camp Management System</p>
        </div>
      </body></html>`;
    printWindow.document.write(printHTML);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
    showToast("Print dialog opened", "success");
  };

  const handleDownloadCSV = () => {
    if (filteredRecords.length === 0) { showToast("No records to download", "error"); return; }
    const headers = ["Name", "Phone Number", "Medical Condition"];
    const csvContent = [
      headers.join(","),
      ...filteredRecords.map(r => `"${r.user_name}","${r.phone_number}","${r.medical_condition}"`),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `medical_records_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV file downloaded successfully", "success");
  };

  const conditionStats = filteredRecords.reduce((acc, record) => {
      const condition = normalizeCondition(record.medical_condition);
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topConditions = Object.entries(conditionStats).sort(([, a], [, b]) => b - a).slice(0, 5);

  // ── Loading screen ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`w-full mt-4 p-3 rounded-lg shadow-md transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-t from-green-100 via-white to-green-200'
      }`}>
        <section className={`min-h-screen rounded-lg shadow-md p-5 flex items-center justify-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading medical records...
            </p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Filtering out invalid entries...
            </p>
            {fetchProgress && <p className="text-green-500 text-sm mt-2 font-medium">{fetchProgress}</p>}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`w-full mt-2 p-1 sm:p-3 rounded-lg shadow-md transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-t from-green-50 via-white to-green-300'
    }`}>

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

      <section className={`min-h-screen rounded-lg shadow-md p-2 lg:p-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>

        {/* Header */}
        <div className={`mb-8 pb-6 border-b-2 ${isDarkMode ? 'border-green-700' : 'border-green-500'}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className={`text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>
                <Heart className="w-8 h-8 text-red-500" />
                Medical Records
              </h1>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Campers with active medical conditions (excludes None / Nil entries)
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => fetchMedicalRecords(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? (fetchProgress || "Refreshing...") : "Refresh"}
              </button>
              <div className="text-right">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Records</p>
                <p className="text-2xl font-bold text-green-500">{medicalRecords.length}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Displayed</p>
                <p className="text-2xl font-bold text-green-600">{filteredRecords.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        {topConditions.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {topConditions.map(([condition, count], idx) => (
              <div key={idx} className={`p-4 rounded-lg border-2 transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
              }`}>
                <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Top Condition #{idx + 1}
                </p>
                <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                  title={condition}>{condition}</p>
                <p className="text-2xl font-bold text-green-500 mt-1">{count}</p>
              </div>
            ))}
          </div>
        )}

        {/* Info banner */}
        <div className={`mb-6 border-l-4 border-green-500 p-4 rounded ${
          isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-500 shrink-0 mt-1" />
            <div>
              <h4 className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                Search Instructions
              </h4>
              <p className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                Only campers with real medical conditions are shown. Entries like "None", "Nil", "No" etc. are automatically excluded.
                Search by name, phone number, or condition. Click Print or Download CSV to export.
              </p>
            </div>
          </div>
        </div>

        {/* Search + entries + actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search by name, phone, or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Show:</label>
              <select
                value={entriesPerPage}
                onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className={`border-2 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
            <button
              onClick={handlePrint}
              disabled={filteredRecords.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-5 h-5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownloadCSV}
              disabled={filteredRecords.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>

        {/* Results info */}
        <div className={`mb-4 text-sm flex items-center gap-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <span>
            Showing {filteredRecords.length === 0 ? 0 : indexOfFirst + 1} to{' '}
            {Math.min(indexOfLast, filteredRecords.length)} of {filteredRecords.length} records
          </span>
          {loadingMore && (
            <span className="flex items-center gap-2 text-green-500 font-medium">
              <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              {fetchProgress || "Loading more..."}
            </span>
          )}
        </div>

        {/* Table */}
        <div className={`overflow-x-auto rounded-lg border-2 shadow-sm ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          {/* Hidden full table for printing */}
          <div ref={printRef} className="hidden">
            <table className="w-full">
              <thead>
                <tr><th>#</th><th>Name</th><th>Phone Number</th><th>Medical Condition</th></tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, idx) => (
                  <tr key={`print-${idx}`}>
                    <td>{idx + 1}</td>
                    <td>{record.user_name}</td>
                    <td>{record.phone_number}</td>
                    <td>{record.medical_condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Visible paginated table */}
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-green-600 to-green-500 text-white">
                <th className="p-4 text-left font-semibold">#</th>
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Phone Number</th>
                <th className="p-4 text-left font-semibold">Medical Condition</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? (
                currentRecords.map((record, idx) => (
                  <tr
                    key={`${record.phone_number}-${idx}`}
                    className={`transition-colors border-b ${
                      isDarkMode
                        ? `${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'} hover:bg-gray-700 border-gray-700`
                        : `${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 border-gray-200`
                    }`}
                  >
                    <td className={`p-4 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {indexOfFirst + idx + 1}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isDarkMode ? 'bg-gray-700' : 'bg-green-100'
                        }`}>
                          <span className={`font-semibold text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            {record.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                          {record.user_name}
                        </span>
                      </div>
                    </td>
                    <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {record.phone_number}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        isDarkMode ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-800'
                      }`}>
                        {record.medical_condition}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-8">
                    <div className={`flex flex-col items-center justify-center ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      <AlertCircle className={`w-16 h-16 mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className="text-lg font-medium">No records found</p>
                      <p className="text-sm">
                        {searchTerm ? `No results for "${searchTerm}"` : "No valid medical records available"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Page <span className="font-semibold">{currentPage}</span> of{' '}
            <span className="font-semibold">{totalPages || 1}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 border-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Next
            </button>
          </div>
        </div>

        {/* Summary footer */}
        {filteredRecords.length > 0 && (
          <div className={`mt-6 rounded-lg p-4 border-2 transition-colors ${
            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Showing <strong>{filteredRecords.length}</strong> of{' '}
                  <strong>{medicalRecords.length}</strong> valid medical records
                </p>
                {searchTerm && (
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Filtered by: &quot;{searchTerm}&quot;
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Unique Conditions</p>
                  <p className="text-lg font-bold text-green-500">{Object.keys(conditionStats).length}</p>
                </div>
                <div className="text-center">
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Most Common</p>
                  <p className="text-lg font-bold text-red-500">{topConditions[0]?.[0] || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Medical;