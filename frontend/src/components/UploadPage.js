import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "./UploadPage.css";

const UploadPage = () => {
  const [fileName1, setfileName1] = useState("Choose a file");
  const [fileName2, setfileName2] = useState("Choose a file");

  const [file1, setfile1] = useState(null);
  const [file2, setfile2] = useState(null);
  
  const [vm_count, setVmCount] = useState(1);
  const [count_err, setCountError] = useState("");
  // const navigate = useNavigate();
  const [error, setError] = useState("");
  const [uploadcolor, setUploadColor] = useState("");
  const [output, setOutput] = useState(1);
  const [response, setResponse] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);


  const handleFileChange1 = (event) => {
    const fileInput = document.getElementById("fileInput1");
    const file = fileInput.files[0];
    setfile1(file)
    setfileName1(file ? file.name : "");
    
  };

  const handleFileChange2 = (event) => { 
    const file = event.target.files[0];
    setfile2(file)
    setfileName2(file ? file.name : "");
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
      e.preventDefault(); // prevent the page from refreshing 
      setError("");

      const formData1 = new FormData();
      formData1.append("file", file1);

      try {
        if (fileName1 === "Choose a file" || fileName2 === "Choose a file"){
          console.log('It is it')
          setError("You have to select file before uploading")
          setUploadColor("red")
        } else {

          try {
            const res1 = await axios.post("http://localhost:8080/api/upload_file", formData1, {
              headers: {
                "Content-Type": "multipart/form-data",
                "Access-Control-Allow-Origin": "*", 
              },
            });
      
            alert("First file uploaded successfully!");
          } catch (error) {
            console.error("Error uploading file:", error);
            alert("File upload failed.");
          }
           
           try {

            const formData2 = new FormData();
            formData2.append("file", file2);

            const res2 = await axios.post("http://localhost:8080/api/upload_file", formData2, {
              headers: {
                "Content-Type": "multipart/form-data",
                "Access-Control-Allow-Origin": "*", 
              },
            });
      
            alert("Second file uploaded successfully!");
          } catch (error) {
            console.error("Error uploading file:", error);
            alert("File upload failed.");
          }
            
         };

        //  setError("Upload successfull")
        //  setUploadColor("green")

      } catch (error) {
        
        setError(error || "Invalid credentials");
      }
    };

  return (
    <div className="container_cstm">
        <div className="large-box">
          <h2>File Selector Page</h2>
          <div className="file-input-wrapper">
            <label htmlFor="fileInput1" className="custom-file-label">
              {fileName1}
            </label>
            <input type="file" id="fileInput1" className="file-input"  onChange={handleFileChange1}/>
            <br></br>
            <br></br>          
            <label htmlFor="fileInput2" className="custom-file-label">
              {fileName2}
            </label>
            <input type="file" id="fileInput2" className="file-input" onChange={handleFileChange2}/>
          </div>
          <br></br>   
          <div>
            <form onSubmit= {handleUpload}>
              <button className = "button" type="submit">Upload</button>
              {error && <p style={{ color: uploadcolor, marginTop: "10px" }}>{error}</p>}
            </form>
          </div>
        </div>
      <div className="right">
        <div className="stacked-boxes">
          <h3>VM Count</h3>
          <p>Current Count: {vm_count}</p>
          <button className = "button" onClick={() => modifyVmCount("+")}>Increase</button>
          <button className = "button" onClick={() => modifyVmCount("-")}>Decrease</button>
          {count_err && <p className="error-message" style={{ color: "red" }}>{count_err}</p>}
        </div>
        <div className="stacked-boxes">
          <h3>Output</h3>
          <form onSubmit= {handleUpload}>
            <button className = "button" type="submit">Run</button>
          </form>
          <p>Output: {output}</p>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;

