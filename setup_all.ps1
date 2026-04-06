# setup_all.ps1 - Lakki Phone ERP Hybrid Launch Script
# This script detects the environment and offers Native or Docker paths.

Write-Host "--- Lakki Phone ERP: Hybrid Setup Engine ---" -ForegroundColor Cyan

$choice = Read-Host "Select Setup Mode: [A] Native (Node.js/MongoDB) | [B] Docker (Isolated Container)"

if ($choice -eq "A") {
    Write-Host ">>> Path A: Native Installation Selected" -ForegroundColor Green
    
    # Check for winget
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "Checking for Node.js..."
        if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
            Write-Host "Installing Node.js via winget..."
            winget install OpenJS.NodeJS.LTS
        }
        
        Write-Host "Checking for MongoDB..."
        if (-not (Get-Service MongoDB -ErrorAction SilentlyContinue)) {
            Write-Host "Installing MongoDB Community Edition via winget..."
            winget install MongoDB.Server
        }
    } else {
        Write-Host "Winget not found. Please install Node.js and MongoDB manually." -ForegroundColor Red
        exit
    }

    Write-Host "Installing NPM dependencies..."
    npm install

    Write-Host "Starting Lakki Phone ERP..."
    npm run dev

} elseif ($choice -eq "B") {
    Write-Host ">>> Path B: Docker Launch Selected" -ForegroundColor Green
    
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        Write-Host "Launching via docker-compose..."
        docker-compose up --build
    } else {
        Write-Host "Docker Compose not found. Please install Docker Desktop." -ForegroundColor Red
    }
} else {
    Write-Host "Invalid selection. Exiting." -ForegroundColor Yellow
}
