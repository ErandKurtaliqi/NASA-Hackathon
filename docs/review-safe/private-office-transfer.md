# Private E/F transfer plan

`814d044` (Mars Stories E) and `44e6a65` (Apollo 16 F) remain absent as Git objects in HOME, even after inspecting the new remote master. They are not reconstructed from PDFs, nor are complete commits mixed into the secure review.

A bundle contains objects and history, possibly audio/PDF, and historical credentials: **is not encrypted**. Do not upload to GitHub, attach to a PR, place in `public/`, an open link, or an XAMPP folder. Use an authenticated/encrypted private method approved by the responsible. This document does not authorize sending originals to a specific repository.

## OFFICE: produce a copy without changing worktrees

In PowerShell, replace the repository path with the confirmed real OFFICE path. Do not assume it matches HOME. Commands do not change branches or include uncommitted files.

```powershell
$officeRepo = 'ACTUAL_OFFICE_REPOSITORY_PATH'
git -C $officeRepo status --short --branch
git -C $officeRepo worktree list
git -C $officeRepo cat-file -e '814d044^{commit}'
if ($LASTEXITCODE -ne 0) { throw 'Mars E is unavailable. Stop the transfer.' }
git -C $officeRepo cat-file -e '44e6a65^{commit}'
if ($LASTEXITCODE -ne 0) { throw 'Apollo 16 F is unavailable. Stop the transfer.' }
git -C $officeRepo rev-parse '814d044^{commit}' '44e6a65^{commit}'
```

Record each 40-character commit hash, its parents, author, date, and `git show --stat` output. Check for uncommitted work and back it up separately before any changes. The bundle excludes uncommitted work. Inspect the incoming commit range for media and secrets, and preserve the original authorship.

Create new references, without `-f`; if they already exist, stop and compare, do not overwrite:

```powershell
git -C $officeRepo show-ref --verify --quiet refs/heads/transfer/office-e
if ($LASTEXITCODE -eq 0) { throw 'The E ref already exists. Review it first.' }
git -C $officeRepo show-ref --verify --quiet refs/heads/transfer/office-f
if ($LASTEXITCODE -eq 0) { throw 'The F ref already exists. Review it first.' }
git -C $officeRepo branch transfer/office-e 814d044
if ($LASTEXITCODE -ne 0) { throw 'Could not create the E ref' }
git -C $officeRepo branch transfer/office-f 44e6a65
if ($LASTEXITCODE -ne 0) { throw 'Could not create the F ref' }

$transferRoot = $env:AURORALYS_PRIVATE_TRANSFER_DIR
if (-not $transferRoot) { throw 'Set AURORALYS_PRIVATE_TRANSFER_DIR to a private external directory' }
if (-not (Test-Path -LiteralPath $transferRoot)) {
  New-Item -ItemType Directory -Path $transferRoot | Out-Null
}
$bundlePath = Join-Path $transferRoot 'office-E-F.bundle'
if (Test-Path -LiteralPath $bundlePath) { throw 'The bundle already exists. Do not overwrite it.' }
git -C $officeRepo bundle create $bundlePath transfer/office-e transfer/office-f
if ($LASTEXITCODE -ne 0) { throw 'Bundle creation failed' }
git -C $officeRepo bundle verify $bundlePath
if ($LASTEXITCODE -ne 0) { throw 'Invalid bundle' }
git -C $officeRepo bundle list-heads $bundlePath
Get-FileHash -LiteralPath $bundlePath -Algorithm SHA256
```

This self-contained bundle retains the closure of the ancestors of those two refs; it does not use `--all`, but it may include shared history and means. It is not assumed that `e9573da` is an ancestor of E/F nor is an unknown base for saving size excluded. If you want an incremental bundle, first agree on prerequisite hashes and verify them on both teams; do not improvise exclusions.

Transfer the file through the approved private channel. Confirm SHA256 and hashes E/F by an authenticated channel independent of the file itself. No password or token is written in published commands or in this documentation.

## HOME: check separately quarantined

First check SHA256 against the reported value and the two full heads with `git bundle list-heads`. Do not import if they differ. The following folder should be new and out of the webroot:

