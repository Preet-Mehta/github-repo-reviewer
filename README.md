# GitHub Webhook App

This application allows users to log in with their GitHub Personal Access Token (PAT), select a repository, and create a webhook that triggers a code review using OpenAI's GPT model whenever a commit is pushed to the repository.

## Features

1. **Login with GitHub Personal Access Token (PAT)**
2. **List user's repositories**
3. **Create webhooks for selected repositories**
4. **Code review of commits using OpenAI's GPT model**

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A GitHub account
- An OpenAI account
- [NGROK](https://ngrok.com/)

## Setup

### Step 1: Clone the Repository

```sh
git clone https://github.com/your-username/github-webhook-app.git
cd github-webhook-app
```

### Step 2: Install Dependencies

```sh
npm install
```

### Step 3: Create a .env File

Create a .env file in the root directory of the project and add the following environment variables:

```sh
OPENAI_API_KEY=your_openai_api_key_here
NGROK_URL=your_ngrok_url_here
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

### Step 4: Create a GitHub Personal Access Token (PAT)

Go to GitHub Settings.
Click on "Generate new token".
Select the necessary scopes (repo is required).
Generate the token and copy it.

### Step 5: Setup NGROK

- Download and install NGROK.

- Authenticate NGROK with your account:

```sh
ngrok authtoken your_ngrok_auth_token
```

- Start NGROK to tunnel HTTP requests to your local server:

```sh
ngrok http 3000
```

- Note the forwarding URL provided by NGROK (e.g., http://<ngrok-id>.ngrok.io), which will be used as the webhook URL.

### Step 6: Update Webhook URL in app.js

In `.env`, replace `your_ngrok_url_here` with your NGROK URL **without the trailing `/`**. For example:

```javascript

config: {
    url: 'http://<ngrok-id>.ngrok.io/webhook',
    content_type: 'json'
}
```

### Step 7: Run the Application

```sh
node app.js
```

### Step 8: Access the Application

Open your browser and navigate to http://localhost:3000.

## Usage

- Enter your GitHub Personal Access Token (PAT) in the provided input field.
- Submit the PAT by clicking the "Submit" button.
- Select a repository from the dropdown list of your repositories.
- Click "Create Webhook" to set up the webhook for the selected repository.

Whenever a commit is pushed to the repository, the webhook will trigger and the code changes will be reviewed using OpenAI's GPT model.

## File Structure

- `app.js`: The main server file handling the backend logic.
- `public/index.html`: The frontend of the application.
- `.env`: Environment variables file (not included in the repository).

## Dependencies

- `express`: Fast, unopinionated, minimalist web framework for Node.js.
- `body-parser`: Node.js body parsing middleware.
- `axios`: Promise-based HTTP client for the browser and Node.js.
- `dotenv`: Module to load environment variables from a .env file.

## Contributing

- Fork the repository.
- Create a new branch (git checkout -b feature-branch).
- Make your changes.
- Commit your changes (git commit -am 'Add new feature').
- Push to the branch (git push origin feature-branch).
- Create a new Pull Request.

## License

This project is licensed under the MIT License.

### Notes

- Ensure that you replace placeholders like `your_openai_api_key_here` with actual values.
- The URL `https://github.com/your-username/github-webhook-app.git` should be replaced with the actual repository URL if you're hosting this on GitHub.

By following these instructions, users should be able to set up and run the application locally.
