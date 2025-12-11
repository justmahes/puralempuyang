param(
  [Parameter(Mandatory=$true)][string]$Path
)

if (-not (Test-Path -LiteralPath $Path)) {
  Write-Error "File not found: $Path"
  exit 1
}

$ErrorActionPreference = 'Stop'

# Use helper to extract document.xml to temp
$temp = Join-Path $env:TEMP ([System.IO.Path]::GetRandomFileName())
New-Item -ItemType Directory -Path $temp | Out-Null
try {
  $zipPath = $Path
  if (-not ($zipPath.ToLower().EndsWith('.zip'))) {
    $zipPath = Join-Path $temp 'doc.zip'
    Copy-Item -LiteralPath $Path -Destination $zipPath
  }
  Expand-Archive -LiteralPath $zipPath -DestinationPath $temp -Force
  $doc = Join-Path $temp 'word/document.xml'
  if (-not (Test-Path -LiteralPath $doc)) { throw 'document.xml not found' }

  [xml]$x = Get-Content -Raw -LiteralPath $doc
  $ns = New-Object System.Xml.XmlNamespaceManager($x.NameTable)
  $ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')

  $paras = $x.SelectNodes('//w:body/w:p',$ns)
  foreach ($p in $paras) {
    $texts = $p.SelectNodes('.//w:t',$ns) | ForEach-Object { $_.'#text' }
    $line = ($texts -join '')
    if ($line -match '\S') { $line } else { '' }
  }
}
finally {
  if (Test-Path -LiteralPath $temp) { Remove-Item -Recurse -Force $temp }
}

