import React, { useState } from "react";
import "./AdminPage.css";

const AdminPage = () => {

  const [vm_count, setVmCount] = useState(1);
  const [error, setError] = useState("");
  const [count_err, setCountError] = useState("");
  

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

  return (
    <div className="container">
      <h2>Admin Page</h2>
      <div className="large-box">
        <h3>VM Count</h3>
        <p>Current Count: {vm_count}</p>
        <button className = "button" onClick={() => modifyVmCount("+")}>Increase</button>
        <br></br>
        <button className = "button" onClick={() => modifyVmCount("-")}>Decrease</button>
        {count_err && <p style={{ color: "red" }}>{count_err}</p>}
      </div>
    </div>
  );
};

export default AdminPage;

