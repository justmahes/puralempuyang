param(
  [Parameter(Mandatory=$true)][string]$Path,
  [string]$Inner = 'word/document.xml',
  [string]$Out = ''
)

if (-not (Test-Path -LiteralPath $Path)) {
  Write-Error "File not found: $Path"
  exit 1
}

try {
  $ErrorActionPreference = 'Stop'
  $temp = Join-Path $env:TEMP ([System.IO.Path]::GetRandomFileName())
  New-Item -ItemType Directory -Path $temp | Out-Null
  $zipPath = $Path
  if (-not ($zipPath.ToLower().EndsWith('.zip'))) {
    $zipPath = Join-Path $temp 'doc.zip'
    Copy-Item -LiteralPath $Path -Destination $zipPath
  }
  Expand-Archive -LiteralPath $zipPath -DestinationPath $temp -Force
  $doc = Join-Path $temp $Inner
  if (-not (Test-Path -LiteralPath $doc)) {
    throw "Inner file not found: $Inner"
  }
  $content = Get-Content -Raw -LiteralPath $doc
  if ($Out) {
    Set-Content -Path $Out -Value $content -Encoding UTF8
  } else {
    $content | Write-Output
  }
} finally {
  if (Test-Path -LiteralPath $temp) { Remove-Item -Recurse -Force $temp }
}
