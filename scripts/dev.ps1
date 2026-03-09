$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")

$backendJob = Start-Job -ScriptBlock {
  param($repoRoot)
  Set-Location (Join-Path $repoRoot "backend")
  python -m uvicorn app.main:app --reload --port 8000
} -ArgumentList $root

$frontendJob = Start-Job -ScriptBlock {
  param($repoRoot)
  Set-Location (Join-Path $repoRoot "frontend-react")
  npm run dev
} -ArgumentList $root

Write-Host "Backend and frontend started in background jobs."
Write-Host "Use 'Get-Job' to view status and 'Receive-Job -Id <id> -Keep' to inspect logs."
Write-Host "Press Enter to stop both jobs..."
[void](Read-Host)

Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
Remove-Job $backendJob, $frontendJob -Force -ErrorAction SilentlyContinue