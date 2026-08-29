#!/bin/bash
# Runs the AI Tutor backend (FastAPI/uvicorn) and the Next.js app together.
# Ctrl+C stops both cleanly.

set -e

# --- Start the Python backend in the background ---
cd src/ai-tutor-backend
source venv/bin/activate
uvicorn api:app --reload --port 8000 &
BACKEND_PID=$!
cd - > /dev/null

# --- Make sure the backend gets killed when this script exits ---
cleanup() {
  echo ""
  echo "Stopping AI Tutor backend (PID $BACKEND_PID)..."
  kill $BACKEND_PID 2>/dev/null
}
trap cleanup EXIT

# --- Start Next.js in the foreground ---
# npm run dev
npm run build && npm start