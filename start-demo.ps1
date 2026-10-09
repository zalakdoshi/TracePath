# TracePath Demo Startup Script
# Starts Hardhat node, backend, and frontend in separate processes

$ErrorActionPreference = "Stop"

# Colors for output
$ColorGreen = "Green"
$ColorYellow = "Yellow"
$ColorRed = "Red"

function Write-Header {
    param([string]$Text)
    Write-Host "`n=== $Text ===" -ForegroundColor $ColorGreen
}

function Write-Info {
    param([string]$Text)
    Write-Host $Text -ForegroundColor $ColorYellow
}

function Write-Error {
    param([string]$Text)
    Write-Host "ERROR: $Text" -ForegroundColor $ColorRed
}

# Check Node.js is installed
Write-Header "Checking prerequisites"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed. Please install Node.js first."
    exit 1
}
Write-Info "Node.js found: $(node --version)"

# Check if .env files exist and are configured
Write-Header "Checking environment files"

$envFiles = @{
    "blockchain/.env" = "blockchain/.env.example"
    "backend/.env" = "backend/.env.example"
    "frontend/.env" = "frontend/.env.example"
}

foreach ($envFile in $envFiles.Keys) {
    if (-not (Test-Path $envFile)) {
        Write-Info "Creating $envFile from $(($envFiles[$envFile]))"
        Copy-Item $envFiles[$envFile] $envFile -ErrorAction SilentlyContinue
        Write-Info "Please configure $envFile with your values"
    }
}

Write-Header "Installing dependencies"
Write-Info "Running: npm run install:all"
& npm run install:all
if ($LASTEXITCODE -ne 0) {
    Write-Error "Dependency installation failed"
    exit 1
}

Write-Header "Compiling smart contracts"
Write-Info "Running: npm run compile"
& npm run compile
if ($LASTEXITCODE -ne 0) {
    Write-Error "Contract compilation failed"
    exit 1
}

Write-Header "Starting services"
Write-Info "Opening new PowerShell windows for each service..."

# Start Hardhat node
Write-Info "Starting Hardhat node (localhost:8545)..."
$nodeProcess = Start-Process -FilePath "pwsh.exe" -ArgumentList "-NoExit", "-Command", "cd `"$PWD`"; npm run node" -PassThru
Start-Sleep -Seconds 3

# Run deploy:local
Write-Info "Deploying contracts..."
$deployProcess = Start-Process -FilePath "pwsh.exe" -ArgumentList "-NoExit", "-Command", "cd `"$PWD`"; npm run deploy:local" -PassThru -Wait

# Start backend
Write-Info "Starting backend (port 3001)..."
Start-Process -FilePath "pwsh.exe" -ArgumentList "-NoExit", "-Command", "cd `"$PWD`"; npm run backend" | Out-Null

# Start frontend
Write-Info "Starting frontend (port 5173)..."
Start-Process -FilePath "pwsh.exe" -ArgumentList "-NoExit", "-Command", "cd `"$PWD`"; npm run frontend" | Out-Null

Write-Header "Services started successfully!"
Write-Info "Hardhat node: http://localhost:8545"
Write-Info "Backend API: http://localhost:3001"
Write-Info "Frontend: http://localhost:5173"
Write-Info ""
Write-Info "Press Ctrl+C to stop any service, or close the PowerShell windows."
Write-Info "Check the original console window for logs."
