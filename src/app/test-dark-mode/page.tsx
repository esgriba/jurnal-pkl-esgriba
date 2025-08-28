"use client";

import { showSuccess, showError, showWarning, showInfo } from "@/lib/customAlert";

export default function TestDarkModePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Test Dark Mode Alerts
        </h1>
        
        <button
          onClick={() => showSuccess("Success!", "This is a success message")}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          Test Success Alert
        </button>
        
        <button
          onClick={() => showError("Error!", "This is an error message")}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Test Error Alert
        </button>
        
        <button
          onClick={() => showWarning("Warning!", "This is a warning message")}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded"
        >
          Test Warning Alert
        </button>
        
        <button
          onClick={() => showInfo("Info!", "This is an info message")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Test Info Alert
        </button>
        
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Try switching between light and dark mode on your device to test the alert colors.
          </p>
        </div>
      </div>
    </div>
  );
}
