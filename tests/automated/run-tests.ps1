$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot

if (-not $env:ESHOP_TEST_RUN_ID) {
  $env:ESHOP_TEST_RUN_ID = Get-Date -Format "yyyyMMdd-HHmmss"
}

$runDirectory = Join-Path $PSScriptRoot ("test-results\executions\" + $env:ESHOP_TEST_RUN_ID)
New-Item -ItemType Directory -Force -Path $runDirectory | Out-Null

if (-not $env:ESHOP_ADMIN_EMAIL -or -not $env:ESHOP_ADMIN_PASSWORD) {
  Write-Warning "ESHOP_ADMIN_EMAIL / ESHOP_ADMIN_PASSWORD chưa được thiết lập. Các nhóm cần quyền Admin sẽ BLOCKED."
}

$groups = @(
  @{ Name = "fr01"; Script = "test:fr01" },
  @{ Name = "fr09"; Script = "test:fr09" },
  @{ Name = "fr17"; Script = "test:fr17" }
)
$failedGroups = @()

foreach ($group in $groups) {
  Write-Host "`n=== Running $($group.Name) ==="
  $env:PLAYWRIGHT_OUTPUT_DIR = Join-Path $runDirectory "$($group.Name)-playwright"
  npm run $group.Script 2>&1 | Tee-Object -FilePath (Join-Path $runDirectory "$($group.Name)-console.log")
  if ($LASTEXITCODE -ne 0) {
    $failedGroups += $group.Name
  }
}

Write-Host "`n=== Building execution reports ==="
npm run report
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

if ($failedGroups.Count -gt 0) {
  Write-Warning "Có test thất bại hoặc bị block: $($failedGroups -join ', '). Xem execution-results.md và console logs."
  exit 1
}

Write-Host "All automated test groups passed."
