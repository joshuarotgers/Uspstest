let token = null;
let userRole = null;
const serverURL = "http://localhost:4000";  // Update for production deployment

window.onload = () => {
  document.getElementById("loginBtn").onclick = login;
  document.getElementById("uploadBtn").onclick = uploadFile;
  document.getElementById("listFilesBtn").onclick = listFiles;
  document.getElementById("logoutBtn").onclick = logout;
  document.getElementById("logoutBtn2").onclick = logout;
};

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${serverURL}/login`, {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  });

  if (res.status !== 200) {
    document.getElementById("loginError").innerText = "Invalid credentials";
    return;
  }

  const data = await res.json();
  token = data.token;
  const payload = JSON.parse(atob(token.split('.')[1]));
  userRole = payload.role;

  document.getElementById("loginView").style.display = "none";

  if (userRole === "carrier") {
    document.getElementById("carrierView").style.display = "block";
  }

  if (userRole === "supervisor") {
    document.getElementById("supervisorView").style.display = "block";
  }
}

async function uploadFile() {
  const file = document.getElementById("uploadInput").files[0];
  const formData = new FormData();
  formData.append("lotFile", file);

  const res = await fetch(`${serverURL}/upload`, {
    method: "POST",
    headers: { 'Authorization': token },
    body: formData
  });

  if (res.status === 200) {
    alert("Upload complete.");
  } else {
    alert("Upload failed.");
  }
}

async function listFiles() {
  const res = await fetch(`${serverURL}/files`, {
    headers: { 'Authorization': token }
  });

  const files = await res.json();
  const list = files.map(f => 
    `<div>${f.filename} (District: ${f.district}, Uploader: ${f.uploader})</div>`
  ).join("");

  document.getElementById("fileList").innerHTML = list;
}

function logout() {
  token = null;
  userRole = null;
  document.getElementById("loginView").style.display = "block";
  document.getElementById("carrierView").style.display = "none";
  document.getElementById("supervisorView").style.display = "none";
}
