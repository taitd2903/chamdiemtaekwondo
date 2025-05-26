import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Table, InputNumber, Typography } from "antd";
import teamData from "./data/teams.json";
import { useParams } from "react-router-dom";
const socket = io("http://localhost:4000");
const { Text } = Typography;

const maxScoresByCriteria = {
  "Biểu diễn": 20,
  "Tự vệ": 20,
  "Công phá": 30,
  "Trình bày": 20,
  "Thành phần": 10,
};

const Chamdiem = () => {
  const [scores, setScores] = useState({});
  const [selectedTeamId, setSelectedTeamId] = useState(null);
const { giamdinh } = useParams();
const currentJudgeId = parseInt(giamdinh, 10);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/scores");
        const data = await res.json();

        const structuredScores = {};

        data.forEach(({ teamId, memberId, criteria, judgeId, score }) => {
          if (!structuredScores[teamId]) structuredScores[teamId] = {};
          if (!structuredScores[teamId][memberId]) structuredScores[teamId][memberId] = {};
          if (!structuredScores[teamId][memberId][criteria]) structuredScores[teamId][memberId][criteria] = {};
          structuredScores[teamId][memberId][criteria][judgeId] = score;
        });

        setScores(structuredScores);
        localStorage.setItem("scores", JSON.stringify(structuredScores));
      } catch (err) {
        console.error("Lỗi khi tải điểm:", err);
      }
    };

    fetchScores();

    const savedScores = JSON.parse(localStorage.getItem("scores")) || {};
    if (Object.keys(savedScores).length > 0) {
      setScores(savedScores);
    }

    socket.on("update_score", (data) => {
      const { teamId, memberId, judgeId, criteria, score } = data;
      setScores((prev) => {
        const team = { ...prev[teamId] } || {};
        const member = { ...(team[memberId] || {}) };

        if (!member[criteria]) {
          member[criteria] = {};
        }
        member[criteria][judgeId] = score;

        team[memberId] = member;
        const newScores = { ...prev, [teamId]: team };

        localStorage.setItem("scores", JSON.stringify(newScores));
        return newScores;
      });
    });

    return () => {
      socket.off("update_score");
    };
  }, []);

  const handleScoreChange = (teamId, memberId, judgeId, criteria, value) => {
    if (value === null) return;
    const score = parseInt(value, 10);
    if (isNaN(score) || score < 0 || score > maxScoresByCriteria[criteria]) return;

    const team = teamData.find((t) => t.teamId === teamId);
    const member = team?.members.find((m) => m.memberId === memberId);
    if (!team || !member) return;

    socket.emit("score", {
      teamId,
      memberId,
      judgeId,
      criteria,
      score,
      teamName: team.teamName,
      memberName: member.name,
    });
  };

  const renderTeamScoring = (team) => {
    const { teamId, teamName, members } = team;
    const criteriaList = Object.keys(maxScoresByCriteria);

    const columns = [
      {
        title: "Tiêu chí / Đội",
        dataIndex: "criteria",
        key: "criteria",
        fixed: "left",
        width: 150,
        render: (text) => <Text strong>{text}</Text>,
      },
      ...members.map((member) => ({
        title: member.name,
        dataIndex: member.memberId,
        key: member.memberId,
        width: 260,
        render: (_, record) => {
          const criteria = record.criteria;
          return (
            <>
              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                {[1, 2, 3].map((judgeId) => (
        <InputNumber
  key={judgeId}
  min={0}
  max={maxScoresByCriteria[criteria]}
  placeholder={`G${judgeId}`}
  value={scores?.[teamId]?.[member.memberId]?.[criteria]?.[judgeId] ?? undefined}
  onChange={(value) =>
    judgeId === currentJudgeId &&
    handleScoreChange(teamId, member.memberId, judgeId, criteria, value)
  }
  style={{ width: 60 }}
  disabled={judgeId !== currentJudgeId}
/>

                ))}
              </div>
              <div style={{ marginTop: 6, textAlign: "center" }}>
                <Text strong>
                  Tổng:{" "}
                  {Object.values(scores?.[teamId]?.[member.memberId]?.[criteria] || {}).reduce(
                    (sum, s) => sum + (parseInt(s) || 0),
                    0
                  )}
                </Text>
              </div>
            </>
          );
        },
      })),
    ];

    const data = criteriaList.map((criteria, index) => ({
      key: index,
      criteria,
      ...members.reduce((acc, member) => {
        acc[member.memberId] = { criteria };
        return acc;
      }, {}),
    }));
    const footer = () => (
      <tr>
        <td style={{ fontWeight: "bold", textAlign: "center" }}>Tổng điểm </td>
        {members.map((member) => {
          const totalMemberScore = criteriaList.reduce((sum, criteria) => {
            const scoresByJudge = scores?.[teamId]?.[member.memberId]?.[criteria] || {};
            return (
              sum +
              Object.values(scoresByJudge).reduce((s, val) => s + (parseInt(val) || 0), 0)
            );
          }, 0);
          return (
            <td
              key={`total-${member.memberId}`}
              style={{ fontWeight: "bold", textAlign: "center" }}
            >
              {totalMemberScore}
            </td>
          );
        })}
      </tr>
    );

    return (
      <div style={{ marginTop: 20 }}>
        <h3>{teamName}</h3>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          bordered
          scroll={{ x: "max-content" }}
          summary={() => footer()}
          rowKey="criteria"
        />
      </div>
    );
  };

  const selectedTeam = teamData.find((t) => t.teamId === Number(selectedTeamId));

  return (
    <div style={{ padding: 20 }}>
      {/* <h2>Chấm điểm từng đội</h2> */}

      <label>
        Chọn bảng:&nbsp;
        <select
          value={selectedTeamId ?? ""}
          onChange={(e) => setSelectedTeamId(e.target.value !== "" ? Number(e.target.value) : null)}
          style={{ padding: 4, minWidth: 180 }}
        >
          <option value="">-- Chọn một bảng --</option>
          {teamData.map((team) => (
            <option key={team.teamId} value={team.teamId}>
              {team.teamName}
            </option>
          ))}
        </select>
      </label>

      {selectedTeam ? (
        renderTeamScoring(selectedTeam)
      ) : (
        <p style={{ marginTop: 20, fontStyle: "italic" }}>Vui lòng chọn Bảng để chấm điểm.</p>
      )}
    </div>
  );
};

export default Chamdiem;
