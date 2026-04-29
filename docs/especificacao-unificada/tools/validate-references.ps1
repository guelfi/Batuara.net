param(
  [string]$Root = (Join-Path $PSScriptRoot ".."),
  [string]$IndexPath = (Join-Path (Join-Path $PSScriptRoot "..") "index.json"),
  [switch]$EmitReport
)

$ErrorActionPreference = "Stop"

$rootFull = (Resolve-Path -LiteralPath $Root).Path
$indexFull = (Resolve-Path -LiteralPath $IndexPath).Path

$errors = New-Object System.Collections.Generic.List[string]

function Add-Err([string]$message) {
  $errors.Add($message) | Out-Null
}

function Test-Exists([string]$relativePath, [string]$context) {
  $full = Join-Path $rootFull $relativePath
  if (-not (Test-Path -LiteralPath $full)) {
    Add-Err("Arquivo não encontrado: '$relativePath' ($context)")
  }
}

$index = Get-Content -LiteralPath $indexFull -Raw | ConvertFrom-Json

foreach ($spec in $index.specs) {
  Test-Exists $spec.path "index.specs[$($spec.id)].path"
  foreach ($assetPath in $spec.referencesAssets) {
    Test-Exists $assetPath "index.specs[$($spec.id)].referencesAssets"
  }
}

$mdFiles = Get-ChildItem -LiteralPath (Join-Path $rootFull "specs") -Recurse -File -Filter "*.md"

foreach ($file in $mdFiles) {
  $content = Get-Content -LiteralPath $file.FullName -Raw

  if ($content -match 'file:///' -or $content -match '[A-Za-z]:\\') {
    Add-Err("Referência absoluta detectada (use links relativos): $($file.FullName)")
  }

  $matches = [regex]::Matches($content, '\[[^\]]*\]\(([^\)]+)\)')
  foreach ($m in $matches) {
    $target = $m.Groups[1].Value.Trim()
    if ([string]::IsNullOrWhiteSpace($target)) { continue }
    if ($target.StartsWith("#")) { continue }
    if ($target.StartsWith("http://") -or $target.StartsWith("https://") -or $target.StartsWith("mailto:")) { continue }

    $pathPart = $target
    $hashIndex = $target.IndexOf("#")
    if ($hashIndex -ge 0) {
      $pathPart = $target.Substring(0, $hashIndex)
    }

    if ([string]::IsNullOrWhiteSpace($pathPart)) { continue }
    if ($pathPart.StartsWith("/")) {
      Add-Err("Link inválido (caminho absoluto): '$target' em $($file.FullName)")
      continue
    }

    $resolved = Join-Path $file.DirectoryName $pathPart
    if (-not (Test-Path -LiteralPath $resolved)) {
      $relativeFromRoot = $resolved.Substring($rootFull.Length).TrimStart('\')
      Add-Err("Link quebrado: '$target' em $($file.FullName) (resolve para '$relativeFromRoot')")
    }
  }
}

$result = [pscustomobject]@{
  root = $index.root
  generatedAt = $index.generatedAt
  errors = $errors
  errorCount = $errors.Count
}

if ($EmitReport) {
  $reportDir = Join-Path $rootFull "index"
  New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
  $reportPath = Join-Path $reportDir "validation-report.json"
  $result | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $reportPath -Encoding UTF8
}

if ($errors.Count -gt 0) {
  $errors | ForEach-Object { Write-Host $_ }
  exit 1
}

Write-Host "OK"
exit 0
