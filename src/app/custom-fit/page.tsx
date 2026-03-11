"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera, Upload, CheckCircle, Ruler } from "lucide-react";

export default function CustomFitPage() {
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e: any) => handleFileSelect(e);
    input.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("photo", selectedFile);

    try {
      const response = await fetch("/api/nail-measurement", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setResults(data);
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-12">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-black" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Upload Photo */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-4">Take a Photo of Your Hand</h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Place your hand flat on a surface with all 5 fingers spread apart. 
            Include a credit card or standard card for scale reference.
          </p>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-8 text-left">
            <h3 className="font-semibold mb-4">Photo Guidelines:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Place hand flat on a white or light surface</li>
              <li>✓ Spread all 5 fingers apart</li>
              <li>✓ Include a credit card next to your hand for scale</li>
              <li>✓ Take photo from directly above (top-down view)</li>
              <li>✓ Ensure good lighting with no shadows</li>
              <li>✓ Keep camera parallel to the surface</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleCapture} className="gap-2">
              <Camera className="h-5 w-5" />
              Take Photo
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("file-input")?.click()}
              className="gap-2"
            >
              <Upload className="h-5 w-5" />
              Upload Photo
            </Button>
          </div>

          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>
      )}

      {/* Step 2: Review & Upload */}
      {step === 2 && preview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Review Your Photo</h2>

          <div className="bg-gray-50 rounded-2xl p-8 mb-6">
            <img
              src={preview}
              alt="Hand preview"
              className="w-full max-w-2xl mx-auto rounded-lg"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setStep(1);
                setPreview("");
                setSelectedFile(null);
              }}
            >
              Retake
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="gap-2"
            >
              {uploading ? (
                "Analyzing..."
              ) : (
                <>
                  <Ruler className="h-4 w-4" />
                  Analyze & Get Measurements
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Results */}
      {step === 3 && results && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="text-3xl font-bold mb-2">Measurements Complete!</h2>
          <p className="text-gray-600 mb-8">
            Your custom nail profile has been saved
          </p>

          <div className="bg-white border rounded-2xl p-8 text-left mb-8">
            <h3 className="font-semibold mb-6">Your Nail Dimensions:</h3>

            <div className="grid gap-4">
              {results.measurements.map((nail: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">{nail.finger}</span>
                  <div className="text-sm text-gray-600">
                    <span className="mr-4">Width: {nail.width}mm</span>
                    <span>Length: {nail.length}mm</span>
                  </div>
                </div>
              ))}
            </div>

            {results.profile_id && (
              <p className="text-xs text-gray-400 mt-6">
                Profile ID: {results.profile_id}
              </p>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => window.location.href = "/shop"}>
              Shop Custom Sets
            </Button>
            <Button onClick={() => {
              setStep(1);
              setPreview("");
              setSelectedFile(null);
              setResults(null);
            }}>
              Measure Again
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}