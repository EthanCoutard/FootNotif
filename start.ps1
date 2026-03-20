[CmdletBinding()]
param(
    [switch]$NoFront
)

# Encodage UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$venvPath = Join-Path $PSScriptRoot ".venv"

Write-Host "-------------------------------------------"
Write-Host "Démarrage des services... (CLIs minimisées)"
Write-Host "-------------------------------------------"

$pythonBin = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (!(Test-Path $pythonBin)) {
    Write-Host "[ERREUR] ❌ Python venv introuvable: $pythonBin"
    exit 1
}

# --- Stop old Front (Vite processes) ---
$viteProcess = Get-CimInstance Win32_Process |
    Where-Object {
        $_.CommandLine -and (
            $_.CommandLine -like "*vite*" -or
            $_.CommandLine -like "*npm run dev*" -or
            $_.CommandLine -like "*node*football-admin*" -or
            $_.CommandLine -like "*node*vite*"
        )
    }
if ($viteProcess) {
    Write-Host "[INFO] 🔄 Front déjà en cours — arrêt de l'ancienne instance..."
    $viteProcess | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
    Start-Sleep -Milliseconds 300
}


$apiProcess = Get-CimInstance Win32_Process |
Where-Object { $_.CommandLine -and $_.CommandLine -like "*app.py*" }

if ($apiProcess) {
    Write-Host "[OK] ✅ API déjà en cours d'exécution."
}
else {
    Write-Host "Lancement API (app.py) dans une fenêtre..."
    # $apiCmd = "Set-Location '$PSScriptRoot'; & '$pythonBin' app.py"
    $apiCmd = "powershell -NoExit -Command `"Set-Location '$PSScriptRoot'; & '$pythonBin' app.py`""
    Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/k", $apiCmd `
        -WindowStyle Minimized
}

if ($NoFront) {
    Write-Host "Front non démarré."
}
else {
    $frontPath = Join-Path $PSScriptRoot "football-admin"

    if (Test-Path (Join-Path $frontPath "package.json")) {
        Write-Host "Lancement Front (Vite) dans une nouvelle fenêtre..."

        # Commande PowerShell encapsulée dans CMD
        $frontCmd = "powershell -NoExit -Command `"Set-Location '$frontPath'; npm run dev`""

        Start-Process -FilePath "cmd.exe" `
            -ArgumentList "/k", $frontCmd `
            -WindowStyle Minimized
    }
    else {
        Write-Host "[WARN] package.json introuvable dans football-admin, front non lancé."
    }
}

Write-Host "`n[OK] ✅ Script terminé."
Write-Host "API (Santé) : http://127.0.0.1:8000/health"
Write-Host "API   (Doc) : http://127.0.0.1:8000/docs"
if (-not $NoFront) {
    Write-Host "Front       : http://localhost:5173`n"
}
