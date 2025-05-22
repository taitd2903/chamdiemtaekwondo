import React, { useEffect, useState } from "react";
import { Table, Typography, Spin } from "antd";

const { Text } = Typography;

const RankingByMember = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/scores")
      .then((res) => res.json())
      .then((data) => {
        setScores(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy điểm:", err);
        setLoading(false);
      });
  }, []);

  // Lọc điểm trong khoảng teamId 300–400
  const filteredScores = scores.filter(score => score.teamId >= 300 && score.teamId <= 400);

  // Gom nhóm và tính điểm theo tiêu chí
  const memberTotals = filteredScores.reduce((acc, curr) => {
    const key = `${curr.teamId}-${curr.memberId}`;

    if (!acc[key]) {
      acc[key] = {
        teamId: curr.teamId,
        teamName: curr.teamName,
        memberId: curr.memberId,
        memberName: curr.memberName,
        soVan: 0,
        kyThuat: 0,
      };
    }

    if (curr.criteria === "Số ván") {
      acc[key].soVan += curr.score;
    } else if (curr.criteria === "Kỹ Thuật") {
      acc[key].kyThuat += curr.score;
    }

    return acc;
  }, {});

  // Chuyển thành mảng và sắp xếp theo: Số ván ↓, rồi Kỹ Thuật ↓
  const dataSource = Object.values(memberTotals)
    .sort((a, b) => {
      if (b.soVan !== a.soVan) return b.soVan - a.soVan;
      return b.kyThuat - a.kyThuat;
    })
    .map((item, index) => ({
      key: `${item.teamId}-${item.memberId}`,
      rank: index + 1,
      teamName: item.teamName,
      memberName: item.memberName,
      soVan: item.soVan,
      kyThuat: item.kyThuat,
      totalScore: item.soVan + item.kyThuat,
    }));

  const columns = [
    {
      title: "Xếp hạng",
      dataIndex: "rank",
      key: "rank",
      width: 80,
    },
    {
      title: "Bảng",
      dataIndex: "teamName",
      key: "teamName",
      render: (text) => <Text strong>{text}</Text>,
      width: 150,
    },
    {
      title: "Đội",
      dataIndex: "memberName",
      key: "memberName",
      width: 180,
    },
    {
      title: "Số ván",
      dataIndex: "soVan",
      key: "soVan",
      width: 100,
    },
    {
      title: "Kỹ Thuật",
      dataIndex: "kyThuat",
      key: "kyThuat",
      width: 100,
    },
    {
      title: "Tổng điểm",
      dataIndex: "totalScore",
      key: "totalScore",
      width: 120,
    },
  ];

  if (loading) return <Spin tip="Đang tải dữ liệu điểm..." />;

  return (
    <div style={{ maxWidth: 800, margin: "20px auto" }}>
      <h2>Bảng xếp hạng công phá (ưu tiên Số ván)</h2>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        size="middle"
      />
    </div>
  );
};

export default RankingByMember;
