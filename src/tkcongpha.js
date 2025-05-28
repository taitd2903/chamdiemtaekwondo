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
    // Thêm tiêu đề bảng
    exportData.push({
      STT: "",
      "Thành viên": `💥 Bảng ${teamData.teamName}`,
      "Đơn vị": "",
      "Số ván": "",
      "Kỹ thuật": "",
      "Tổng điểm": "",
    });

    // Thêm từng thành viên đã sắp xếp
    teamData.members
      .sort((a, b) => {
        if (b.soVan !== a.soVan) return b.soVan - a.soVan;
        return b.kyThuat - a.kyThuat;
      })
      .forEach((member, index) => {
        exportData.push({
          STT: index + 1,
          "Thành viên": member.memberName,
          "Đơn vị": member.unit,
          "Số ván": member.soVan,
          "Kỹ thuật": member.kyThuat,
          "Tổng điểm": member.soVan + member.kyThuat,
        });
      });

    // Dòng trống để phân cách giữa các bảng
    exportData.push({});
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "BangXepHang");
  XLSX.writeFile(workbook, "XepHang_CongPha.xlsx");
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

  const filteredScores = scores.filter(score => score.teamId >= 300 && score.teamId <= 400);

  // Gom điểm theo từng thành viên
  const memberTotals = filteredScores.reduce((acc, curr) => {
    const key = `${curr.teamId}-${curr.memberId}`;

    if (!acc[key]) {
      acc[key] = {
        teamId: curr.teamId,
        teamName: curr.teamName,
        memberId: curr.memberId,
        memberName: curr.memberName,
         unit: curr.unit || "", 
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

  // Nhóm theo bảng (teamId)
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
      <h2>Bảng xếp hạng Công phá (theo từng bảng)</h2>
<Button
  type="primary"
  onClick={handleExportExcel}
  style={{ marginBottom: 20 }}
>
  📤 Xuất Excel
</Button>
      {Object.entries(groupedByTeam).map(([teamId, teamData]) => {
        const sortedMembers = teamData.members
          .sort((a, b) => {
            if (b.soVan !== a.soVan) return b.soVan - a.soVan;
            return b.kyThuat - a.kyThuat;
          })
          .map((member, index) => ({
            key: `${teamId}-${member.memberId}`,
            rank: index + 1,
            memberName: member.memberName,
            soVan: member.soVan,
            kyThuat: member.kyThuat,
              unit: member.unit, 
            totalScore: member.soVan + member.kyThuat,
          }));

        return (
          <div key={teamId} style={{ marginBottom: 40 }}>
            <Text strong style={{ fontSize: 18 }}>
              💥 Bảng {teamData.teamName}
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
