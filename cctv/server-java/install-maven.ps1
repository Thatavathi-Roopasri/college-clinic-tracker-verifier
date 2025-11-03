<#
  install-maven.ps1
  Purpose: Download Apache Maven, install to C:\Program Files\Apache\Maven, and add to machine PATH.
  Usage (run as Administrator in PowerShell):
    powershell -ExecutionPolicy Bypass -File .\install-maven.ps1

  Notes:
  - This script requires Administrator privileges because it updates Machine environment variables.
  - After the script completes, close and re-open PowerShell so the new PATH is picked up.
#>

# Ensure running as Administrator
function Test-IsAdmin {
  $current = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($current)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-IsAdmin)) {
  Write-Error "This script must be run as Administrator. Right-click PowerShell and choose 'Run as administrator'."
  exit 1
}

try {
  $version = '3.9.6'
  $zipUrl = "https://archive.apache.org/dist/maven/maven-3/$version/binaries/apache-maven-$version-bin.zip"
  $installBase = 'C:\Program Files\Apache\Maven'
  $destZip = Join-Path $env:TEMP "apache-maven-$version-bin.zip"

  Write-Host "Installing Apache Maven $version..."
  Write-Host "Download: $zipUrl"

  if (-not (Test-Path $installBase)) {
    New-Item -Path $installBase -ItemType Directory -Force | Out-Null
  }

  Write-Host "Downloading Maven ZIP to $destZip ..."
  Invoke-WebRequest -Uri $zipUrl -OutFile $destZip -UseBasicParsing

  Write-Host "Extracting to $installBase ..."
  Expand-Archive -Path $destZip -DestinationPath $installBase -Force

  $mavenHome = Join-Path $installBase "apache-maven-$version"
  $mavenBin = Join-Path $mavenHome 'bin'

  if (-not (Test-Path (Join-Path $mavenBin 'mvn.cmd'))) {
    Write-Error "Extraction failed or mvn.cmd not found at $mavenBin"
    exit 1
  }

  Write-Host "Updating machine environment variables (MAVEN_HOME and PATH)..."
  # Set MAVEN_HOME
  [Environment]::SetEnvironmentVariable('MAVEN_HOME', $mavenHome, 'Machine')

  # Update PATH if required
  $machinePath = [Environment]::GetEnvironmentVariable('Path','Machine')
  if ($machinePath -notlike "*${mavenBin}*") {
    $newPath = $machinePath + ';' + $mavenBin
    [Environment]::SetEnvironmentVariable('Path', $newPath, 'Machine')
    Write-Host "Added $mavenBin to machine PATH"
  } else {
    Write-Host "Maven bin already in machine PATH"
  }

  # Clean up downloaded zip
  try { Remove-Item -Path $destZip -Force -ErrorAction SilentlyContinue } catch {}

  Write-Host "Maven $version installed to: $mavenHome"
  Write-Host "IMPORTANT: Close all PowerShell/terminal windows and open a new one to pick up the updated PATH."

  # Try to run mvn from the freshly installed path (works even before restarting shell)
  $mvnCmd = Join-Path $mavenBin 'mvn.cmd'
  Write-Host "Running: $mvnCmd -v"
  & $mvnCmd -v

  Write-Host "If the above printed Maven version, you are good to go. If not, re-open an Administrator PowerShell and run 'mvn -v' after closing the shell."
} catch {
  Write-Error "Installation failed: $_"
  exit 1
}
