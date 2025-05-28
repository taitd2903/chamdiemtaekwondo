import React, { useEffect, useState } from "react";
import { Table, Typography, Spin } from "antd";
import * as XLSX from "xlsx";
import { Button } from "antd";
const { Text } = Typography;

const RankingByMember = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const filteredScores = scores.filter(score => score.teamId >= 0 && score.teamId <= 100);
const handleExportExcel = () => {
  const exportData = [];

  Object.entries(groupedByTeam).forEach(([teamId, teamData]) => {
    // Thêm dòng tiêu đề team
    exportData.push({
      STT: "",
      "Thành viên": `🏆 ${teamData.teamName}`,
      "Đơn vị": "",
      "Tổng điểm": "",
    });

    // Thêm các thành viên
    teamData.members
      .sort((a, b) => b.totalScore - a.totalScore)
      .forEach((member, index) => {
        exportData.push({
          STT: index + 1,
          "Thành viên": member.memberName,
          "Đơn vị": member.unit,
          "Tổng điểm": member.totalScore,
        });
      });

    // Thêm dòng trắng sau mỗi team
    exportData.push({});
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "XepHangThanhVien");
  XLSX.writeFile(workbook, "XepHang_ThanhVien.xlsx");
};
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
      title: "Đội",
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
    <div style={{ maxWidth: 800, margin: "20px auto" }}>
      <h2>Bảng xếp hạng các đội theo từng bảng</h2>
<Button
  type="primary"
  onClick={handleExportExcel}
  style={{ marginBottom: 20 }}
>
  📤 Xuất Excel
</Button>
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
  );
};

export default RankingByMember;
