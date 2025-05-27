const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());

const filePath = path.join(__dirname, "scores.json");

// Đọc dữ liệu từ file
const readScoresFromFile = () => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf8");
    return [];
  }
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch (err) {
    fs.writeFileSync(filePath, "[]", "utf8");
    return [];
  }
};

// Ghi dữ liệu vào file
const writeScoresToFile = (scores) => {
  fs.writeFileSync(filePath, JSON.stringify(scores, null, 2), "utf8");
};

let scores = readScoresFromFile();

// Gửi toàn bộ dữ liệu điểm
app.get("/api/scores", (req, res) => {
  res.json(scores);
});

// Xóa tất cả điểm
app.post("/api/reset-scores", (req, res) => {
  scores = [];
  writeScoresToFile(scores);
  res.json({ message: "Đã xóa toàn bộ điểm!" });
});

// Socket xử lý
io.on("connection", (socket) => {
  console.log("✅ Giám khảo kết nối");

  socket.on("score", (data) => {
    const { teamId, memberId, judgeId, score, criteria, teamName, memberName , unit } = data;

    // Kiểm tra dữ liệu hợp lệ
    if (
      typeof teamId !== "number" ||
      typeof memberId !== "number" ||
      typeof judgeId !== "number" ||
      typeof score !== "number" ||
      score < 0 ||
      // Mỗi tiêu chí tối đa là 20 điểm
      typeof teamName !== "string" ||
      typeof memberName !== "string" ||
     
      !criteria
    ) {
      return socket.emit("error", { message: "Dữ liệu không hợp lệ" });
    }

    // Tìm và cập nhật điểm
    const existingIndex = scores.findIndex(
      (entry) =>
        entry.teamId === teamId &&
        entry.memberId === memberId &&
        entry.judgeId === judgeId &&
        entry.criteria === criteria&&
         entry.unit === unit
    );

    if (existingIndex !== -1) {
      scores[existingIndex].score = score;
    } else {
      scores.push({ teamId, teamName, memberId, memberName, judgeId, score, criteria,unit  });
    }

    writeScoresToFile(scores);

    // Lấy điểm của thí sinh này từ tất cả giám khảo
    const thisMemberScores = scores.filter(
      (entry) => entry.teamId === teamId && entry.memberId === memberId
    );

    const totalScore = thisMemberScores.reduce(
      (sum, s) => sum + (typeof s.score === "number" ? s.score : 0),
      0
    );

    // Gửi cập nhật điểm đến tất cả client
    io.emit("update_score", {
      teamId,
      teamName,
      memberId,
      memberName,
      judgeId,
      unit,
      score,
      totalScore,
      judgesCount: thisMemberScores.length,
      criteria, // Cập nhật theo tiêu chí
    });

    console.log(
      `✅ ${teamName}- ${unit} - ${memberName} được Giám khảo ${judgeId} chấm ${score} điểm cho tiêu chí ${criteria}.`
    );
  });

  socket.on("disconnect", () => {
    console.log("❌ Giám khảo ngắt kết nối");
  });
});

// Trang root
app.get("/", (req, res) => {
  res.send("🧮 Scoring Server is Running!");
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🧮 Scoring Server chạy tại http://localhost:${PORT}`);
});
