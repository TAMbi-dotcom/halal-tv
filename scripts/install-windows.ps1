<#
  Halal TV: install or update on an Android TV box from a Windows computer, in one go.

  What it does, in order (nothing else on the TV changes):
    1. Puts Google's own adb (platform-tools) in %LOCALAPPDATA%\HalalTV if it is not there yet.
    2. Connects to the TV over the network (port 5555). The TV asks "Allow USB debugging?" once:
       tick "Always allow" and press Allow.
    3. Installs Halal TV, or updates it in place. If the copy on the TV was signed with another key,
       it asks before removing it (its settings go with it).
    4. Makes Halal TV the home screen (the TV's own home stays installed) and opens it.

  Use:
    powershell -ExecutionPolicy Bypass -File install-windows.ps1 -Tv 192.168.1.111
    powershell -ExecutionPolicy Bypass -File install-windows.ps1 -Tv 192.168.1.111 -Apk C:\path\halal-tv-ontv.apk
  Without -Apk it downloads the latest release from GitHub.
  Undo: Settings, Apps, Halal TV, Uninstall on the TV.
#>
param(
  [string]$Tv = "",
  [string]$Apk = "",
  [string]$Repo = "TAMbi-dotcom/halal-tv"
)
$ErrorActionPreference = "Stop"
$Pkg = "dev.couchtv.ontv"
$Dir = Join-Path $env:LOCALAPPDATA "HalalTV"
New-Item -ItemType Directory -Force -Path $Dir | Out-Null

function Say($t) { Write-Host "  $t" }
function Step($t) { Write-Host ""; Write-Host "== $t" -ForegroundColor Cyan }

if (-not $Tv) { $Tv = Read-Host "IP address of the TV box (Settings, Network and Internet, your Wi-Fi)" }
if ($Tv -notmatch '^\d{1,3}(\.\d{1,3}){3}$') { throw "That does not look like an IP address: $Tv" }

Step "1. adb"
$Adb = (Get-Command adb -ErrorAction SilentlyContinue).Source
if (-not $Adb) {
  $Adb = Join-Path $Dir "platform-tools\adb.exe"
  if (-not (Test-Path $Adb)) {
    Say "Downloading Google platform-tools (about 10 MB)..."
    $zip = Join-Path $Dir "platform-tools.zip"
    Invoke-WebRequest "https://dl.google.com/android/repository/platform-tools-latest-windows.zip" -OutFile $zip
    Expand-Archive $zip $Dir -Force
    Remove-Item $zip
  }
}
Say "adb: $Adb"

Step "2. Connecting to $Tv"
& $Adb connect "${Tv}:5555" | Out-Host
$state = ""
for ($i = 0; $i -lt 30; $i++) {
  $line = (& $Adb devices) | Select-String "^$([regex]::Escape($Tv)):5555\s+(\S+)"
  $state = if ($line) { $line.Matches[0].Groups[1].Value } else { "" }
  if ($state -eq "device") { break }
  if ($state -eq "unauthorized" -and $i -eq 0) { Say "On the TV: tick 'Always allow from this computer' and press Allow." }
  if (-not $state) { & $Adb connect "${Tv}:5555" | Out-Null }
  Start-Sleep -Seconds 2
}
if ($state -ne "device") {
  throw "The TV did not let this computer in (state: '$state'). Check: TV on, same Wi-Fi, Developer options, USB debugging on, then run this again."
}
$model = (& $Adb -s "${Tv}:5555" shell getprop ro.product.model).Trim()
$ver = (& $Adb -s "${Tv}:5555" shell getprop ro.build.version.release).Trim()
Say "Connected: $model, Android $ver"

Step "3. Halal TV"
if (-not $Apk) {
  $Apk = Join-Path $Dir "halal-tv-ontv.apk"
  Say "Downloading the latest Halal TV from github.com/$Repo ..."
  Invoke-WebRequest "https://github.com/$Repo/releases/latest/download/halal-tv-ontv.apk" -OutFile $Apk
}
if (-not (Test-Path $Apk)) { throw "No app file at $Apk" }
$out = (& $Adb -s "${Tv}:5555" install -r "$Apk" 2>&1) -join "`n"
if ($out -match "INSTALL_FAILED_UPDATE_INCOMPATIBLE|signatures do not match") {
  Say "The Halal TV on the TV was signed with another key, so it cannot be updated in place."
  $yes = Read-Host "Remove it and install this one? Its settings on the TV go with it (y/N)"
  if ($yes -ne "y") { throw "Stopped. Nothing changed." }
  & $Adb -s "${Tv}:5555" uninstall $Pkg | Out-Host
  $out = (& $Adb -s "${Tv}:5555" install "$Apk" 2>&1) -join "`n"
}
if ($out -notmatch "Success") { throw "Install failed: $out" }
Say "Installed."

Step "4. Home screen"
& $Adb -s "${Tv}:5555" shell pm enable "$Pkg/.HomeAlias" | Out-Null
& $Adb -s "${Tv}:5555" shell cmd package set-home-activity "$Pkg/.HomeAlias" | Out-Host
& $Adb -s "${Tv}:5555" shell pm grant $Pkg android.permission.READ_TV_LISTINGS 2>$null | Out-Null
& $Adb -s "${Tv}:5555" shell am start -n "$Pkg/.SetupActivity" | Out-Null
Say "Done. On the TV: press Connect ADB in Halal TV (and Allow), then press Home."
Say "Undo: Settings, Apps, Halal TV, Uninstall."
