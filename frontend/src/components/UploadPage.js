import React, { useEffect, useState } from "react";
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
  const [response_VM_add_rm, setResponse_VM_add_rm] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [instanceId, setInstanceId] = useState(null);
  const [WorkersId, setWorkersId] = useState(null);
  const [MasterIp, setMasterIp] = useState(null);

  useEffect(() => {
    const fetchMasterIp = async () => {
      try {
        const response = await fetch("http://localhost:5000/get_info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
  
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
  
        const data = await response.json();
        console.log("Full API response:", data); // Debugging
  
        if (data && data.length > 0) {
          console.log("Setting MasterIp:", data[0].public_ip);
          setMasterIp(data[0].public_ip);
        } else {
          console.warn("No instances found in API response.");
        }
      } catch (error) {
        console.error("Error fetching MasterIp:", error);
      }
    };
  
    fetchMasterIp();
  }, []);
  


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

  const getMaster = async () => {
    setCountError("");
  
    try {
      // Fetch worker instances and get the first one
      const response = await fetch("http://localhost:5000/get_info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const data = await response.json();
      console.log("Received instances:", data);
  
      if (data && data.length > 0) {
        const firstInstance = data[0];
        // Set the instanceId here
        setInstanceId(firstInstance.instance_id);
      } else {
        console.log("No instances found.");
        return; // Stop execution if no instances found
      }
  
    } catch (error) {
      console.error("Error fetching worker instances:", error);
      return; // Stop execution if fetch fails
    }
  };
  
  useEffect(() => {
    if (instanceId) {
      // Once instanceId is set, proceed with the next request
      const createWorkerInstance = async () => {
        // if (op === '+') {
      try {
        const response_VM_add_rm = await fetch('http://localhost:5000/create_worker_instances', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            instance_count: 1,
            master_instance_id: instanceId
          })
        });

        if (!response_VM_add_rm.ok) {
          throw new Error("Failed to create worker instance");
        }

        const data = await response_VM_add_rm.json();
        console.log('Success:', data);
      } catch (error) {
        console.error('Error:', error);
      }
  
      setVmCount(vm_count + 1);
        // } else {
        //   if (vm_count - 1 >= 1) {
        //     setVmCount(vm_count - 1);
        //   } else {
        //     setCountError("You cannot have less than 1 virtual machine");
        //   }
        // }
      };
  
      createWorkerInstance(); // Call function when instanceId is updated
    }
  }, [instanceId]);

  const handleIncreaseVmCount = async () => {
    await getMaster();  // Ensure the instanceId is set before proceeding
};

const getWorkers = async () => {
  setCountError("");

  try {
    // Fetch worker instances and get the first one
    const response = await fetch("http://localhost:5000/get_info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Received instances:", data);

    if (data && data.length > 0) {
      const WorkersInstance = data.slice(1).map(instance => instance.instance_id);;
      // Set the instanceId here
      setWorkersId(WorkersInstance);
    } else {
      console.log("No instances found.");
      return; // Stop execution if no instances found
    }

  } catch (error) {
    console.error("Error fetching worker instances:", error);
    return; // Stop execution if fetch fails
  }
};

useEffect(() => {
  if (WorkersId) {
    // Once instanceId is set, proceed with the next request
    const deleteWorkerInstance = async () => {
      // if (op === '+') {
    try {
      const response_VM_add_rm = await fetch('http://localhost:5000/delete_instance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instance_id: WorkersId[0]
        })
      });

      if (!response_VM_add_rm.ok) {
        throw new Error("Failed to create worker instance");
      }

      const data = await response_VM_add_rm.json();
      console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
    }

    if (vm_count - 1 >= 1) {
      setVmCount(vm_count - 1);
    } else {
      setCountError("You cannot have less than 1 virtual machine");
    }
    };

    deleteWorkerInstance(); // Call function when instanceId is updated
  }
}, [WorkersId]);

// const getMaster_upload = async () => {
//   setCountError("");

//   try {
    
//     // Fetch worker instances and get the first one
//     const response = await fetch("http://localhost:5000/get_info", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({})
//     });

//     console.log("it made it here")

//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }

    
//     const data = await response.json();
//     console.log("Received instances:", data);

//     if (data && data.length > 0) {
//       const firstInstance = data[0];
//       // Set the instanceId here
//       setMasterIp(setInstanceId(firstInstance.public_ip));
//     } else {
//       console.log("No instances found.");
//       return; // Stop execution if no instances found
//     }

//   } catch (error) {
//     console.error("Error fetching worker instances:", error);
//     return; // Stop execution if fetch fails
//   }
// };

const handleUpload = async (e) => {
  console.log('it made it here')
  e.preventDefault(); // prevent the page from refreshing 
  setError("");

  const formData1 = new FormData();
  formData1.append("file", file1);
  formData1.append("master_ip", MasterIp);
  

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
        formData2.append("master_ip", MasterIp);

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

// useEffect(() => {
//   if (MasterIp) {
//     // Once instanceId is set, proceed with the next request

//     handleUpload(); // Call function when instanceId is updated
//   }
// }, [MasterIp]);

  

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
          <button className = "button" onClick={getMaster}>Increase</button>
          <button className = "button" onClick={getWorkers}>Decrease</button>
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

