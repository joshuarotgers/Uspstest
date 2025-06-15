let token = null;
const serverURL = "http://usps-server:4000"; // Update for production deployment

window.onload = () => {
  document.getElementById("loginBtn").onclick = login;
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
    alert("Unauthorized. HQ Only.");
    return;
  }

  document.getElementById("loginView").style.display = "none";
  document.getElementById("reportView").style.display = "block";

  loadReport();
}

async function loadReport() {
  const res = await fetch(`${serverURL}/reporting/summary`, {
    headers: { 'Authorization': token }
  });

  const data = await res.json();

  let output = `<h3>USPS National LOT Summary</h3>
  <p>Total Users: ${data.totalUsers}</p>
  <p>Total LOT Files: ${data.totalFiles}</p>
  <h4>District Breakdown:</h4>`;

  data.districts.forEach(d => {
    output += `<p><strong>${d.district}</strong>: ${d.lotFiles} LOT Files</p>`;
  });

  document.getElementById("summary").innerHTML = output;
}

function logout() {
  token = null;
  document.getElementById("loginView").style.display = "block";
  document.getElementById("reportView").style.display = "none";
}
