import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import MapComponent from "./components/MapComponent";

function App() {
  const [data, setData] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/test")
      .then((response) => response.json())
      .then((data) => setData(data.message))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // return (
  //   <div>
  //     <h1>FastAPI + React</h1>
  //     <p>Message from FastAPI: {data}</p>
  //   </div>
  // );

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} /> {/* Default to login */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
