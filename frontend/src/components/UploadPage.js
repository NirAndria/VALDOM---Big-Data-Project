import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UploadPage = () => {
  const [filePath1, setFilePath1] = useState("");
  const [filePath2, setFilePath2] = useState("");
  const [vm_count, setVmCount] = useState(1);
  const [count_err, setCountError] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  


  const handleFileChange1 = (event) => {
    const file = event.target.files[0];
    setFilePath1(file ? file.name : "");
  };

  const handleFileChange2 = (event) => {
    const file = event.target.files[0];
    setFilePath2(file ? file.name : "");
  };

  const modifyVmCount = (op) => {
    setCountError("");
    if (op === '+') {
      setVmCount( vm_count + 1)
    } else {
      
      if (vm_count - 1>=1){

        setVmCount( vm_count - 1 );

      } else {
        setCountError("You cannot have less than 1 virtual machine");

      }
      
    }

  };

  const handleUpload = async (e) => {
      e.preventDefault();
      setError("");
      try {
        navigate("/admin"); // Redirect to upload page on success
      } catch (error) {
        setError(error || "Invalid credentials");
      }
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
      <div style={{ marginTop: "20px" }}>
        <h3>VM Count</h3>
        <p>Current Count: {vm_count}</p>
        <button onClick={() => modifyVmCount("+")}>Increase</button>
        <button onClick={() => modifyVmCount("-")}>Decrease</button>
        {count_err && <p style={{ color: "red" }}>{count_err}</p>}
      </div>
      <div>
        <form onSubmit={handleUpload}>
            <button type="submit">Upload</button>
        </form>
      </div>
      
    </div>
  );
};

export default UploadPage;

