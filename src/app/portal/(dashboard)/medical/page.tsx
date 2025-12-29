"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, AlertCircle, CheckCircle, XCircle, RefreshCw, Printer, Download, Heart } from "lucide-react";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";

interface MedicalRecord {
  user_name: string;
  phone_number: string;
  medical_condition: string;
}

const Medical: React.FC = () => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchMedicalRecords = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(`${API_BASE}/analytics/users-medical-conditions`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Unexpected response format");

      setMedicalRecords(data);
      setFilteredRecords(data);
      showToast(`Loaded ${data.length} medical records`, 'success');
    } catch (err: any) {
      console.error("Error fetching medical records:", err.message);
      showToast("Failed to fetch medical records.", 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  useEffect(() => {
    const results = medicalRecords.filter((record) =>
      Object.values(record).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredRecords(results);
  }, [searchTerm, medicalRecords]);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Unable to open print window. Please check your browser settings.', 'error');
      return;
    }

    const styles = `
      <style>
        @media print {
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
          }
          th, td { 
            border: 1px solid #000; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background-color: #059669; 
            color: white; 
            font-weight: bold;
          }
          tr:nth-child(even) { 
            background-color: #f3f4f6; 
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #059669;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #059669;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #6b7280;
            margin: 5px 0;
          }
          .summary {
            margin: 20px 0;
            padding: 15px;
            background-color: #f0fdf4;
            border-left: 4px solid #059669;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #d1d5db;
            padding-top: 20px;
          }
        }
      </style>
    `;

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical Records Report</title>
          ${styles}
        </head>
        <body>
          <div class="header">
            <h1>GCFT Medical Records Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Camp Medical Management System</p>
          </div>
          
          <div class="summary">
            <strong>Summary:</strong> Total Records: ${filteredRecords.length}
            ${searchTerm ? ` | Filtered by: "${searchTerm}"` : ''}
          </div>

          ${printContent.innerHTML}

          <div class="footer">
            <p>This is a confidential medical report. Handle with care.</p>
            <p>© ${new Date().getFullYear()} GCFT Camp Management System</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    showToast('Print dialog opened', 'success');
  };

  const handleDownloadCSV = () => {
    if (filteredRecords.length === 0) {
      showToast('No records to download', 'error');
      return;
    }

    const headers = ['Name', 'Phone Number', 'Medical Condition'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => 
        `"${record.user_name}","${record.phone_number}","${record.medical_condition}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `medical_records_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV file downloaded successfully', 'success');
  };

  // Group records by medical condition for statistics (case-insensitive)
  const conditionStats = filteredRecords.reduce((acc, record) => {
    // Normalize: trim, convert to title case for consistency
    const condition = record.medical_condition
      .trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    acc[condition] = (acc[condition] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topConditions = Object.entries(conditionStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="bg-gradient-to-t from-green-100 via-white to-green-200 w-full mt-4 p-3 rounded-lg shadow-md">
        <section className="bg-white min-h-screen rounded-lg shadow-md p-5 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading medical records...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-t from-green-50 via-white to-green-300 w-full mt-2 p-1 sm:p-3 rounded-lg shadow-md">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
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
                <Heart className="w-8 h-8 text-red-500" />
                Medical Records
              </h1>
              <p className="text-gray-600">
                View and manage campers with medical conditions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchMedicalRecords(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-2xl font-bold text-green-600">{medicalRecords.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Displayed</p>
                <p className="text-2xl font-bold text-blue-600">{filteredRecords.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {topConditions.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {topConditions.map(([condition, count], idx) => (
              <div key={idx} className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
                <p className="text-xs text-gray-600 mb-1">Top Condition #{idx + 1}</p>
                <p className="text-sm font-semibold text-gray-800 truncate" title={condition}>
                  {condition}
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">{count}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1">Search Instructions</h4>
              <p className="text-xs text-blue-700">
                Search by name, phone number, or medical condition. Click print to generate a formatted report or download as CSV.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              disabled={filteredRecords.length === 0}
              className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-5 h-5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownloadCSV}
              disabled={filteredRecords.length === 0}
              className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border-2 border-gray-200 shadow-sm">
          <div ref={printRef}>
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <th className="p-4 text-left font-semibold">#</th>
                  <th className="p-4 text-left font-semibold">Name</th>
                  <th className="p-4 text-left font-semibold">Phone Number</th>
                  <th className="p-4 text-left font-semibold">Medical Condition</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, idx) => (
                    <tr 
                      key={`${record.phone_number}-${idx}`}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-green-50 transition-colors border-b border-gray-200`}
                    >
                      <td className="p-4 text-gray-600 font-medium">{idx + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-sm">
                              {record.user_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-800">{record.user_name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="text-sm">{record.phone_number}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          {record.medical_condition}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center p-8">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <AlertCircle className="w-16 h-16 mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No records found</p>
                        <p className="text-sm">
                          {searchTerm 
                            ? `No results for "${searchTerm}"`
                            : 'No medical records available at this time'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Records Summary */}
        {filteredRecords.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  Showing <strong>{filteredRecords.length}</strong> of <strong>{medicalRecords.length}</strong> total records
                </p>
                {searchTerm && (
                  <p className="text-xs text-gray-500 mt-1">
                    Filtered by: &quot;{searchTerm}&quot;
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Unique Conditions</p>
                  <p className="text-lg font-bold text-green-600">{Object.keys(conditionStats).length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Most Common</p>
                  <p className="text-lg font-bold text-red-600">
                    {topConditions[0]?.[0] || 'N/A'}
                  </p>
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