```powershell
$homeRepo = $env:AURORALYS_HOME_REPO
if (-not $homeRepo) { throw 'Set AURORALYS_HOME_REPO' }
$transferRoot = $env:AURORALYS_PRIVATE_TRANSFER_DIR
if (-not $transferRoot) { throw 'Set AURORALYS_PRIVATE_TRANSFER_DIR' }
$bundlePath = Join-Path $transferRoot 'office-E-F.bundle'
$expectedSha256 = 'SHA256_CONFIRMADO_POR_EL_EQUIPO'
if ((Get-FileHash -LiteralPath $bundlePath -Algorithm SHA256).Hash -ne $expectedSha256) {
  throw 'Bundle hash does not match'
}
git -C $homeRepo bundle verify $bundlePath
if ($LASTEXITCODE -ne 0) { throw 'Invalid bundle or missing prerequisites' }
git -C $homeRepo bundle list-heads $bundlePath

$quarantineRepo = Join-Path $transferRoot 'office-quarantine.git'
if (Test-Path -LiteralPath $quarantineRepo) { throw 'The quarantine repository already exists. Do not overwrite it.' }
git init --bare $quarantineRepo
if ($LASTEXITCODE -ne 0) { throw 'Could not create the quarantine repository' }
git -C $quarantineRepo fetch --no-tags $bundlePath 'refs/heads/transfer/office-e:refs/heads/incoming/office-e'
if ($LASTEXITCODE -ne 0) { throw 'Import for E failed' }
git -C $quarantineRepo fetch --no-tags $bundlePath 'refs/heads/transfer/office-f:refs/heads/incoming/office-f'
if ($LASTEXITCODE -ne 0) { throw 'Import for F failed' }
git -C $quarantineRepo rev-parse refs/heads/incoming/office-e refs/heads/incoming/office-f
```

Compare those two complete hashes to those of OFFICE. Review `git log`, parents, `git diff --name-status`, manifests, IDs, assets, licenses, installation/hooks scripts, dependencies, store and GIS changes before running code or installing dependencies. Do not use `git clone --shared`, copy `.git` over the project, or execute code received as an automatic confidence test.

Only after reviewing and approving content, new refs can be imported to the local development repository, without touching its current branches:

```powershell
git -C $homeRepo show-ref --verify --quiet refs/incoming/office-e
if ($LASTEXITCODE -eq 0) { throw 'The local E ref already exists. Review it first.' }
git -C $homeRepo show-ref --verify --quiet refs/incoming/office-f
if ($LASTEXITCODE -eq 0) { throw 'The local F ref already exists. Review it first.' }
git -C $homeRepo fetch --no-tags --no-write-fetch-head $quarantineRepo 'refs/heads/incoming/office-e:refs/incoming/office-e'
if ($LASTEXITCODE -ne 0) { throw 'Local import for E failed' }
git -C $homeRepo fetch --no-tags --no-write-fetch-head $quarantineRepo 'refs/heads/incoming/office-f:refs/incoming/office-f'
if ($LASTEXITCODE -ne 0) { throw 'Local import for F failed' }
```

The fetch brings objects, does not modify worktrees files or integrates code. Do not include those refs in a generic push. A future review may open new worktrees detached on non-existent routes outside the webroot; the current ones are not reused or deleted. There is no Merge, cherry pick or overbase authorized for final integration at this stage.

## Contracts to be reviewed before joining

- Apollo 16: real story/hardware record, five chapters, correct LRV identity, quiz/reward, 18 MP3 and scripts, permissions, package hashes comparison and voice lifecycle. Don't invent IDs before reading F.
- Mars E: Sojourner, Opportunity and Viking 1, each identity/real category; original chapters, fonts and assets, available narrative, maybe/progress and possible common dependencies. Viking 1 is lander, not rover.
- Ingenuity: wait approved package; your informative profile does not show a story implemented. Keep helicopter identity.
- Do not reintroduce Perseverance to the final catalogue. Keep your records of progress and historical evidence. Erand must agree to the filter of atlas/pins and credits; do not delete Jezero or scientific coordinates.
- Separately review the remote camera/animation master `095cd1b`, without mixing it with E/F or assuming the GIS contract. Protected integration did not move.
- Run suites by deployment and combined, without adding independent counts; then real QA browser/audio. Do not post new originals or bundle to GitHub without specific destination authorization.
