import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { MenuOutlined } from "@ant-design/icons";
import { Drawer, Button, Menu, Select } from "antd";
import Vonhac from "./Vonhac";
import Tkvonhac from "./tkvonhac";
import ResetScoresButton from "./deleteall";
import Quyen from "./Quyentc";
import Congpha from "./Congpha";
import Tuve from "./Tuve";
import Tkquyen from "./Tkquyentc";
import Tktuve from "./tktuve";
import Tkcongpha from "./tkcongpha";

const { Option } = Select;
const App = () => {
  const [giamdinh, setGiamdinh] = useState("1");
  const [drawerVisible, setDrawerVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/vonhac") {
      navigate(`/vonhac/${giamdinh}`);
    }
  }, []);
  const handleChangeGiamDinh = (value) => {
    setGiamdinh(value);

    const path = location.pathname;

    if (path.includes("thongke") || path.includes("tk") || path.includes("xoadiem")) {
      return;
    }

    const parts = path.split("/");
    const basePath = parts[1] || "vonhac";

    navigate(`/${basePath}/${value}`);
  };
  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);
  const menuItems = [
    { key: `/vonhac/${giamdinh}`, label: "Võ nhạc" },
    { key: "/thongkevonhac", label: "Thống kê võ nhạc" },
    { key: `/quyentc/${giamdinh}`, label: "Quyền TC" },
    { key: "/tkquyentc", label: "Thống kê quyền TC" },
    { key: `/tuve/${giamdinh}`, label: "Tự vệ" },
    { key: "/tktuve", label: "Thống kê tự vệ" },
    { key: `/congpha/${giamdinh}`, label: "Công phá" },
    { key: "/tkcongpha", label: "Thống kê công phá" },
    { key: "/xoadiem", label: "Xoá điểm", danger: true },
  ];

  const selectedKey = menuItems.find(({ key }) =>
    location.pathname.startsWith(key)
  )?.key || "";
  const onMenuClick = ({ key }) => {
    navigate(key);
    setDrawerVisible(false);
  };

  return (
    <>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 40px",
          borderBottom: "1px solid #ddd",
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          zIndex: 100,
        }}
      >
        <Button
          type="text"
          icon={<MenuOutlined style={{ fontSize: 24 }} />}
          onClick={showDrawer}
        />
        <h1 style={{ margin: 0, fontWeight: "bolder" }}>FUTURE WARRIOR TAEKWONDO FESTIVAL</h1>
        <Select
          value={giamdinh}
          onChange={handleChangeGiamDinh}
          style={{ width: 120 }}
        >
          <Option value="1">Giám định 1</Option>
          <Option value="2">Giám định 2</Option>
          <Option value="3">Giám định 3</Option>
        </Select>
      </header>

      <Drawer
        title="Chọn nội dung"
        placement="left"
        onClose={closeDrawer}
        visible={drawerVisible}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={onMenuClick}
          items={menuItems}
        />
      </Drawer>

      <main style={{ padding: 20 }}>
        <Routes>
          <Route path="vonhac/:giamdinh" element={<Vonhac />} />
          <Route path="quyentc/:giamdinh" element={<Quyen />} />
          <Route path="congpha/:giamdinh" element={<Congpha />} />
          <Route path="tuve/:giamdinh" element={<Tuve />} />

          <Route path="thongkevonhac" element={<Tkvonhac />} />
          <Route path="tkquyentc" element={<Tkquyen />} />
          <Route path="tkcongpha" element={<Tkcongpha />} />
          <Route path="tktuve" element={<Tktuve />} />
          <Route path="xoadiem" element={<ResetScoresButton />} />
        </Routes>
      </main>
    </>
  );
};

export default App;
