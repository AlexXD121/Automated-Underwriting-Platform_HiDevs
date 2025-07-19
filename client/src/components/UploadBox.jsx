import React, { useState } from 'react';

const UploadBox = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setMessage('');
      onFileUpload && onFileUpload(selectedFile); // optional callback to parent
    } else {
      setFile(null);
      setFileName(null);
      setMessage('Only PDF or DOCX files are allowed.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 border-2 border-dashed border-orange-400 bg-white rounded-2xl shadow-lg">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Upload Document</h2>
        <p className="text-sm text-gray-600 mt-1">PDF or DOCX only</p>

        <label className="mt-6 block cursor-pointer bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition duration-300">
          Choose File
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {fileName && (
          <div className="mt-4 text-sm text-gray-700">
            Selected File: <strong>{fileName}</strong>
          </div>
        )}

        {message && (
          <div className="mt-2 text-red-500 text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadBox;
