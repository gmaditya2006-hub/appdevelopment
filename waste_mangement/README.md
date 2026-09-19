# WasteWise

WasteWise is a beginner-friendly web app for sustainable waste sorting, AI-based waste identification, local disposal guidance, and eco rewards.

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Database: SQL-ready structure for users, waste records, rewards, and centers
- Firebase: Authentication and notifications
- AI: TensorFlow.js or a simple image-classification model
- Maps: Google Maps API or OpenStreetMap

## Local Setup

1. Install dependencies:
   npm install

2. Start the app:
   npm start

3. Open in browser:
   http://localhost:3000

## API Endpoints

- GET /api/health
- GET /api/waste-guide/:type
- GET /api/centers?type=recyclable&city=Bangalore

## Environment Variables

Copy the sample file and update values:

cp .env.example .env

Set the server-side vision API key in `.env`:

OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini

The browser sends uploaded images to `/api/classify-waste`; the API key stays on the Express server.

## Notes

This project is intentionally beginner-friendly and can be extended with Firebase auth, a real database, and an actual AI model later.
