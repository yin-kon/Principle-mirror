@echo off
rem ConceptLens portable npx launcher -> tools\node\npx.cmd
call "%~dp0tools\node\npx.cmd" %*
exit /b %errorlevel%
