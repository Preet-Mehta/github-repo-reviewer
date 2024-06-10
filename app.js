require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");

const app = express();
const port = 3000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Serve the index.html at the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Fetch repositories using the provided GitHub Personal Access Token
app.post("/repos", (req, res) => {
  const { pat } = req.body;

  if (!pat) {
    return res
      .status(400)
      .json({ error: "GitHub Personal Access Token is required" });
  }

  axios
    .get("https://api.github.com/user/repos", {
      headers: { Authorization: `token ${pat}` },
    })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

// Create webhook on GitHub using the provided GitHub Personal Access Token
app.post("/create-webhook", (req, res) => {
  const { repoFullName, pat } = req.body;

  if (!repoFullName) {
    return res.status(400).json({ error: "Repository full name is required" });
  }

  if (!pat) {
    return res
      .status(400)
      .json({ error: "GitHub Personal Access Token is required" });
  }

  axios
    .post(
      `https://api.github.com/repos/${repoFullName}/hooks`,
      {
        name: "web",
        active: true,
        events: ["push"],
        config: {
          url: "http://yourdomain.com/webhook",
          content_type: "json",
        },
      },
      {
        headers: { Authorization: `token ${pat}` },
      }
    )
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

// Webhook endpoint
app.post("/webhook", (req, res) => {
  const payload = req.body;
  console.log("Webhook received:", payload);

  if (!payload.commits || payload.commits.length === 0) {
    return res
      .status(400)
      .json({ error: "No commits found in webhook payload" });
  }

  const commits = payload.commits;
  commits.forEach((commit) => {
    const changes = commit.modified.join("\n"); // Simplified for illustration
    // Call ChatGPT API to review changes
    axios
      .post(
        "https://api.openai.com/v1/completions",
        {
          model: "davinci-002",
          prompt: `Review the following code changes:\n${changes}`,
          max_tokens: 150,
        },
        {
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        }
      )
      .then((response) => {
        console.log("Review:", response.data.choices[0].text);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

  res.status(200).send("Webhook received");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
