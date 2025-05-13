import React from "react";
import { Routes, Route } from "react-router-dom";
import Chamdiem from "./Chamdiem";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Chamdiem />} />
    </Routes>
  );
};

export default App;
