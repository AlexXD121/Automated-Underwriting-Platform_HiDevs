import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

function App() {
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [imageResult, setImageResult] = useState(null);
  const [fileResult, setFileResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setMessage("");
      setFileResult(null);
    } else {
      setFile(null);
      setMessage("Only PDF or DOCX files are allowed.");
    }
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    const allowedTypes = ["image/png", "image/jpeg"];
    if (selectedImage && allowedTypes.includes(selectedImage.type)) {
      setImage(selectedImage);
      setMessage("");
      setImageResult(null);
    } else {
      setImage(null);
      setMessage("Only PNG or JPG image files are allowed.");
    }
  };

  const handleUpload = async () => {
    if (!file && !image) {
      setMessage("Please select a document or image.");
      return;
    }

    const formData = new FormData();
    let fileType = null;

    if (file) {
      formData.append("file", file);
      fileType = file.type;
    } else if (image) {
      formData.append("file", image);
      fileType = image.type;
    }

    try {
      setIsLoading(true);
      setImageResult(null);
      setFileResult(null);
      setMessage("");

      const res = await axios.post("http://localhost:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Updated logic to route result to correct result box
      if (fileType?.includes("image")) {
        setImageResult(res.data);
      } else {
        setFileResult(res.data);
      }

      setMessage("Upload successful!");
    } catch (err) {
      setMessage("Upload failed.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResultBox = (title, result) => (
    <motion.div
      className="bg-white rounded-3xl shadow-2xl p-6 border-t-4 border-orange-500 hover:shadow-orange-300 hover:scale-[1.015] transition-all duration-300"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <h2 className="text-2xl font-extrabold text-orange-600 mb-4">{title}</h2>
      <div className="space-y-2 text-gray-700 text-[17px] leading-relaxed">
        <p><strong>Status:</strong> {result.status}</p>
        <p><strong>Risk Level:</strong> {result.risk}</p>
        <p><strong>Compliance:</strong> {result.compliance}</p>
        <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</p>
        <p className="mt-2"><strong>Summary:</strong> {result.summary}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white text-gray-800 flex flex-col items-center justify-center px-6 py-10">
      
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold text-orange-600 mb-3 tracking-tight drop-shadow-lg text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typewriter
          words={["AutoSure AI", "Multimodal Risk Engine", "Smarter Insurance"]}
          loop={true}
          cursor
          cursorStyle="|"
          typeSpeed={80}
          deleteSpeed={40}
          delaySpeed={1800}
        />
      </motion.h1>

      <motion.p
        className="text-center max-w-2xl text-lg text-gray-600 mb-10 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Revolutionizing insurance with smart multimodal AI. Upload property documents or images – our AI will analyze, assess risk, and provide insightful summaries.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full max-w-3xl">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-orange-200 transition-all"
        >
          <h3 className="text-lg font-semibold mb-2 text-orange-600">Upload Image (JPG/PNG)</h3>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/png, image/jpeg"
            className="w-full file:cursor-pointer border rounded-lg p-2"
          />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-orange-200 transition-all"
        >
          <h3 className="text-lg font-semibold mb-2 text-orange-600">Upload Document (PDF/DOCX)</h3>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.docx"
            className="w-full file:cursor-pointer border rounded-lg p-2"
          />
        </motion.div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleUpload}
        disabled={isLoading}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-12 rounded-full transition-all duration-300 shadow-xl disabled:opacity-50"
      >
        {isLoading ? "Analyzing..." : "Upload for Analysis"}
      </motion.button>

      {message && (
        <p className="mt-5 text-gray-700 font-semibold">{message}</p>
      )}

      <div className="mt-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {imageResult && renderResultBox("Image Analysis", imageResult)}
        </AnimatePresence>
        <AnimatePresence>
          {fileResult && renderResultBox("Document Analysis", fileResult)}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
