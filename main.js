let routeData = [];
let packages = [];
let hazards = [];
let poBoxLog = [];

// Button listeners fully attached AFTER DOM loads:
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startRouteBtn").addEventListener("click", startRoute);
  document.getElementById("scanPackagesBtn").addEventListener("click", scanPackages);
  document.getElementById("poBoxAdminBtn").addEventListener("click", poBoxAdmin);
  document.getElementById("hazardLogBtn").addEventListener("click", hazardLog);
});

function startRoute() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }
  navigator.geolocation.watchPosition(pos => {
    routeData.push({
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
      timestamp: Date.now()
    });
    console.log(routeData);
  });
  alert("GPS tracking started.");
}

function scanPackages() {
  const pkgId = prompt("Simulated package scan: Enter package ID");
  if (!pkgId) return;
  packages.push(pkgId);
  if (pkgId.startsWith("PO")) {
    poBoxLog.push({ pkgId, address: "Unknown" });
  }
  alert("Package logged.");
}

function poBoxAdmin() {
  let list = poBoxLog.map(p => `ID: ${p.pkgId}, Address: ${p.address}`).join("\n");
  if (!list) list = "No PO Box records.";
  alert(list);
}

function hazardLog() {
  const hazard = prompt("Enter hazard notes:");
  if (!hazard) return;
  hazards.push({ hazard, timestamp: Date.now() });
  alert("Hazard logged.");
}
