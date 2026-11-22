@echo off
cd /d "%~dp0public"
start "" http://localhost:8123
python -m http.server 8123
