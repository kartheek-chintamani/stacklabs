# Run this in PowerShell as Administrator
# Right-click PowerShell -> Run as Administrator

Write-Host "Adding Windows Firewall rules for Node.js..." -ForegroundColor Yellow

# Find Node.js path
$nodePath = (Get-Command node).Path
Write-Host "Node.js path: $nodePath" -ForegroundColor Cyan

# Add outbound rule for Node.js
New-NetFirewallRule -DisplayName "Node.js Outbound" -Direction Outbound -Program $nodePath -Action Allow -Enabled True -Profile Any

Write-Host ""
Write-Host "✅ Firewall rule added!" -ForegroundColor Green
Write-Host ""
Write-Host "Now:"
Write-Host "1. Restart your Next.js dev server (Ctrl+C, then npm run dev)"
Write-Host "2. Test: http://localhost:3002/admin/topics"
Write-Host ""
pause
