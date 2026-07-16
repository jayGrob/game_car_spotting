# Generates the PWA launcher icons (public/icons/icon-192.png, icon-512.png).
# Simple flat "car" mark on the app's blue so no external tooling is needed.
Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot "..\public\icons"
New-Item -ItemType Directory -Force $outDir | Out-Null

foreach ($size in @(192, 512)) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $blue = [System.Drawing.Color]::FromArgb(255, 37, 99, 235)
    $dark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 30, 41, 59))
    $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $blueBrush = New-Object System.Drawing.SolidBrush($blue)

    $g.Clear($blue)
    $s = $size / 512.0

    # Cabin
    $g.FillEllipse($white, [float](128 * $s), [float](144 * $s), [float](256 * $s), [float](160 * $s))
    # Body
    $g.FillRectangle($white, [float](96 * $s), [float](224 * $s), [float](320 * $s), [float](96 * $s))
    $g.FillEllipse($white, [float](56 * $s), [float](224 * $s), [float](96 * $s), [float](96 * $s))
    $g.FillEllipse($white, [float](360 * $s), [float](224 * $s), [float](96 * $s), [float](96 * $s))
    # Window divider
    $g.FillRectangle($blueBrush, [float](246 * $s), [float](168 * $s), [float](20 * $s), [float](60 * $s))
    # Wheels
    $g.FillEllipse($dark, [float](128 * $s), [float](288 * $s), [float](88 * $s), [float](88 * $s))
    $g.FillEllipse($dark, [float](296 * $s), [float](288 * $s), [float](88 * $s), [float](88 * $s))
    $g.FillEllipse($white, [float](154 * $s), [float](314 * $s), [float](36 * $s), [float](36 * $s))
    $g.FillEllipse($white, [float](322 * $s), [float](314 * $s), [float](36 * $s), [float](36 * $s))

    $out = Join-Path $outDir "icon-$size.png"
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
    Write-Host "  ok $out"
}
