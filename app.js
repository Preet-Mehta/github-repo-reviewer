require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const axios = require("axios");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 3000;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// GitHub OAuth configuration
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, { profile, accessToken });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(
  session({ secret: "your_secret_key", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());

// Serve static files for the frontend
app.use(express.static(path.join(__dirname, "public")));

// Serve the index.html at the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Routes
app.get("/auth/github", passport.authenticate("github", { scope: ["repo"] }));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/repos");
  }
);

app.get("/repos", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const accessToken = req.user.accessToken;
  axios
    .get("https://api.github.com/user/repos", {
      headers: { Authorization: `token ${accessToken}` },
    })
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

  // Process the payload (e.g., send to ChatGPT)
  const commits = payload.commits;
  commits.forEach((commit) => {
    const changes = commit.modified.join("\n"); // Simplified for illustration
    // Call ChatGPT API to review changes
    axios
      .post(
        "https://api.openai.com/v1/engines/davinci-codex/completions",
        {
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

// Create webhook on GitHub
app.post("/create-webhook", (req, res) => {
  const { repoFullName } = req.body; // e.g., "username/repo"

  if (!repoFullName) {
    return res.status(400).json({ error: "Repository full name is required" });
  }

  const accessToken = req.user.accessToken;

  axios
    .post(
      `https://api.github.com/repos/${repoFullName}/hooks`,
      {
        name: "web",
        active: true,
        events: ["push"],
        config: {
          url: "https://8158-2405-201-2000-d8a5-2796-f90-4b4c-a4bc.ngrok-free.app/webhook",
          content_type: "json",
        },
      },
      {
        headers: { Authorization: `token ${accessToken}` },
      }
    )
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
