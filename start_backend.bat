@echo off
cd /d "%~dp0backend"
echo Installing Python dependencies...
pip install -r requirements.txt
echo.
echo Starting FastAPI backend on http://localhost:8001
echo API Docs available at http://localhost:8001/docs
echo.
uvicorn main:app --reload --host 0.0.0.0 --port 8001
