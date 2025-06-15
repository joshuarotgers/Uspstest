let db;
let routePoints = [];
let editMode = false;

window.onload = () => {
  const request = indexedDB.open("USPSNavDB", 3);
  request.onupgradeneeded = e => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("routes"))
      db.createObjectStore("routes", { keyPath: "timestamp" });
  };
  request.onsuccess = e => {
    db = e.target.result;
    console.log("Database Ready");
  };
  request.onerror = e => console.error("DB Error", e);

  document.getElementById("startRouteBtn").addEventListener("click", startRoute);
  document.getElementById("scanPackagesBtn").addEventListener("click", scanPackages);
  document.getElementById("poBoxAdminBtn").addEventListener("click", () => alert("PO Box Admin — Future Build"));
  document.getElementById("hazardLogBtn").addEventListener("click", () => alert("Hazard Log — Future Build"));
  document.getElementById("exportDataBtn").addEventListener("click", exportAllData);
  document.getElementById("importDataBtn").addEventListener("click", () => document.getElementById("fileInput").click());
  document.getElementById("fileInput").addEventListener("change", importRouteFile);
  document.getElementById("supervisorBtn").addEventListener("click", supervisorDashboard);
  document.getElementById("replayRouteBtn").addEventListener("click", replayRoute);
  document.getElementById("editRouteBtn").addEventListener("click", () => { editMode = !editMode; alert(editMode ? "Edit Mode ON" : "Edit Mode OFF"); });
  document.getElementById("saveRouteBtn").addEventListener("click", saveCorrectedRoute);
  document.getElementById("mapCanvas").addEventListener("click", mapClickHandler);
  document.getElementById("startDeliveryBtn").addEventListener("click", startDeliveryMode);
  document.getElementById("deliveryReportBtn").addEventListener("click", generateDailyReport);
};

function startRoute() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }
  alert("GPS tracking started.");

  navigator.geolocation.watchPosition(pos => {
    const point = {
      timestamp: Date.now(),
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
      packages: []
    };
    const tx = db.transaction("routes", "readwrite");
    tx.objectStore("routes").put(point);
    routePoints.push(point);
    drawRouteCanvas();
  });
}

function scanPackages() {
  if (routePoints.length === 0) {
    alert("Start route first.");
    return;
  }
  const pkgId = prompt("Enter Package ID:");
  if (!pkgId) return;
  const lastPoint = routePoints[routePoints.length - 1];
  lastPoint.packages.push(pkgId);
  drawRouteCanvas();
  alert(`Package ${pkgId} assigned.`);
}

function exportAllData() {
  const tx = db.transaction("routes", "readonly");
  tx.objectStore("routes").getAll().onsuccess = e => {
    const exportData = { routes: e.target.result };
    const blob = new Blob([JSON.stringify(exportData)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usps-route-${Date.now()}.json`;
    a.click();
  };
}

function importRouteFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = e => {
    const data = JSON.parse(e.target.result);
    const tx = db.transaction("routes", "readwrite");
    data.routes.forEach(p => tx.objectStore("routes").put(p));
    alert("Import complete.");
  };
  reader.readAsText(file);
}

function supervisorDashboard() {
  const total = routePoints.length;
  let pkgs = 0;
  routePoints.forEach(p => pkgs += p.packages.length);
  alert(`Supervisor Summary:\nStops: ${total}\nPackages: ${pkgs}`);
}

function replayRoute() {
  const tx = db.transaction("routes", "readonly");
  tx.objectStore("routes").getAll().onsuccess = e => {
    routePoints = e.target.result;
    drawRouteCanvas();
    alert("Route loaded.");
  };
}

function drawRouteCanvas() {
  const canvas = document.getElementById("mapCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.beginPath();
  routePoints.forEach((p, i) => {
    const x = normalizeX(p.lon);
    const y = normalizeY(p.lat);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    if (p.packages.length > 0) {
      ctx.fillStyle = "black";
      ctx.fillText(`${p.packages.length} pkg`, x + 5, y - 5);
    }
  });
  ctx.stroke();
}

function mapClickHandler(e) {
  if (!editMode) return;
  const canvas = document.getElementById("mapCanvas");
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  for (let i = 0; i < routePoints.length; i++) {
    const x = normalizeX(routePoints[i].lon);
    const y = normalizeY(routePoints[i].lat);
    if (Math.abs(x - clickX) < 10 && Math.abs(y - clickY) < 10) {
      routePoints.splice(i, 1);
      drawRouteCanvas();
      return;
    }
  }
  alert("To insert new point use future GPS-select build.");
}

function saveCorrectedRoute() {
  const tx = db.transaction("routes", "readwrite");
  const store = tx.objectStore("routes");
  store.clear().onsuccess = () => {
    routePoints.forEach(p => store.put(p));
    alert("Route saved.");
  };
}

function startDeliveryMode() {
  if (routePoints.length === 0) { alert("No route loaded."); return; }
  let i = 0;
  const nextStop = () => {
    if (i >= routePoints.length) { alert("Route complete."); return; }
    const stop = routePoints[i];
    const pkgList = stop.packages.join(", ");
    if (confirm(`Stop ${i + 1}/${routePoints.length}\nPackages: ${pkgList || "None"}\nDeliver?`)) {
      i++;
      nextStop();
    }
  };
  nextStop();
}

function generateDailyReport() {
  const stops = routePoints.length;
  let pkgs = 0;
  routePoints.forEach(p => pkgs += p.packages.length);
  alert(`Daily Report:\nStops: ${stops}\nPackages: ${pkgs}`);
}

function normalizeX(lon) { return (lon + 180) * 2; }
function normalizeY(lat) { return (90 - lat) * 2; }
