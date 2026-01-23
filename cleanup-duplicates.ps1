# 重複ファイル削除スクリプト
$baseDir = "c:\Users\dayet\OneDrive\安積自然農園ホームページ"
Set-Location $baseDir

Write-Host "=== 重複ファイル削除開始 ===" -ForegroundColor Green

# products.htmlをリダイレクトに置き換え
if (Test-Path "products-new.html") {
    Remove-Item "products.html" -Force -ErrorAction SilentlyContinue
    Move-Item "products-new.html" "products.html" -Force
    Write-Host "✓ products.htmlをリダイレクトに変換" -ForegroundColor Green
}

# store-*.html ファイルを削除
$storeFiles = Get-ChildItem -Filter "store-*.html"
Write-Host "`n削除対象: $($storeFiles.Count)個のstore-*.htmlファイル" -ForegroundColor Yellow

foreach ($file in $storeFiles) {
    Remove-Item $file.FullName -Force
    Write-Host "  削除: $($file.Name)"
}

Write-Host "`n✓ store-*.html 削除完了: $($storeFiles.Count)個" -ForegroundColor Green

# 不要な一時ファイルも削除
$tempFiles = @("products-redirect.html", "shop-redirect.html", "shop-old.html")
foreach ($temp in $tempFiles) {
    if (Test-Path $temp) {
        Remove-Item $temp -Force -ErrorAction SilentlyContinue
        Write-Host "✓ 一時ファイル削除: $temp" -ForegroundColor Green
    }
}

Write-Host "`n=== 削除完了 ===" -ForegroundColor Green
Write-Host "次のコマンドでGitにコミットしてください:"
Write-Host "git add ."
Write-Host 'git commit -m "重複ファイル削除完了"'
