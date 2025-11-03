Setup notes — server-java
=========================

This file helps you install Maven on Windows and start the Spring Boot backend.

Paths used in this project
- Project root: `C:\Users\Roopa\OneDrive\Attachments\Desktop\cctv`
- Backend: `C:\Users\Roopa\OneDrive\Attachments\Desktop\cctv\server-java`

Option 1 — Automated install script (recommended if you don't want to use Chocolatey)
1. Open PowerShell "Run as Administrator" (search PowerShell, right-click -> Run as administrator).
2. Change to the backend folder:

```powershell
cd 'C:\Users\Roopa\OneDrive\Attachments\Desktop\cctv\server-java'
```

3. Run the installer script included in this folder (it downloads Maven 3.9.6 and updates Machine PATH):

```powershell
powershell -ExecutionPolicy Bypass -File .\install-maven.ps1
```

4. Close the PowerShell window, open a new (non-elevated is fine) PowerShell, and verify:

```powershell
mvn -v
```

Option 2 — Install via Chocolatey (if you already use Chocolatey)
1. Open Admin PowerShell and run the Chocolatey install command (if choco not present):

```powershell
# install Chocolatey (one-liner)
Set-ExecutionPolicy Bypass -Scope Process -Force; \
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; \
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

2. Then install Maven:

```powershell
choco install maven -y
mvn -v
```

Start the backend
-----------------
Once `mvn -v` shows Maven installed, start the Spring Boot application:

```powershell
cd 'C:\Users\Roopa\OneDrive\Attachments\Desktop\cctv\server-java'
# (optional) set Atlas URI for this shell session
$env:MONGO_URI='mongodb+srv://Project01:Welcome12345@project01.bmejhvq.mongodb.net/clinicdb?retryWrites=true&w=majority'

mvn -DskipTests=true spring-boot:run
```

Start the frontend
------------------
In another terminal/window:

```powershell
cd 'C:\Users\Roopa\OneDrive\Attachments\Desktop\cctv'
npx http-server -p 5500
# open http://localhost:5500
```

If you prefer Docker instead of installing Maven, install Docker Desktop and let me know — I will give the exact Docker-based run commands.

If anything fails, copy the error text and paste it here and I will help debug.