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
      <h2>Bảng xếp hạng thành viên theo từng bảng (teamId 201–300)</h2>

      {Object.entries(groupedByTeam).map(([teamId, teamData]) => {
        const sortedMembers = teamData.members
          .sort((a, b) => b.totalScore - a.totalScore)
          .map((member, index) => ({
            key: `${teamId}-${member.memberId}`,
            rank: index + 1,
            memberName: member.memberName,
            totalScore: member.totalScore,
          }));

        return (
          <div key={teamId} style={{ marginBottom: 40 }}>
            <Text strong style={{ fontSize: 18 }}>
              🏆 Bảng {teamData.teamName}
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
