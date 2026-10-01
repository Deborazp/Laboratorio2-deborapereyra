Add-Type -AssemblyName System.Drawing

$outputPath = Join-Path $PSScriptRoot '..\assets\pampas-home.png'
$outputPath = [System.IO.Path]::GetFullPath($outputPath)
$bitmap = [System.Drawing.Bitmap]::new(1440, 740, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$sky = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
  [System.Drawing.Rectangle]::new(0, 0, 1440, 740),
  [System.Drawing.ColorTranslator]::FromHtml('#D8EEF0'),
  [System.Drawing.ColorTranslator]::FromHtml('#F8E8C7'),
  [single]90
)
$graphics.FillRectangle($sky, 0, 0, 1440, 740)
$sky.Dispose()

$glow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(48, 242, 201, 76))
$graphics.FillEllipse($glow, 795, 48, 370, 370)
$glow.Dispose()
$sun = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#F2C94C'))
$graphics.FillEllipse($sun, 865, 118, 230, 230)
$sun.Dispose()

$farHill = [System.Drawing.Drawing2D.GraphicsPath]::new()
$farHill.AddBezier(0, 405, 250, 365, 430, 420, 650, 392)
$farHill.AddBezier(650, 392, 890, 355, 1080, 424, 1440, 382)
$farHill.AddLine(1440, 740, 0, 740)
$farHill.CloseFigure()
$farBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#B7C99A'))
$graphics.FillPath($farBrush, $farHill)
$farBrush.Dispose()
$farHill.Dispose()

$middleHill = [System.Drawing.Drawing2D.GraphicsPath]::new()
$middleHill.AddBezier(0, 475, 270, 420, 420, 482, 710, 454)
$middleHill.AddBezier(710, 454, 980, 423, 1180, 485, 1440, 442)
$middleHill.AddLine(1440, 740, 0, 740)
$middleHill.CloseFigure()
$middleBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#829B63'))
$graphics.FillPath($middleBrush, $middleHill)
$middleBrush.Dispose()
$middleHill.Dispose()

$frontHill = [System.Drawing.Drawing2D.GraphicsPath]::new()
$frontHill.AddBezier(0, 555, 260, 500, 520, 580, 780, 542)
$frontHill.AddBezier(780, 542, 1030, 505, 1240, 572, 1440, 520)
$frontHill.AddLine(1440, 740, 0, 740)
$frontHill.CloseFigure()
$frontBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#496B46'))
$graphics.FillPath($frontBrush, $frontHill)
$frontBrush.Dispose()
$frontHill.Dispose()

function Draw-Ombu($graphics, $centerX, $groundY, $scale, $canopyColor, $trunkColor) {
  $trunk = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($trunkColor))
  $graphics.FillRectangle($trunk, [single]($centerX - 15 * $scale), [single]($groundY - 112 * $scale), [single](30 * $scale), [single](116 * $scale))
  $graphics.FillPolygon($trunk, [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new([single]($centerX - 7 * $scale), [single]($groundY - 90 * $scale)),
    [System.Drawing.PointF]::new([single]($centerX - 78 * $scale), [single]($groundY - 170 * $scale)),
    [System.Drawing.PointF]::new([single]($centerX - 61 * $scale), [single]($groundY - 177 * $scale)),
    [System.Drawing.PointF]::new([single]($centerX + 1 * $scale), [single]($groundY - 112 * $scale)),
    [System.Drawing.PointF]::new([single]($centerX + 69 * $scale), [single]($groundY - 184 * $scale)),
    [System.Drawing.PointF]::new([single]($centerX + 84 * $scale), [single]($groundY - 172 * $scale)),
    [System.Drawing.PointF]::new([single]($centerX + 8 * $scale), [single]($groundY - 86 * $scale))
  ))
  $trunk.Dispose()

  $canopy = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($canopyColor))
  $lobes = @(
    @(-97, -206, 157, 109),
    @(-39, -243, 161, 127),
    @(31, -214, 135, 99),
    @(-134, -173, 133, 78),
    @(61, -171, 116, 78)
  )
  foreach ($lobe in $lobes) {
    $graphics.FillEllipse(
      $canopy,
      [single]($centerX + $lobe[0] * $scale),
      [single]($groundY + $lobe[1] * $scale),
      [single]($lobe[2] * $scale),
      [single]($lobe[3] * $scale)
    )
  }
  $canopy.Dispose()
}

Draw-Ombu $graphics 420 690 0.86 '#315C42' '#6B5743'
Draw-Ombu $graphics 1015 682 1.16 '#234E3A' '#604C3A'

$grass = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#A4A568'), 3)
foreach ($x in @(75, 122, 188, 276, 346, 555, 650, 749, 1176, 1260, 1350)) {
  $graphics.DrawLine($grass, [single]$x, 690, [single]($x - 12), 644)
  $graphics.DrawLine($grass, [single]($x + 3), 691, [single]($x + 16), 651)
}
$grass.Dispose()

$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()
