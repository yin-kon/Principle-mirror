@echo off
rem ConceptLens portable pnpm launcher. pnpm is pre-installed into tools\node\.
if not exist "%~dp0tools\node\pnpm.cmd" (
  echo [ConceptLens] pnpm missing. Run: npm i -g pnpm@9.15.4
  exit /b 1
)
call "%~dp0tools\node\pnpm.cmd" %*
exit /b %errorlevel%
