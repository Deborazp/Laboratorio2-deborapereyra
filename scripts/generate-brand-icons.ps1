Add-Type -AssemblyName System.Drawing

$assetDirectory = Join-Path $PSScriptRoot '..\assets'
$assetDirectory = [System.IO.Path]::GetFullPath($assetDirectory)
$size = 1024

function New-Graphics($bitmap, $clearColor) {
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear($clearColor)
  return $graphics
}

function Fill-Polygon($graphics, $color, $coordinates) {
  $points = [System.Collections.Generic.List[System.Drawing.PointF]]::new()
  for ($index = 0; $index -lt $coordinates.Count; $index += 2) {
    $points.Add([System.Drawing.PointF]::new([single]$coordinates[$index], [single]$coordinates[$index + 1]))
  }
  $brush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($color))
  $graphics.FillPolygon($brush, $points.ToArray())
  $brush.Dispose()
}

function Draw-Pine($graphics, $centerX, $topY, $scale, $color, $trunkColor = '#755439') {
  $layers = @(
    @(0, 0, -46, 68, 46, 68),
    @(0, 42, -78, 150, 78, 150),
    @(0, 94, -112, 238, 112, 238)
  )
  foreach ($layer in $layers) {
    $coordinates = @()
    for ($index = 0; $index -lt $layer.Count; $index += 2) {
      $coordinates += ($centerX + $layer[$index] * $scale)
      $coordinates += ($topY + $layer[$index + 1] * $scale)
    }
    Fill-Polygon $graphics $color $coordinates
  }
  $trunk = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($trunkColor))
  $graphics.FillRectangle($trunk, [single]($centerX - 13 * $scale), [single]($topY + 225 * $scale), [single](26 * $scale), [single](63 * $scale))
  $trunk.Dispose()
}

function Draw-Logo($graphics, $drawCircle, $scale) {
  if ($drawCircle) {
    $circleBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#F2C94C'))
    $diameter = 820 * $scale
    $origin = (1024 - 820) / 2
    $scaledOrigin = 512 + ($origin - 512) * $scale
    $graphics.FillEllipse($circleBrush, [single]$scaledOrigin, [single]$scaledOrigin, [single]$diameter, [single]$diameter)
    $circleBrush.Dispose()
  }
  Draw-Pine $graphics (512 + (405 - 512) * $scale) (512 + (340 - 512) * $scale) $scale '#4B8F5A'
  Draw-Pine $graphics (512 + (620 - 512) * $scale) (512 + (250 - 512) * $scale) $scale '#155C45'
}

$iconBitmap = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$iconGraphics = New-Graphics $iconBitmap ([System.Drawing.ColorTranslator]::FromHtml('#F4F5EF'))
Draw-Logo $iconGraphics $true 1
$iconBitmap.Save((Join-Path $assetDirectory 'icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$iconGraphics.Dispose()
$iconBitmap.Dispose()

$foregroundBitmap = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$foregroundGraphics = New-Graphics $foregroundBitmap ([System.Drawing.Color]::Transparent)
Draw-Logo $foregroundGraphics $true 0.72
$foregroundBitmap.Save((Join-Path $assetDirectory 'android-icon-foreground.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$foregroundGraphics.Dispose()
$foregroundBitmap.Dispose()

$monochromeBitmap = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$monochromeGraphics = New-Graphics $monochromeBitmap ([System.Drawing.Color]::Transparent)
Draw-Pine $monochromeGraphics (512 + (405 - 512) * 0.72) (512 + (340 - 512) * 0.72) 0.72 '#FFFFFF' '#FFFFFF'
Draw-Pine $monochromeGraphics (512 + (620 - 512) * 0.72) (512 + (250 - 512) * 0.72) 0.72 '#FFFFFF' '#FFFFFF'
$monochromeBitmap.Save((Join-Path $assetDirectory 'android-icon-monochrome.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$monochromeGraphics.Dispose()
$monochromeBitmap.Dispose()

$faviconBitmap = [System.Drawing.Bitmap]::new(64, 64, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$faviconGraphics = New-Graphics $faviconBitmap ([System.Drawing.ColorTranslator]::FromHtml('#F4F5EF'))
$faviconGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$faviconGraphics.FillEllipse([System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#F2C94C')), 4, 4, 56, 56)
Draw-Pine $faviconGraphics 25 21 0.055 '#4B8F5A'
Draw-Pine $faviconGraphics 39 16 0.055 '#155C45'
$faviconBitmap.Save((Join-Path $assetDirectory 'favicon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$faviconGraphics.Dispose()
$faviconBitmap.Dispose()
