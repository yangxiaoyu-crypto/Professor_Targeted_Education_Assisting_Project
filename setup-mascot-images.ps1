# 吉祥物图片自动设置脚本
# 使用方法：在 PowerShell 中运行此脚本

param(
    [string]$SourceFolder = "$env:USERPROFILE\Downloads",
    [string]$DestFolder = "d:\Users\53207\Desktop\public_20251031\public\public\images"
)

Write-Host "🎭 吉祥物图片自动设置脚本" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查目标文件夹是否存在
if (-not (Test-Path $DestFolder)) {
    Write-Host "创建目标文件夹..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $DestFolder | Out-Null
    Write-Host "✅ 文件夹已创建" -ForegroundColor Green
}

# 定义图片映射关系
$imageMappings = @{
    "Image1" = "mascot-welcome.png"
    "Image2" = "mascot-thinking.png"
    "Image3" = "mascot-success.png"
    "Image4" = "mascot-help.png"
    "Image5" = "mascot-error.png"
}

Write-Host "📁 源文件夹: $SourceFolder" -ForegroundColor Gray
Write-Host "📁 目标文件夹: $DestFolder" -ForegroundColor Gray
Write-Host ""

# 检查源文件夹中的图片
$foundImages = @{}
$missingImages = @()

foreach ($mapping in $imageMappings.GetEnumerator()) {
    $searchPattern = "$($mapping.Key)*"
    $files = Get-ChildItem -Path $SourceFolder -Filter "$searchPattern.png" -ErrorAction SilentlyContinue
    
    if ($files) {
        $foundImages[$mapping.Key] = $files[0].FullName
        Write-Host "✅ 找到: $($mapping.Key) → $($files[0].Name)" -ForegroundColor Green
    } else {
        $missingImages += $mapping.Key
        Write-Host "❌ 未找到: $($mapping.Key)" -ForegroundColor Red
    }
}

Write-Host ""

if ($missingImages.Count -gt 0) {
    Write-Host "⚠️  以下图片未找到，请检查文件名：" -ForegroundColor Yellow
    $missingImages | ForEach-Object { Write-Host "   • $_" }
    Write-Host ""
    Write-Host "💡 提示：" -ForegroundColor Cyan
    Write-Host "   1. 确保图片在: $SourceFolder" -ForegroundColor Cyan
    Write-Host "   2. 文件名应为: Image1.png, Image2.png, Image3.png, Image4.png, Image5.png" -ForegroundColor Cyan
    Write-Host "   3. 或指定源文件夹: .\setup-mascot-images.ps1 -SourceFolder 'C:\Your\Path'" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "是否继续复制已找到的图片? (y/n)"
    if ($continue -ne 'y') {
        Write-Host "已取消" -ForegroundColor Yellow
        exit
    }
}

# 复制文件
Write-Host "📋 开始复制文件..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($mapping in $imageMappings.GetEnumerator()) {
    $sourceFile = $foundImages[$mapping.Key]
    $destFile = Join-Path $DestFolder $mapping.Value
    
    if ($sourceFile) {
        try {
            Copy-Item -Path $sourceFile -Destination $destFile -Force
            Write-Host "✅ 已复制: $($mapping.Key) → $($mapping.Value)" -ForegroundColor Green
            $successCount++
        } catch {
            Write-Host "❌ 复制失败: $($mapping.Key)" -ForegroundColor Red
            Write-Host "   错误: $_" -ForegroundColor Red
            $failCount++
        }
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📊 复制结果：" -ForegroundColor Cyan
Write-Host "   成功: $successCount" -ForegroundColor Green
Write-Host "   失败: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

# 验证文件
Write-Host "🔍 验证已保存的文件..." -ForegroundColor Cyan
$savedFiles = Get-ChildItem -Path $DestFolder -Filter "mascot-*.png" -ErrorAction SilentlyContinue

if ($savedFiles.Count -eq 5) {
    Write-Host "✅ 所有 5 个文件已成功保存！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 已保存的文件：" -ForegroundColor Cyan
    $savedFiles | ForEach-Object { Write-Host "   • $($_.Name)" -ForegroundColor Green }
} else {
    Write-Host "⚠️  只找到 $($savedFiles.Count) 个文件，期望 5 个" -ForegroundColor Yellow
    if ($savedFiles.Count -gt 0) {
        Write-Host ""
        Write-Host "📝 已保存的文件：" -ForegroundColor Cyan
        $savedFiles | ForEach-Object { Write-Host "   • $($_.Name)" -ForegroundColor Green }
    }
}

Write-Host ""
Write-Host "🚀 下一步：" -ForegroundColor Cyan
Write-Host "   1. 刷新浏览器 (F5 或 Ctrl+R)" -ForegroundColor Cyan
Write-Host "   2. 查看首页和菜单栏的新吉祥物" -ForegroundColor Cyan
Write-Host "   3. 点击吉祥物测试交互效果" -ForegroundColor Cyan
Write-Host ""

Read-Host "按 Enter 键退出"
