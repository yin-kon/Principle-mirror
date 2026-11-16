@echo off
rem ConceptLens portable Node launcher. CMD searches the current directory first,
rem so after: cd /d "E:\传智杯作品\GitHub Public"  ->  node -v works without installing Node.
"%~dp0tools\node\node.exe" %*
exit /b %errorlevel%
