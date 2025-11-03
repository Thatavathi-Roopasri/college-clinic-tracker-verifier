@echo off
echo Killing process on port 8080...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') DO (
    echo Found process %%P using port 8080
    taskkill /PID %%P /F /T
)
echo Done!
pause
