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

  // Tính tổng điểm từng thành viên
  const memberTotals = scores.reduce((acc, curr) => {
    const key = `${curr.teamId}-${curr.memberId}`;

    if (!acc[key]) {
      acc[key] = {
        teamId: curr.teamId,
        teamName: curr.teamName,
        memberId: curr.memberId,
        memberName: curr.memberName,
        totalScore: 0,
      };
    }
    acc[key].totalScore += curr.score;
    return acc;
  }, {});

  // Chuyển thành mảng và sắp xếp điểm giảm dần
  const dataSource = Object.values(memberTotals).sort(
    (a, b) => b.totalScore - a.totalScore
  ).map((item, index) => ({
    key: `${item.teamId}-${item.memberId}`,
    rank: index + 1,
    teamName: item.teamName,
    memberName: item.memberName,
    totalScore: item.totalScore,
  }));

  const columns = [
    {
      title: "Xếp hạng",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      sorter: (a, b) => a.rank - b.rank,
    },
    {
      title: "Đội",
      dataIndex: "teamName",
      key: "teamName",
      render: (text) => <Text strong>{text}</Text>,
      width: 150,
    },
    {
      title: "Thành viên",
      dataIndex: "memberName",
      key: "memberName",
      width: 180,
    },
    {
      title: "Tổng điểm",
      dataIndex: "totalScore",
      key: "totalScore",
      sorter: (a, b) => a.totalScore - b.totalScore,
      width: 120,
    },
  ];

  if (loading) return <Spin tip="Đang tải dữ liệu điểm..." />;

  return (
    <div style={{ maxWidth: 600, margin: "20px auto" }}>
      <h2>Bảng xếp hạng thành viên theo tổng điểm</h2>
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
