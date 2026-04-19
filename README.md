# Champion Counter Website

This project is a web app replacement for your Tkinter draft recommendation tool.

## What It Does

- Lets you select rank and your own lane.
- Lets you input up to 5 enemy champions by lane.
- Validates champion names live (green = valid, red = invalid).
- Shows the same estimated runtime mapping as your Python GUI.
- Sends a request to an API endpoint and displays sorted counter recommendations.

## Run Locally

Because this is a static app, you can run it with any static server.

### Option 1: VS Code Live Server

Open `index.html` with Live Server.

### Option 2: Python HTTP server

```bash
python -m http.server 5500
```

Then open:

`http://localhost:5500`

## Expected API Contract

Frontend calls:

- `POST /api/recommendations`

Request body:

```json
{
  "rank": "tier=platinum_plus",
  "myLane": "top",
  "enemyPicks": [
    { "lane": "top", "champion": "darius" },
    { "lane": "middle", "champion": "ahri" }
  ]
}
```

Accepted response formats:

### Preferred format

```json
{
  "recommendations": [
    { "champion": "fiora", "enemyWinRate": 47.3 },
    { "champion": "teemo", "enemyWinRate": 48.1 }
  ]
}
```

The UI converts `enemyWinRate` to player win rate by using `100 - enemyWinRate`.

### Also supported format

```json
{
  "fiora": 47.3,
  "teemo": 48.1
}
```

## Notes for Backend Migration

When moving Python logic to API calls, your backend should:

- Validate champion names against the same champion list.
- Aggregate matchups across all enemy picks.
- Return stable numeric values for win rates.
- Return a non-200 status when input is invalid or upstream fetch fails.
