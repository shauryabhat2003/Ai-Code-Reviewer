# AI Code Reviewer - https://ai-code-reviewer-io.onrender.com

![Final Pixel Perfect Dashboard](./screen.png)

## Overview

AI Code Reviewer is a modern web application that leverages Google's Gemini AI to analyze, review, and refactor code snippets. The application features a sleek glassmorphism UI built with React and Tailwind CSS v4, connecting to an Express backend that strictly enforces JSON schemas for reliable AI responses.

## Key Features

- **Automated Code Review**: Instantly get structured, actionable feedback on your code.
- **AI Refactoring Modal**: Click "Apply Fixes" to generate an optimized version of your code, complete with descriptions and one-click copying.
- **Dynamic Syntax Highlighting**: Utilizing Prism.js and React Simple Code Editor for a seamless editing experience.
- **Structured JSON Analysis**: Backend specifically prompts Gemini to return parsed JSON rules, organizing findings logically by errors, formatting, and performance improvements instead of messy raw markdown.
- **Glassmorphism UI**: Beautiful, fully responsive side-by-side flex layout matching modern design aesthetics.

## Technologies Used

### Frontend
- **React 18** (via Vite)
- **Tailwind CSS v4**
- **Prism.js** & **React Simple Code Editor**
- **React Markdown** & **Rehype Highlight**
- **Axios**

### Backend
- **Node.js** & **Express**
- **@google/generative-ai** (Gemini 2.5 Flash Lite)
- **CORS** & **Dotenv**

## Installation

### Prerequisites

- Node.js (v18+)
- npm (Node Package Manager)
- A Google Gemini API Key

### Steps

1. **Clone the repository:**
   ```sh
   git clone https://github.com/shauryabhat2003/Ai-Code-Reviewer.git
   cd Ai-Code-Reviewer
   ```

2. **Backend Setup:**
   Navigate to the backend directory and install dependencies:
   ```sh
   cd Backend
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the `Backend` directory and add your credentials:
   ```env
   PORT=3000
   GOOGLE_GEMINI_API_KEY=your-google-gemini-key
   ```

4. **Start the Backend Server:**
   ```sh
   npm start
   ```
   *The server will run on `http://localhost:3000`.*

5. **Frontend Setup:**
   Open a new terminal window, navigate to the frontend directory, and install dependencies:
   ```sh
   cd Frontend
   npm install
   ```

6. **Start the Frontend Development Server:**
   ```sh
   npm run dev
   ```
   *The React app will typically run on `http://localhost:5173`.*

## Usage

1. Enter your code in the dark editor panel on the left side of the screen.
2. Click the **"Review Code"** button to submit your code to the AI.
3. The structured AI-generated review will appear in the glass panel on the right, categorized by Executive Summary and Review Findings.
4. If issues are found, the Status Bar will prompt you to click **"Apply Fixes"**.
5. The Refactoring Modal will open, streaming in the optimized code. Click **"Copy Code"** to sync it to your clipboard.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the ISC License.
