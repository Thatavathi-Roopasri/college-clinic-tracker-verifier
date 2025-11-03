@echo off
cd /d "C:\Users\kswat\Downloads\cctv (1)\cctv\server-java"
set "JAVA_OPTS=-Dserver.port=8081"
java %JAVA_OPTS% -jar target/clinic-server-0.0.1-SNAPSHOT.jar
pause
