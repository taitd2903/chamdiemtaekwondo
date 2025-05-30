import React, { useEffect, useState } from "react";
import { Table, Typography, Spin } from "antd";
import * as XLSX from "xlsx";
import { Button } from "antd";
const { Text } = Typography;

const RankingByMember = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const handleExportExcel = () => {
    const exportData = [];

    Object.entries(groupedByTeam).forEach(([teamId, teamData]) => {
      exportData.push({
        "Tên": `🏆 ${teamData.teamName}`,
        "Đơn vị": "",
        "Rank": "",
      });

      teamData.members
        .sort((a, b) => b.totalScore - a.totalScore)
        .forEach((member, index) => {
          exportData.push({
            "Tên": member.memberName,
            "Đơn vị": member.unit,
            "Rank": index + 1,
          });
        });
      exportData.push({});
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "XepHangThanhVien");
    XLSX.writeFile(workbook, "XepHang_ThanhVien.xlsx");
  };
  useEffect(() => {
    fetch("https://quizzserver-3ylm.onrender.com/api/scores")
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

  // Lọc chỉ bảng trong khoảng teamId từ 201 đến 300
  const filteredScores = scores.filter(score => score.teamId >= 201 && score.teamId <= 300);

  // Tổng điểm từng thành viên
  const memberTotals = filteredScores.reduce((acc, curr) => {
    const key = `${curr.teamId}-${curr.memberId}`;
    if (!acc[key]) {
      acc[key] = {
        teamId: curr.teamId,
        teamName: curr.teamName,
        memberId: curr.memberId,
        memberName: curr.memberName,
        unit: curr.unit || "", 
        totalScore: 0,
      };
    }
    acc[key].totalScore += curr.score;
    return acc;
  }, {});

  // Nhóm theo teamId (tức là mỗi bảng riêng)
  const groupedByTeam = {};
  Object.values(memberTotals).forEach((item) => {
    if (!groupedByTeam[item.teamId]) {
      groupedByTeam[item.teamId] = {
        teamName: item.teamName,
        members: [],
      };
    }
    groupedByTeam[item.teamId].members.push(item);
  });

  const columns = [
    {
      title: "Xếp hạng",
      dataIndex: "rank",
      key: "rank",
      width: 80,
    },
    {
      title: "Thành viên",
      dataIndex: "memberName",
      key: "memberName",
      width: 180,
    },
      {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 120,
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
  <div
  className="ranking-container"
    style={{
      maxWidth: 800,
      margin: "110px auto 20px auto",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
      textAlign: "center",
      height: "60vh", 
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        position: "sticky",
        top: 0,
        backgroundColor: "#fff",
        zIndex: 10,
        paddingTop: "20px",
      }}
    >
      <h2 style={{ fontWeight: "bold", fontSize: "24px" }}>
        🏆 Bảng xếp hạng các đội tự vệ
      </h2>
      <Button
        type="primary"
        onClick={handleExportExcel}
      style={{ marginBottom: 20, margin: "0 auto", backgroundColor: "#083987", color: "white", maxWidth: "200px" }}
      >
        📤 Xuất Excel
      </Button>
    </div>
    <div
      style={{
        overflowY: "auto",
        padding: "0 20px",
        flexGrow: 1,
      }}
    >
      {Object.entries(groupedByTeam).map(([teamId, teamData]) => {
        const sortedMembers = teamData.members
          .sort((a, b) => b.totalScore - a.totalScore)
          .map((member, index) => ({
            key: `${teamId}-${member.memberId}`,
            rank: index + 1,
            memberName: member.memberName,
            unit: member.unit,
            totalScore: member.totalScore,
          }));

        return (
          <div key={teamId} style={{ marginBottom: 40 }}>
            <Text strong style={{ fontSize: 18 }}>
              🏆 {teamData.teamName}
            </Text>
            <Table
              columns={columns}
              dataSource={sortedMembers}
              pagination={false}
              bordered
              size="middle"
              style={{ marginTop: 10 }}
            />
          </div>
        );
      })}
    </div>
  </div>
);

};

export default RankingByMember;
