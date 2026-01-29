# Git Push Setup Script
# Replace YOUR_USERNAME with your actual GitHub username!

$githubUsername = Read-Host "Enter your GitHub username"
$repoName = Read-Host "Enter repository name (default: nexus-affiliate)"

if ([string]::IsNullOrEmpty($repoName)) {
    $repoName = "nexus-affiliate"
}

$repoUrl = "https://github.com/$githubUsername/$repoName.git"

Write-Host ""
Write-Host "Setting up Git remote..." -ForegroundColor Cyan
Write-Host "Repository URL: $repoUrl" -ForegroundColor Yellow
Write-Host ""

# Add remote
git remote add origin $repoUrl

# Verify remote was added
Write-Host "Remote configured:" -ForegroundColor Green
git remote -v

Write-Host ""
Write-Host "Now you can push with:" -ForegroundColor Cyan
Write-Host "  git push -u origin master" -ForegroundColor Yellow
Write-Host ""
