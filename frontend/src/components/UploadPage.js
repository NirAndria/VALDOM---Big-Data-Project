import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UploadPage.css";

const UploadPage = () => {
  const [filePath1, setFilePath1] = useState("Choose a file");
  const [filePath2, setFilePath2] = useState("Choose a file");
  const [vm_count, setVmCount] = useState(1);
  const [count_err, setCountError] = useState("");
  // const navigate = useNavigate();
  const [error, setError] = useState("");
  const [uploadcolor, setUploadColor] = useState("");
  const [output, setOutput] = useState(1);
  const [response, setResponse] = useState("");


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
      e.preventDefault(); // prevent the page from refreshing 
      setError("");
      console.log('It is it')
      try {
        if (filePath1 === "Choose a file" || filePath2 === "Choose a file"){
          console.log('It is it')
          setError("You have to select file before uploading")
          setUploadColor("red")
        } else {

          try {
            // Send file path to backend
            const res1 = await fetch("http://localhost:5000/api/upload-file", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ local_file_path: filePath1 }), // Pass the file path here
            });

            const data1 = await res1.json();
            
            if (data1.success) {
              setResponse({ type: "success", message: data1.output });
            } else {
              setResponse({ type: "error", message: data1.error });
            }
           } catch (err) {
             setResponse({ type: "error", message: "Failed to connect to the server" });
           }
           try{
             const res2 = await fetch("http://localhost:5000/api/upload-file", {
               method: "POST",
               headers: {
                 "Content-Type": "application/json",
               },
               body: JSON.stringify({ local_file_path: filePath2 }), // Pass the file path here
             });

             const data2 = await res2.json();
            
             if (data2.success && data2.success) {
               setResponse({ type: "success", message: data2.output });
             } else {
               setResponse({ type: "error", message: data2.error });
             }

           } catch(err) {
             setResponse({ type: "error", message: "Failed to connect to the server" });

           }
            
         };

        // setError("Upload successfull")
        // setUploadColor("green")

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
              {filePath1}
            </label>
            <input type="file" id="fileInput1" className="file-input"  onChange={handleFileChange1}/>
            <br></br>
            <br></br>          
            <label htmlFor="fileInput2" className="custom-file-label">
              {filePath2}
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

