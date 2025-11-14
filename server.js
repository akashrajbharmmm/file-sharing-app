// ====== LAN File Transfer Server ======
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.static("public"));

// ====== Ensure uploads folder exists ======
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ====== Multer setup ======
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    // const timestamp = Date.now();
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    // cb(null, `${timestamp}_${cleanName}`);
    cb(null, cleanName);
  },
});
const upload = multer({ storage });

// ====== Routes ======

// Upload file
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  console.log(`📥 Received: ${req.file.originalname}`);
  res.json({ message: "✅ File uploaded successfully!" });
});

// List all files
app.get("/files", (_, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Error reading files" });
    res.json(files);
  });
});

// Download file
app.get("/download/:filename", (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });
  console.log(`⬇️ Downloading: ${req.params.filename}`);
  res.download(filePath);
});

// ====== Start Server ======
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Access from other devices on LAN: http://<your-ip>:${PORT}`);
});
