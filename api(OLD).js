const API_BASE_URL = "https://azatheylle.github.io/ChampRecommendationWebSite/";

function buildQuery(params) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    qs.set(k, v ?? "");
  }
  return qs.toString();
}

async function getRecommendations() {
  const rank = document.getElementById("rank").value;
  const mylane = document.getElementById("myLane").value;

  const top = document.getElementById("enemy-top").value;
  const jungle = document.getElementById("enemy-jungle").value;
  const middle = document.getElementById("enemy-middle").value;
  const bottom = document.getElementById("enemy-bottom").value;
  const support = document.getElementById("enemy-support").value;

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
document.getElementById("calculate").addEventListener("click", onCalculateClick);