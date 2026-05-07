import { ALL_CHAMPS } from "./champions.js";

const API_BASE_URL = "https://azatheylle.github.io/ChampRecommendationWebSite";

const estimateByCount = {
  1: 8,
  2: 20,
  3: 37,
  4: 43,
  5: 65
};

const rankSelect = document.getElementById("rank");
const myLaneSelect = document.getElementById("myLane");
const inputFields = Array.from(document.querySelectorAll("input[data-lane]"));
const estimateLabel = document.getElementById("estimate");
const statusLabel = document.getElementById("status");
const calculateButton = document.getElementById("calculate");
const resultsList = document.getElementById("results");

const championSet = new Set(ALL_CHAMPS);

attachEvents();
renderEmptyResults();

function attachEvents() {
  inputFields.forEach((input) => {
    input.addEventListener("input", () => {
      validateInput(input);
      updateEstimate();
    });
  });

  calculateButton.addEventListener("click", onCalculateClick);
}

function normalizeChampionName(value) {
  return value.toLowerCase().replace(/[\s'.-]/g, "");
}

function validateInput(input) {
  const normalized = normalizeChampionName(input.value.trim());
  input.classList.remove("valid", "invalid");

  if (!normalized) {
    return true;
  }

  const isValid = championSet.has(normalized);
  input.classList.add(isValid ? "valid" : "invalid");
  return isValid;
}

function updateEstimate() {
  const count = inputFields.filter((field) => field.value.trim() !== "").length;
  const seconds = estimateByCount[count] || 0;
  estimateLabel.textContent = `Estimated time = ${seconds} sec`;
}

function collectEnemyPicks() {
  const picks = {};

  inputFields.forEach((field) => {
    picks[field.dataset.lane] = normalizeChampionName(field.value.trim());
  });

  return picks;
}

function hasInvalidChampion() {
  return inputFields.some((field) => !validateInput(field));
}

function setStatus(message, isError = false) {
  statusLabel.textContent = message;
  statusLabel.classList.toggle("error", isError);
}

function renderEmptyResults() {
  resultsList.innerHTML = "";

  const item = document.createElement("li");
  item.className = "result-item";
  item.innerHTML = "<div class=\"name\">No recommendations yet</div><div class=\"wr\">-</div>";
  resultsList.appendChild(item);
}

function renderResults(items) {
  resultsList.innerHTML = "";

  if (!items.length) {
    renderEmptyResults();
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "result-item";

    li.innerHTML = `
      <div class="name">${item.champion}</div>
      <div class="wr">${item.playerWinRate.toFixed(2)}%</div>
    `;

    resultsList.appendChild(li);
  });
}

function normalizeApiResponse(data) {
  if (Array.isArray(data?.results)) {
    return data.results.map((row) => ({
      champion: row.champ,
      playerWinRate: Number(row.reversed_winrate)
    }));
  }

  return [];
}

async function fetchRecommendations(payload) {
  const params = new URLSearchParams(payload);
  const response = await fetch(`${API_BASE_URL}/api/recommendations?${params}`, {
    method: "GET"
  });

  if (!response.ok) {
    const message = `Request failed (${response.status})`;
    throw new Error(message);
  }

  return response.json();
}

async function onCalculateClick() {
  setStatus("");

  if (hasInvalidChampion()) {
    setStatus("One or more champion names are invalid. Fix red fields first.", true);
    return;
  }

  const enemyPicks = collectEnemyPicks();

  if (!Object.values(enemyPicks).some(Boolean)) {
    setStatus("Please enter at least one enemy champion.", true);
    renderEmptyResults();
    return;
  }

  const payload = {
    rank: rankSelect.value,
    mylane: myLaneSelect.value,
    ...enemyPicks
  };

  calculateButton.disabled = true;
  calculateButton.textContent = "Calculating...";
  setStatus("Fetching recommendations from API...");

  try {
    const apiResponse = await fetchRecommendations(payload);
    const rows = normalizeApiResponse(apiResponse)
      .filter((row) => Number.isFinite(row.playerWinRate))
      .sort((a, b) => b.playerWinRate - a.playerWinRate);

    renderResults(rows);
    setStatus(`Done. ${rows.length} recommendations loaded.`);
  } catch (error) {
    renderEmptyResults();
    setStatus(`Failed to fetch recommendations: ${error.message}`, true);
  } finally {
    calculateButton.disabled = false;
    calculateButton.textContent = "Calculate Counters";
  }
}
