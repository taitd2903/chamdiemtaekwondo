import React, { useState } from "react";
import { Button, message } from "antd";

const ResetScoresButton = ({ onReset }) => {
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    if (!window.confirm("Bạn có chắc muốn xóa hết tất cả điểm đã chấm không?")) return;

    setLoading(true);
    fetch("https://quizzserver-3ylm.onrender.com/api/reset-scores", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        message.success(data.message || "Đã xóa điểm thành công!");
        if (onReset) onReset(); 
      })
      .catch(() => {
        message.error("Lỗi khi xóa điểm!");
      })
      .finally(() => setLoading(false));
  };

  return (
    <Button danger loading={loading} onClick={handleReset}>
      🔄 Reset tất cả điểm
    </Button>
  );
};

export default ResetScoresButton;
