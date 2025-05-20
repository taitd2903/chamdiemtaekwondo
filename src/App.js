import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import Vonhac from "./Vonhac";
import Tkvonhac from "./tkvonhac";
import ResetScoresButton from "./deleteall";
import Quyen from "./Quyentc";
import Congpha from "./Congpha";
import Tuve from "./Tuve";
import Tkquyen from "./Tkquyentc";
import Tktuve from "./tktuve";
import Tkcongpha from "./tkcongpha";
const App = () => {
  return (
    <>

      <h1 style={{ textAlign: "center", marginTop: "20px" }}>Chấm điểm</h1>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <strong>Nội dung:</strong>{" "}
        <Link to="/vonhac" style={{ margin: "0 10px" }}>Võ nhạc</Link>
        <Link to="/thongkevonhac" style={{ margin: "0 10px" }}>Thống kê võ nhạc</Link>
        <Link to="/quyentc" style={{ margin: "0 10px" }}>Quyền TC</Link>
        <Link to="/tkquyentc" style={{ margin: "0 10px" }}>Thống kê quyền TC</Link>
        
        <Link to="/tuve" style={{ margin: "0 10px" }}>Tự vệ</Link>
        <Link to="/tktuve" style={{ margin: "0 10px" }}>Thống kê tự vệ</Link>
        <Link to="/congpha" style={{ margin: "0 10px" }}>Công phá</Link>
                <Link to="/tkcongpha" style={{ margin: "0 10px" }}>Thống kê công phá</Link>
        <Link to="/xoadiem" style={{ margin: "0 10px", color: "red" }}>Xoá điểm</Link>
      </div>
      <Routes>
        <Route path="/" element={<Vonhac />} />
        <Route path="vonhac" element={<Vonhac />} />
        <Route path="thongkevonhac" element={<Tkvonhac />} />
        <Route path="quyentc" element={<Quyen />} />
        <Route path="congpha" element={<Congpha />} />
        <Route path="tuve" element={<Tuve />} />
        <Route path="tkquyentc" element={<Tkquyen />} />
        <Route path="xoadiem" element={<ResetScoresButton />} />
        <Route path="tkcongpha" element={<Tkcongpha />} />
        <Route path="tktuve" element={<Tktuve />} />
      </Routes></>
  );
};

export default App;
