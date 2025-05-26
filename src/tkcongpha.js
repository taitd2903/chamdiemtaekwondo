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
