param(
  [string]$Root = (Join-Path $PSScriptRoot ".."),
  [string]$OutputPath = (Join-Path (Join-Path $PSScriptRoot "..") "index.json")
)

$ErrorActionPreference = "Stop"

$rootFull = (Resolve-Path -LiteralPath $Root).Path
$outputFull = Join-Path $rootFull (Split-Path -Leaf $OutputPath)

function Get-LinksFromMarkdown([string]$filePath) {
  $content = Get-Content -LiteralPath $filePath -Raw
  $matches = [regex]::Matches($content, "\[[^\]]*\]\(([^\)]+)\)")
  $links = New-Object System.Collections.Generic.List[string]
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
    $links.Add($pathPart) | Out-Null
  }
  return $links
}

function Normalize-RootRelative([string]$fromDir, [string]$relativeTarget) {
  $full = Join-Path $fromDir $relativeTarget
  $fullResolved = (Resolve-Path -LiteralPath $full).Path
  if (-not $fullResolved.StartsWith($rootFull)) {
    return $null
  }
  return $fullResolved.Substring($rootFull.Length).TrimStart("\") -replace "\\", "/"
}

$specFiles = Get-ChildItem -LiteralPath (Join-Path $rootFull "specs") -Recurse -File -Filter "*.md"
$specs = @()

foreach ($file in $specFiles) {
  $platform = if ($file.FullName -match "\\specs\\mobile\\") { "mobile" } elseif ($file.FullName -match "\\specs\\desktop\\") { "desktop" } else { "unknown" }
  $id = if ($platform -eq "mobile") { "uiux-mobile" } elseif ($platform -eq "desktop") { "uiux-desktop" } else { ($file.BaseName -replace "[^a-zA-Z0-9-]", "-").ToLowerInvariant() }

  $links = Get-LinksFromMarkdown $file.FullName
  $assets = New-Object System.Collections.Generic.HashSet[string]
  $deps = New-Object System.Collections.Generic.HashSet[string]

  foreach ($link in $links) {
    $norm = Normalize-RootRelative $file.DirectoryName $link
    if ($null -eq $norm) { continue }
    if ($norm.StartsWith("assets/")) { $assets.Add($norm) | Out-Null }
    if ($norm.StartsWith("specs/")) {
      if ($norm -match "^specs/mobile/") { $deps.Add("uiux-mobile") | Out-Null }
      if ($norm -match "^specs/desktop/") { $deps.Add("uiux-desktop") | Out-Null }
    }
  }

  $specs += [pscustomobject]@{
    id = $id
    platform = $platform
    path = ($file.FullName.Substring($rootFull.Length).TrimStart("\") -replace "\\", "/")
    dependsOnSpecs = @($deps)
    referencesAssets = @($assets)
  }
}

$index = [pscustomobject]@{
  schemaVersion = 1
  root = "docs/especificacao-unificada"
  generatedAt = (Get-Date -Format "yyyy-MM-dd")
  specs = $specs
}

$index | ConvertTo-Json -Depth 50 | Set-Content -LiteralPath $outputFull -Encoding UTF8
Write-Host "OK"
