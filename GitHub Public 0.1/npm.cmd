@echo off
rem ConceptLens portable npm launcher -> tools\node\npm.cmd (keeps its own %~dp0).
call "%~dp0tools\node\npm.cmd" %*
exit /b %errorlevel%
