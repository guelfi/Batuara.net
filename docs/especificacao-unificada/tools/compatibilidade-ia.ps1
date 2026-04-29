param(
  [string]$Root = (Join-Path $PSScriptRoot "..")
)

$ErrorActionPreference = "Stop"

$rootFull = (Resolve-Path -LiteralPath $Root).Path
$validationScript = Join-Path $PSScriptRoot "validate-references.ps1"

$validationOk = $true
try {
  & $validationScript -Root $rootFull -EmitReport | Out-Null
} catch {
  $validationOk = $false
}

$filesWithSpaces = Get-ChildItem -LiteralPath $rootFull -Recurse -File | Where-Object { $_.Name -match "\s" } | Select-Object -ExpandProperty FullName
$hasSpaces = ($filesWithSpaces.Count -gt 0)

$mdFiles = Get-ChildItem -LiteralPath (Join-Path $rootFull "specs") -Recurse -File -Filter "*.md"
$hasAbsoluteRefs = $false
foreach ($f in $mdFiles) {
  $content = Get-Content -LiteralPath $f.FullName -Raw
  if ($content -match "file:///" -or $content -match "[A-Za-z]:\\") {
    $hasAbsoluteRefs = $true
    break
  }
}

$checks = [pscustomobject]@{
  validationPass = $validationOk
  noSpacesInFilenames = (-not $hasSpaces)
  noAbsoluteReferencesInMarkdown = (-not $hasAbsoluteRefs)
  indexJsonPresent = (Test-Path -LiteralPath (Join-Path $rootFull "index.json"))
}

$tools = @("Gemini", "Claude", "Codex", "Cursor", "Trae", "Antigravity")
$perTool = @()
foreach ($t in $tools) {
  $perTool += [pscustomobject]@{
    tool = $t
    structuralParsingPrereqsPass = ($checks.validationPass -and $checks.noSpacesInFilenames -and $checks.noAbsoluteReferencesInMarkdown -and $checks.indexJsonPresent)
    checks = $checks
  }
}

$report = [pscustomobject]@{
  root = "docs/especificacao-unificada"
  generatedAt = (Get-Date -Format "yyyy-MM-dd")
  tools = $perTool
  filesWithSpaces = $filesWithSpaces
}

$reportDir = Join-Path $rootFull "index"
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
$reportPath = Join-Path $reportDir "ai-compatibility-report.json"
$report | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $reportPath -Encoding UTF8

if (-not $checks.validationPass) { exit 1 }
if ($hasSpaces) { exit 1 }
if ($hasAbsoluteRefs) { exit 1 }
exit 0
