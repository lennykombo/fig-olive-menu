import React from 'react'
import { useState } from "react";
import { auth } from "../firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = ()=>  {

    const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin"); // redirect after login
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
     <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded-lg p-6 w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-3"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          required
        />

        <button
          type="submit"
          className="w-full text-white py-2 rounded hover:bg-gray-700"
          style={{ backgroundColor: "#3D441E" }}
        >
          Login
        </button>
      </form>
    </div>
  )
}

export default Login