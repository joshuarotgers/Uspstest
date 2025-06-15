let token = null;
const serverURL = "http://usps-server:4000"; // update for production deployment

window.onload = () => {
  document.getElementById("loginBtn").onclick = login;
  document.getElementById("createUserBtn").onclick = createUser;
  document.getElementById("createDistrictBtn").onclick = createDistrict;
  document.getElementById("listFilesBtn").onclick = listFiles;
  document.getElementById("logoutBtn").onclick = logout;
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

  if (payload.role !== "hq") {
    alert("Unauthorized access. This portal is for HQ Admin only.");
    return;
  }

  document.getElementById("loginView").style.display = "none";
  document.getElementById("adminView").style.display = "block";
  document.getElementById("adminUser").innerText = payload.username;
}

async function createDistrict() {
  const name = document.getElementById("districtName").value;
  if (!name) return alert("Enter district name.");

  const res = await fetch(`${serverURL}/district`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({ name })
  });

  if (res.ok) {
    alert("District created.");
  } else {
    alert("Failed to create district.");
  }
}

async function createUser() {
  const newUser = {
    username: document.getElementById("newUsername").value,
    password: document.getElementById("newPassword").value,
    district: document.getElementById("newDistrict").value,
    role: document.getElementById("newRole").value
  };

  const res = await fetch(`${serverURL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser)
  });

  if (res.ok) {
    alert("User created.");
  } else {
    alert("Failed to create user.");
  }
}

async function listFiles() {
  const res = await fetch(`${serverURL}/files`, {
    headers: { "Authorization": token }
  });

  const files = await res.json();
  const list = files.map(f => 
    `<div>${f.filename} (District: ${f.district}, Uploader: ${f.uploader})</div>`
  ).join("");

  document.getElementById("fileList").innerHTML = list;
}

function logout() {
  token = null;
  document.getElementById("loginView").style.display = "block";
  document.getElementById("adminView").style.display = "none";
}
