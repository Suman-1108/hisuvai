@echo off
title HISUVAI Health Mix Website
echo ========================================================
echo   Starting HISUVAI Health Mix E-Commerce Website...
echo   Opening in your browser: http://localhost:5173
echo ========================================================
start http://localhost:5173
npm run dev -- --port 5173
