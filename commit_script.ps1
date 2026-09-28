git add .gitignore
git commit -m "chore: add .gitignore"

git add package.json package-lock.json
git commit -m "chore: add package definitions"

$files = git ls-files --others --exclude-standard
$batchSize = 5
$counter = 0
$batchFiles = @()
$commitCount = 1

foreach ($file in $files) {
    $batchFiles += $file
    $counter++

    if ($counter -eq $batchSize) {
        foreach ($f in $batchFiles) {
            git add $f
        }
        git commit -m "feat: implement feature part $commitCount"
        $batchFiles = @()
        $counter = 0
        $commitCount++
    }
}

if ($batchFiles.Length -gt 0) {
    foreach ($f in $batchFiles) {
        git add $f
    }
    git commit -m "feat: implement feature part $commitCount"
}

git push -u origin master
