# Run this as Administrator to temporarily disable firewall for testing
# Right-click PowerShell -> Run as Administrator

Write-Host "Disabling Windows Firewall temporarily..." -ForegroundColor Yellow

# Disable all firewall profiles
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

Write-Host "✅ Firewall disabled!" -ForegroundColor Green
Write-Host ""
Write-Host "Now test your connections:" -ForegroundColor Cyan
Write-Host "1. ping github.com" -ForegroundColor White
Write-Host "2. git push -u origin master" -ForegroundColor White
Write-Host "3. npm run dev (in project folder)" -ForegroundColor White
Write-Host ""
Write-Host "When done testing, re-enable with:" -ForegroundColor Yellow
Write-Host "Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True" -ForegroundColor White
Write-Host ""
pause
