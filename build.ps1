# GlassTab Chrome Extension Packaging Script
param(
    [string]$OutputDir = "./dist",
    [string]$PackageName = "GlassTab"
)

# Get the current directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = $ScriptDir

# Create output directory if it doesn't exist
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "Created output directory: $OutputDir"
}

# Get timestamp for filename
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$ZipFileName = "$PackageName-$Timestamp.zip"
$ZipPath = Join-Path $OutputDir $ZipFileName

# Files and folders to include in packaging
$IncludePatterns = @(
    "assets",
    "js",
    "config.example.js",
    "index.html",
    "manifest.json",
    "style.css"
)

# Create temporary directory for staging
$TempDir = Join-Path $env:TEMP "$PackageName_temp_$Timestamp"
New-Item -ItemType Directory -Path $TempDir | Out-Null
Write-Host "Staging files to: $TempDir"

# Copy only included files
foreach ($Pattern in $IncludePatterns) {
    $SourcePath = Join-Path $ProjectRoot $Pattern
    if (Test-Path $SourcePath) {
        if ((Get-Item $SourcePath).PSIsContainer) {
            $DestPath = Join-Path $TempDir $Pattern
            Copy-Item -Path $SourcePath -Destination $TempDir -Recurse -Force
            Write-Host "Copied directory: $Pattern"
        } else {
            $DestPath = Join-Path $TempDir $Pattern
            Copy-Item -Path $SourcePath -Destination $DestPath -Force
            Write-Host "Copied file: $Pattern"
        }
    } else {
        Write-Warning "Not found: $Pattern"
    }
}
Write-Host "Files staged successfully"

# Create zip file
Write-Host "Creating zip package: $ZipFileName"
if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
    # Use built-in PowerShell compression
    Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipPath -Force
} else {
    Write-Host "Error: Compress-Archive not available on this system"
    Remove-Item -Path $TempDir -Recurse -Force
    exit 1
}

# Clean up temp directory
Remove-Item -Path $TempDir -Recurse -Force
Write-Host "Temporary files cleaned up"

# Display results
$FileSize = (Get-Item $ZipPath).Length / 1MB
Write-Host "✓ Packaging Complete!"
Write-Host "Package: $ZipPath"
Write-Host "Size: $([Math]::Round($FileSize, 2)) MB"