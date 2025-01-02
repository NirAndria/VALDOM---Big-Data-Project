import React, { useState } from "react";

const UploadPage = () => {
  const [filePath1, setFilePath1] = useState("");
  const [filePath2, setFilePath2] = useState("");

  const handleFileChange1 = (event) => {
    const file = event.target.files[0];
    setFilePath1(file ? file.name : "");
  };

  const handleFileChange2 = (event) => {
    const file = event.target.files[0];
    setFilePath2(file ? file.name : "");
  };

  return (
    <div>
      <h2>File Selector Page</h2>
      <div>
        <label htmlFor="fileInput1">Select File 1:</label>
        <input
          type="file"
          id="fileInput1"
          onChange={handleFileChange1}
          style={{ marginLeft: "10px" }}
        />
        <textarea
          value={filePath1}
          readOnly
          style={{ display: "block", marginTop: "10px", width: "300px", height: "30px" }}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <label htmlFor="fileInput2">Select File 2:</label>
        <input
          type="file"
          id="fileInput2"
          onChange={handleFileChange2}
          style={{ marginLeft: "10px" }}
        />
        <textarea
          value={filePath2}
          readOnly
          style={{ display: "block", marginTop: "10px", width: "300px", height: "30px" }}
        />
      </div>
      <button type="upload">upload</button>
    </div>
  );
};

export default UploadPage;
