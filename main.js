let db;

window.onload = () => {
  const request = indexedDB.open("USPSNavDB", 2);
  request.onupgradeneeded = e => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("routes"))
      db.createObjectStore("routes", { keyPath: "timestamp" });
    if (!db.objectStoreNames.contains("packages"))
      db.createObjectStore("packages", { keyPath: "id" });
    if (!db.objectStoreNames.contains("poBoxes"))
      db.createObjectStore("poBoxes", { keyPath: "id", autoIncrement: true });
    if (!db.objectStoreNames.contains("hazards"))
      db.createObjectStore("hazards", { keyPath: "id", autoIncrement: true });
  };
  request.onsuccess = e => {
    db = e.target.result;
    console.log("Database Ready");
    drawRoute();
  };
  request.onerror = e => console.error("DB Error", e);

  document.getElementById("startRouteBtn").addEventListener("click", startRoute);
  document.getElementById("scanPackagesBtn").addEventListener("click", scanPackages);
  document.getElementById("poBoxAdminBtn").addEventListener("click", poBoxAdmin);
  document.getElementById("hazardLogBtn").addEventListener("click", hazardLog);
  document.getElementById("exportDataBtn").addEventListener("click", exportAllData);
};

function startRoute() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }
  alert("GPS tracking started.");

  navigator.geolocation.watchPosition(pos => {
    const point = {
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
      timestamp: Date.now()
    };
    const tx = db.transaction("routes", "readwrite");
    tx.objectStore("routes").put(point);
    drawPoint(point);
  });
}

function scanPackages() {
  const pkgId = prompt("Enter Package ID:");
  if (!pkgId) return;

  const tx = db.transaction("packages", "readwrite");
  tx.objectStore("packages").put({ id: pkgId, scannedAt: Date.now() });

  if (pkgId.startsWith("PO")) {
    const poTx = db.transaction("poBoxes", "readwrite");
    poTx.objectStore("poBoxes").add({ packageId: pkgId, address: "Unassigned" });
  }
  alert("Package logged.");
}

function poBoxAdmin() {
  const tx = db.transaction("poBoxes", "readonly");
  const store = tx.objectStore("poBoxes");
  const req = store.getAll();
  req.onsuccess = () => {
    const entries = req.result;
    let out = "";
    entries.forEach(e => out += `ID:${e.id} Package:${e.packageId} Address:${e.address}\n`);
    const selected = prompt(out + "\n\nEnter ID to Edit:");
    if (!selected) return;

    const newAddr = prompt("Enter new address:");
    if (!newAddr) return;

    const updateTx = db.transaction("poBoxes", "readwrite");
    updateTx.objectStore("poBoxes").put({ id: parseInt(selected), packageId: entries.find(e=>e.id==selected).packageId, address: newAddr });
    alert("PO Box updated.");
  };
}

function hazardLog() {
  const hazard = prompt("Enter hazard:");
  const tx = db.transaction("hazards", "readwrite");
  tx.objectStore("hazards").add({ note: hazard, timestamp: Date.now() });
  alert("Hazard logged.");
}

// Simple canvas USPS route display:
function drawRoute() {
  const tx = db.transaction("routes", "readonly");
  tx.objectStore("routes").getAll().onsuccess = e => {
    e.target.result.forEach(drawPoint);
  };
}

function drawPoint(p) {
  const canvas = document.getElementById("mapCanvas");
  const ctx = canvas.getContext("2d");
  const x = (p.lon + 180) * 2;
  const y = (90 - p.lat) * 2;
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fill();
  async function exportAllData() {
  const routeTx = db.transaction("routes", "readonly");
  const routeStore = routeTx.objectStore("routes");
  const routes = await routeStore.getAll();

  const packageTx = db.transaction("packages", "readonly");
  const packageStore = packageTx.objectStore("packages");
  const packages = await packageStore.getAll();

  const poBoxTx = db.transaction("poBoxes", "readonly");
  const poBoxStore = poBoxTx.objectStore("poBoxes");
  const poBoxes = await poBoxStore.getAll();

  const hazardTx = db.transaction("hazards", "readonly");
  const hazardStore = hazardTx.objectStore("hazards");
  const hazards = await hazardStore.getAll();

  const exportData = {
    timestamp: new Date().toISOString(),
    routes,
    packages,
    poBoxes,
    hazards
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `usps-lot-route-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
}
