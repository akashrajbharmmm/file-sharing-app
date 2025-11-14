const receiverIpInput = document.getElementById("receiverIp");
const fileInput = document.getElementById("fileInput");
const sendBtn = document.getElementById("sendBtn");
const progressBar = document.getElementById("progressBar");
const statusText = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const myIp = document.getElementById("myIp");
const fileList = document.getElementById("fileList");

// Display device IP
myIp.textContent = window.location.hostname || "Unavailable";

// 📤 Send File
sendBtn.addEventListener("click", () => {
  const ip = receiverIpInput.value.trim();
  const file = fileInput.files[0];
  if (!ip) return alert("Enter receiver IP address");
  if (!file) return alert("Select a file");

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `http://${ip}:5000/upload`, true);

  const formData = new FormData();
  formData.append("file", file);

  progressBar.style.display = "block";
  progressBar.value = 0;
  statusText.textContent = "Uploading...";

  // Track upload progress
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      progressBar.value = percent;
      statusText.textContent = `Uploading: ${percent}%`;
    }
  };

  // Handle upload result
  xhr.onload = () => {
    progressBar.style.display = "none";
    statusText.textContent =
      xhr.status === 200 ? "✅ File Sent Successfully!" : "❌ Upload Failed!";
  };

  // Handle connection errors
  xhr.onerror = () => {
    progressBar.style.display = "none";
    statusText.textContent = "⚠ Connection Error!";
  };

  xhr.send(formData);
});

// 📥 Receive Files
startBtn.addEventListener("click", () => {
  startBtn.disabled = true;
  startBtn.textContent = "Receiving...";
  refreshFiles();
  setInterval(refreshFiles, 1000);
});

// 🔁 Refresh File List
async function refreshFiles() {
  try {
    const res = await fetch("/files");
    const files = await res.json();
    fileList.innerHTML = files
      .map(
        (file) =>
          `<li><span>${file}</span> <a href="/download/${file}" download>Download</a></li>`
      )
      .join("");
  } catch {
    console.error("Error fetching files");
  }
}
