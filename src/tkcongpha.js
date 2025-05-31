import React, { useEffect, useState } from "react";
import { Table, Typography, Spin } from "antd";
import * as XLSX from "xlsx";
import { Button } from "antd";
import './RankingByMember.css'; 
import io from "socket.io-client";
const { Text } = Typography;
const RankingByMember = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const handleExportExcel = () => {
    const exportData = [];
    Object.entries(groupedByTeam).forEach(([teamId, teamData]) => {
      exportData.push({
        "Thành viên": `💥 Bảng ${teamData.teamName}`,
        "Đơn vị": "",
        "Rank": "",
      });
      teamData.members
        .sort((a, b) => {
          if (b.soVan !== a.soVan) return b.soVan - a.soVan;
          return b.kyThuat - a.kyThuat;
        })
        .forEach((member, index) => {
          exportData.push({
            "Thành viên": member.memberName,
            "Đơn vị": member.unit,
            "Rank": index + 1,
          });
        });
      exportData.push({});
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BangXepHang");
    XLSX.writeFile(workbook, "XepHang_CongPha.xlsx");
  };

  useEffect(() => {
    const socket = io("https://quizzserver-3ylm.onrender.com");
    fetch("https://quizzserver-3ylm.onrender.com/api/scores")
      .then((res) => res.json())
      .then((data) => {
        setScores(data);
        setLoading(false);
      });
    socket.on("update_score", (data) => {
      setScores((prevScores) => {
        const updated = [...prevScores];
        const index = updated.findIndex(
          (entry) =>
            entry.teamId === data.teamId &&
            entry.memberId === data.memberId &&
            entry.judgeId === data.judgeId &&
            entry.criteria === data.criteria &&
            entry.unit === data.unit
        );

        if (index !== -1) {
          updated[index].score = data.score;
        } else {
          updated.push({
            teamId: data.teamId,
            teamName: data.teamName,
            memberId: data.memberId,
            memberName: data.memberName,
            unit: data.unit,
            judgeId: data.judgeId,
            score: data.score,
            criteria: data.criteria,
          });
        }

        return updated;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredScores = scores.filter(score => score.teamId >= 300 && score.teamId <= 400);
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
    width: 100,
    render: (text, record) => {
      let medal = null;
      let color = "#000"; // Mặc định

      if (record.rank === 1) {
        medal = "🥇";
        color = "#FFD700"; // Vàng
      } else if (record.rank === 2) {
        medal = "🥈";
        color = "#C0C0C0"; // Bạc
      } else if (record.rank === 3) {
        medal = "🥉";
        color = "#CD7F32"; // Đồng
      }
      else if (record.rank === 4) {
        medal = "🥉";
        color = "#CD7F32"; // Đồng
      }

      return (
        <span style={{ color, fontWeight: "bold" }}>
          {medal ? `${medal} ${record.rank}` : record.rank}
        </span>
      );
    },
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
  <div className="fullscreen-ranking">
    <div className="ranking-header">
      <h2 style={{ fontWeight: "bold", fontSize: "40px" }}>
        🏆 Bảng xếp hạng công phá
      </h2>
      <Button
        type="primary"
        onClick={handleExportExcel}
        style={{
          marginTop: 10,
          backgroundColor: "#083987",
          color: "white",
          maxWidth: "200px",
        }}
      >
        📤 Xuất Excel
      </Button>
    </div>
    <div className="ranking-content">
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
            <Text strong style={{ fontSize: 38, textAlign: "center" }}>
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
