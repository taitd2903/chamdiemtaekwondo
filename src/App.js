import React from "react";
import { Routes, Route } from "react-router-dom";
import Vonhac from "./Vonhac";
import Tkvonhac from "./tkvonhac";
import ResetScoresButton from "./deleteall";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Vonhac />} />
       <Route path="thongke" element={<Tkvonhac />} />
      <Route path="xoadiem" element={<ResetScoresButton />} />
    </Routes>
  );
};

export default App;
