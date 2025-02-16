import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [data, setResponseData] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    

    try {
      await login(username, password);
      
      try {
        const response = await fetch("http://localhost:5000/create_Master", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), 
        });
  
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
  
        const data = await response.json();
        setResponseData(data); // Store response in state
      } catch (error) {
        console.error("Error fetching info:", error);
      }
  
      
      navigate("/home");
      
    } catch (err) {
      setError(err || "Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login </h2>
      {error && <p className="login-error" style={{ color: "red" }}>{error}</p>}
      <form className="form-group" onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            //required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            //required
          />
        </div>
        <button className="login-button" type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
