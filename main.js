let db;
let watchId;

// Initialize IndexedDB on page load
window.onload = () => {
  const request = indexedDB.open("USPSNavDB", 1);
  request.onupgradeneeded = e => {
    db = e.target.result;
    db.createObjectStore("routes", { keyPath: "timestamp" });
  };
  request.onsuccess = e => {
    db = e.target.result;
    console.log("Database Ready");
    drawRoute();  // Draw any existing route on load
  };
  request.onerror = e => console.error("Database Error", e);

  document.getElementById("startRouteBtn").addEventListener("click", startRoute);
  document.getElementById("scanPackagesBtn").addEventListener("click", scanPackages);
  document.getElementById("poBoxAdminBtn").addEventListener("click", poBoxAdmin);
  document.getElementById("hazardLogBtn").addEventListener("click", hazardLog);
};

function startRoute() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }
  alert("GPS tracking started.");

  watchId = navigator.geolocation.watchPosition(pos => {
    const point = {
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
      timestamp: Date.now()
    };
    saveRoutePoint(point);
    drawPoint(point);
  }, err => console.error(err), { enableHighAccuracy: true });
}

function saveRoutePoint(point) {
  const tx = db.transaction("routes", "readwrite");
  const store = tx.objectStore("routes");
  store.put(point);
}

// Draw the full route on canvas
function drawRoute() {
  const tx = db.transaction("routes", "readonly");
  const store = tx.objectStore("routes");
  const req = store.getAll();
  req.onsuccess = () => {
    const allPoints = req.result;
    allPoints.forEach(drawPoint);
  };
}

// Simple canvas drawing logic (scaled for USPS demo mode)
function drawPoint(point) {
  const canvas = document.getElementById("mapCanvas");
  const ctx = canvas.getContext("2d");

  // Normalize lat/lon just for demo visual (not real-world map)
  const x = (point.lon + 180) * 2;
  const y = (90 - point.lat) * 2;

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fill();
}

// Other USPS features stay the same (simulated for field test)
function scanPackages() {
  const pkgId = prompt("Simulated package scan: Enter package ID");
  alert("Package logged: " + pkgId);
}

function poBoxAdmin() {
  alert("PO Box admin log (future upgrade)");
}

function hazardLog() {
  const hazard = prompt("Enter hazard notes:");
  alert("Hazard logged: " + hazard);
}
