import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import teamData from "./data/teams.json"; // Đường dẫn đúng đến file JSON

const socket = io("http://localhost:4000");

const Chamdiem = () => {
  const [scores, setScores] = useState({});

  // Đọc dữ liệu điểm từ localStorage hoặc từ server khi trang tải lại
  useEffect(() => {
    const savedScores = JSON.parse(localStorage.getItem("scores")) || {}; 
    setScores(savedScores);

    // Lắng nghe các cập nhật điểm từ server
    socket.on("update_score", (data) => {
      const { teamId, memberId, judgeId, criteria, score } = data;

      setScores((prev) => {
        const team = { ...prev[teamId] } || {};
        const member = { ...(team[memberId] || {}) };

        // Cập nhật điểm cho tiêu chí cụ thể của giám khảo
        if (!member[criteria]) {
          member[criteria] = {};
        }
        member[criteria][judgeId] = score;

        team[memberId] = member;
        const newScores = { ...prev, [teamId]: team };

        // Lưu điểm vào localStorage
        localStorage.setItem("scores", JSON.stringify(newScores));

        return newScores;
      });
    });

    return () => {
      socket.off("update_score");
    };
  }, []);

  const handleScoreChange = (teamId, memberId, judgeId, criteria, value) => {
    const score = parseInt(value, 10);
    if (isNaN(score) || score < 0 || score > 20) return; // Mỗi tiêu chí có điểm tối đa là 20

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

  const renderTeam = (team) => {
    const { teamId, teamName, members } = team;
    return (
      <div key={teamId} style={{ border: "1px solid black", margin: 10, padding: 10 }}>
        <h3>{teamName}</h3>
        {members.map((member) => (
          <div key={member.memberId}>
            <strong>{member.name}:</strong>
            {["Biểu diễn", "Tự vệ", "Công phá", "Trình bày", "Thành phần"].map((criteria) => (
              <div key={criteria}>
                <strong>{criteria}:</strong>
                {[1, 2, 3].map((judgeId) => (
                  <input
                    key={judgeId}
                    type="number"
                    min="0"
                    max="20" // Mỗi tiêu chí tối đa là 20
                    placeholder={`G${judgeId}`}
                    value={scores?.[teamId]?.[member.memberId]?.[criteria]?.[judgeId] || ""}
                    onChange={(e) =>
                      handleScoreChange(teamId, member.memberId, judgeId, criteria, e.target.value)
                    }
                    style={{ width: 60, margin: "0 5px" }}
                  />
                ))}
                <span style={{ marginLeft: 10 }}>
                  Tổng điểm {criteria}:{" "}
                  {Object.values(scores?.[teamId]?.[member.memberId]?.[criteria] || {}).reduce(
                    (sum, s) => sum + (parseInt(s) || 0),
                    0
                  )}
                </span>
              </div>
            ))}
            <span style={{ marginLeft: 10 }}>
              Điểm tổng:{" "}
              {["Biểu diễn", "Tự vệ", "Công phá", "Trình bày", "Thành phần"].reduce(
                (sum, criteria) => {
                  const totalCriteriaScore = Object.values(
                    scores?.[teamId]?.[member.memberId]?.[criteria] || {}
                  ).reduce((s, score) => s + (parseInt(score) || 0), 0);
                  return sum + totalCriteriaScore;
                },
                0
              )}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Hệ thống chấm điểm</h2>
      {teamData.map(renderTeam)}
    </div>
  );
};

export default Chamdiem;
