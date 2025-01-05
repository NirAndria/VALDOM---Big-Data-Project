import React, { useState } from "react";

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
    <div>
      <h2>Admin Page</h2>
      <div style={{ marginTop: "20px" }}>
        <h3>VM Count</h3>
        <p>Current Count: {vm_count}</p>
        <button onClick={() => modifyVmCount("+")}>Increase</button>
        <button onClick={() => modifyVmCount("-")}>Decrease</button>
        {count_err && <p style={{ color: "red" }}>{count_err}</p>}
      </div>
    </div>
  );
};

export default AdminPage;

