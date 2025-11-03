# Install Maven manually on Windows
# Run this script with: powershell -ExecutionPolicy Bypass -File install-maven.ps1

$mavenVersion = "3.9.11"
$mavenUrl = "https://archive.apache.org/dist/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip"
$installDir = "$env:USERPROFILE\.maven"
$mavenHome = "$installDir\apache-maven-$mavenVersion"

Write-Host "[*] Installing Apache Maven $mavenVersion..." -ForegroundColor Cyan

# Create installation directory
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir | Out-Null
    Write-Host "[+] Created $installDir"
}

# Download Maven
$zipFile = "$installDir\maven-$mavenVersion.zip"
if (-not (Test-Path $zipFile)) {
    Write-Host "[*] Downloading Maven from $mavenUrl..."
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        (New-Object Net.WebClient).DownloadFile($mavenUrl, $zipFile)
        Write-Host "[+] Downloaded Maven"
    } catch {
        Write-Host "[-] Download failed: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[+] Maven zip already downloaded"
}

# Extract Maven
if (-not (Test-Path $mavenHome)) {
    Write-Host "[*] Extracting Maven..."
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($zipFile, $installDir)
    Write-Host "[+] Extracted Maven to $mavenHome"
} else {
    Write-Host "[+] Maven already extracted"
}

# Add Maven to PATH for current session
$env:Path += ";$mavenHome\bin"
$env:M2_HOME = $mavenHome
Write-Host "[+] Added Maven to current session PATH"

Write-Host ""
Write-Host "[SUCCESS] Maven installation complete!" -ForegroundColor Green
Write-Host "Maven Home: $mavenHome"
Write-Host ""
Write-Host "Verify installation:"
Write-Host "  mvn -v"
Write-Host ""
