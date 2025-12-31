# Download official product images from novelexporters.com into public/assets/products
# Run from project root (PowerShell): ./scripts/download-products.ps1

$dest = "./public/assets/products"
if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force | Out-Null }

$images = @{
    "fresh-curry-leaves.jpg" = "https://novelexporters.com/images/fresh-curry-leaves.jpg"
    "dry-curry-leaves.jpg"   = "https://novelexporters.com/images/dry-curry-leaves.jpg"
    "curry-leaves-powder.jpg"= "https://novelexporters.com/images/curry-leaves-powder.jpg"
    "cinnamon.jpg"           = "https://novelexporters.com/images/cinnamon.jpg"
    "star-anise.jpg"         = "https://novelexporters.com/images/star-anise.jpg"
    "black-pepper.jpg"       = "https://novelexporters.com/images/black-pepper.jpg"
    "kapok-buds.jpg"        = "https://novelexporters.com/images/kapok-buds.jpg"
    "nutmeg.jpg"            = "https://novelexporters.com/images/nutmeg.jpg"
    "mace.jpg"              = "https://novelexporters.com/images/nutmeg-mace.jpg"
    "cardamom.jpg"          = "https://novelexporters.com/images/cardamom.jpg"
    "bay-leaves.jpg"        = "https://novelexporters.com/images/bay-leaves.jpg"
    "cloves.jpg"            = "https://novelexporters.com/images/cloves.jpg"
}

foreach ($file in $images.Keys) {
    $url = $images[$file]
    $out = Join-Path $dest $file
    Write-Output "Downloading $url -> $out"
    try {
        Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -ErrorAction Stop
    } catch {
        Write-Warning "Failed to download $url : $_"
    }
}

Write-Output "Done. Restart the dev server to see local images (they'll be served from /assets/products/)."