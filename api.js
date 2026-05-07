const API_BASE_URL = "https://YOUR-RENDER-SERVICE.onrender.com";

function buildQuery(params) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    qs.set(k, v ?? "");
  }
  return qs.toString();
}

async function getRecommendations() {
  // You must map these to your actual HTML element IDs/names
  const rank = document.getElementById("rank").value;       // "Platinum+"
  const mylane = document.getElementById("mylane").value;   // "Top"

  const top = document.getElementById("top").value;
  const jungle = document.getElementById("jungle").value;
  const middle = document.getElementById("middle").value;
  const bottom = document.getElementById("bottom").value;
  const support = document.getElementById("support").value;

  const query = buildQuery({ rank, mylane, top, jungle, middle, bottom, support });
  const url = `${API_BASE_URL}/api/recommendations?${query}`;

  const resp = await fetch(url, { method: "GET" });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`API error (${resp.status}): ${text}`);
  }

  return await resp.json();
}

function renderResults(data) {
  // You must map this to your actual output area
  const out = document.getElementById("results");
  out.innerHTML = "";

  for (const item of data.results) {
    const line = document.createElement("div");
    line.textContent = `${item.champ}: ${item.reversed_winrate.toFixed(2)}%`;
    out.appendChild(line);
  }
}

async function onCalculateClick() {
  try {
    const data = await getRecommendations();
    renderResults(data);
  } catch (err) {
    // You must map this to your actual error element (or reuse results)
    const out = document.getElementById("results");
    out.textContent = err.message;
  }
}

// Hook button click (change ID to match your HTML)
document.getElementById("calculateBtn").addEventListener("click", onCalculateClick);