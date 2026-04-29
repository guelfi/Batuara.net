param(
  [string]$Root = (Join-Path $PSScriptRoot "..")
)

$ErrorActionPreference = "Stop"

$rootFull = (Resolve-Path -LiteralPath $Root).Path
$metricsDir = Join-Path $rootFull "metrics"
$files = Get-ChildItem -LiteralPath $metricsDir -File -Filter "*.json" | Where-Object { $_.Name -notmatch "template" }

$allRuns = @()
foreach ($f in $files) {
  $obj = Get-Content -LiteralPath $f.FullName -Raw | ConvertFrom-Json
  foreach ($r in $obj.runs) {
    $allRuns += $r
  }
}

function Score-Run($run) {
  $keys = $run.results.PSObject.Properties.Name
  $max = 0
  $score = 0
  foreach ($k in $keys) {
    $v = $run.results.$k
    if ($v -is [bool]) {
      $max += 1
      if ($v) { $score += 1 }
    }
  }
  return [pscustomobject]@{ score = $score; max = $max }
}

$grouped = $allRuns | Group-Object tool, scenario
$summary = @()
foreach ($g in $grouped) {
  $tool = $g.Group[0].tool
  $scenario = $g.Group[0].scenario
  $totalScore = 0
  $totalMax = 0
  foreach ($run in $g.Group) {
    $s = Score-Run $run
    $totalScore += $s.score
    $totalMax += $s.max
  }
  $accuracy = if ($totalMax -gt 0) { [math]::Round(($totalScore / $totalMax) * 100, 2) } else { $null }
  $summary += [pscustomobject]@{
    tool = $tool
    scenario = $scenario
    runs = $g.Count
    score = $totalScore
    max = $totalMax
    accuracyPercent = $accuracy
  }
}

$summary | Sort-Object tool, scenario | ConvertTo-Json -Depth 10 | Write-Host
