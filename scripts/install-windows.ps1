<#
  Halal TV: install or update on an Android TV box from a Windows computer, in one go.

  What it does, in order (nothing else on the TV changes):
    1. Puts Google's own adb (platform-tools) in %LOCALAPPDATA%\HalalTV if it is not there yet.
    2. Finds the TV on your Wi-Fi by itself (or takes -Tv), then connects over the network (port
       5555). The TV asks "Allow USB debugging?" once: tick "Always allow" and press Allow.
    3. Installs Halal TV, or updates it in place. If the copy on the TV was signed with another key,
       it asks before removing it (its settings go with it).
    4. Makes Halal TV the home screen (the TV's own home stays installed), lets it show the
       prayer-time card over other apps, and opens it.

  Use:
    powershell -ExecutionPolicy Bypass -File install-windows.ps1
    powershell -ExecutionPolicy Bypass -File install-windows.ps1 -Apk C:\path\halal-tv-ontv.apk
    powershell -ExecutionPolicy Bypass -File install-windows.ps1 -Tv 192.168.1.111   (skip the search)
  Without -Apk it downloads the latest release from GitHub.
  Undo: Settings, Apps, Halal TV, Uninstall on the TV.
#>
param(
  [string]$Tv = "",
  [string]$Apk = "",
  [string]$Repo = "TAMbi-dotcom/halal-tv"
)
$ErrorActionPreference = "Stop"

# Run adb and return everything it printed as text. Windows PowerShell 5.1 turns anything a program
# writes to stderr into a terminating error under "Stop", so adb's own messages (such as a signature
# mismatch) are read here with errors relaxed for that one call.
function AdbText {
  $old = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try { return ((& $Adb @args 2>&1) | ForEach-Object { "$_" }) -join "`n" }
  finally { $ErrorActionPreference = $old }
}
$Pkg = "org.halaltv.tv"
$OldPkg = "dev.couchtv.ontv"   # test builds before 14 November 2026
$Cls = "dev.couchtv.ontv"      # the code's own namespace, used in component names
$Dir = Join-Path $env:LOCALAPPDATA "HalalTV"
New-Item -ItemType Directory -Force -Path $Dir | Out-Null

function Say($t) { Write-Host "  $t" }
function Step($t) { Write-Host ""; Write-Host "== $t" -ForegroundColor Cyan }

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

# ---- Finding the TV ------------------------------------------------------------------------------
# Looks on this computer's own home network (the one with a router), at every address of its /24:
# port 5555 is ADB (debugging on), 8008 and 8009 are Google Cast, which every Android TV and Google TV
# answers even with debugging off. Only connects, never sends anything to the TV but a Cast name query.
$LastFile = Join-Path $Dir "last-tv.txt"
function LocalAddresses {
  $a = @()
  try {
    $a = Get-NetIPConfiguration -ErrorAction Stop |
      Where-Object { $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq "Up" } |
      ForEach-Object { $_.IPv4Address.IPAddress }
  } catch { }
  if (-not $a) {
    $a = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) |
      Where-Object { $_.AddressFamily -eq "InterNetwork" } | ForEach-Object { $_.ToString() }
  }
  $a | Where-Object { $_ -and $_ -notmatch '^(127\.|169\.254\.)' } | Select-Object -Unique
}
function OpenPorts($ips, $ports, $ms) {
  $tries = foreach ($ip in $ips) { foreach ($p in $ports) {
    $c = New-Object System.Net.Sockets.TcpClient
    [pscustomobject]@{ Ip = $ip; Port = $p; Client = $c; Task = $c.ConnectAsync($ip, $p) }
  } }
  $until = (Get-Date).AddMilliseconds($ms)
  while ((Get-Date) -lt $until -and ($tries | Where-Object { -not $_.Task.IsCompleted })) { Start-Sleep -Milliseconds 50 }
  $open = @($tries | Where-Object { $_.Task.Status -eq "RanToCompletion" -and $_.Client.Connected } | ForEach-Object { [pscustomobject]@{ Ip = $_.Ip; Port = $_.Port } })
  foreach ($t in $tries) { try { $t.Client.Close() } catch { } }
  return $open
}
function CastName($ip) {
  try { return (Invoke-RestMethod "http://${ip}:8008/setup/eureka_info?params=name" -TimeoutSec 2).name } catch { return "" }
}
function FindTv {
  $mine = @(LocalAddresses)
  if (-not $mine) { return "" }
  $ips = @()
  foreach ($m in $mine) { $b = $m -replace '\.\d+$', ''; $ips += 1..254 | ForEach-Object { "$b.$_" } | Where-Object { $_ -ne $m } }
  $ips = $ips | Select-Object -Unique
  Say "Looking for TVs on $((($mine | ForEach-Object { ($_ -replace '\.\d+$', '.x') }) -join ', '))..."
  $open = OpenPorts $ips @(5555, 8008, 8009) 2500
  # Android 11+ "Wireless debugging" announces itself; adb lists it (it needs pairing first).
  $wireless = @{}
  foreach ($l in ((AdbText mdns services) -split "`n")) {
    if ($l -match '_adb-tls-connect\._tcp\.?\s+(\d+\.\d+\.\d+\.\d+):(\d+)') { $wireless[$Matches[1]] = $Matches[2] }
  }
  $found = @()
  foreach ($ip in (@($open | ForEach-Object { $_.Ip }) + @($wireless.Keys) | Select-Object -Unique)) {
    $ports = @($open | Where-Object { $_.Ip -eq $ip } | ForEach-Object { $_.Port })
    $cast = ($ports -contains 8008) -or ($ports -contains 8009)
    $hasAdb = $ports -contains 5555
    if (-not ($hasAdb -or $cast -or $wireless.ContainsKey($ip))) { continue }
    $name = if ($ports -contains 8008) { CastName $ip } else { "" }
    $found += [pscustomobject]@{ Ip = $ip; Name = $name; Adb = $hasAdb; Cast = $cast; Wireless = $wireless.ContainsKey($ip) }
  }
  $found = @($found | Sort-Object @{ Expression = { -not $_.Adb } }, @{ Expression = { [version]$_.Ip } })
  if (-not $found) {
    Say "No TV found. Check: the TV is on (not asleep), on the same Wi-Fi as this computer (not a guest"
    Say "network), and Developer options and USB debugging are on (Settings, Device Preferences, About:"
    Say "press Build 7 times, then Developer options, USB debugging)."
    return (Read-Host "Type the TV's IP address yourself (Settings, Network and Internet, your Wi-Fi), or Enter to stop")
  }
  Say "Found:"
  for ($i = 0; $i -lt $found.Count; $i++) {
    $f = $found[$i]
    $what = if ($f.Adb) { "ready (debugging on)" } elseif ($f.Wireless) { "only Wireless debugging: needs pairing, see on-tv/README.md" } else { "Android TV / Cast device, debugging off" }
    $label = if ($f.Name) { "$($f.Name), " } else { "" }
    Say ("  {0}) {1}  {2}{3}" -f ($i + 1), $f.Ip, $label, $what)
  }
  $ready = @($found | Where-Object { $_.Adb })
  if ($found.Count -eq 1 -and $ready.Count -eq 1) {
    $yes = Read-Host "Install on $($found[0].Ip)? (Y/n)"
    if ($yes -eq "" -or $yes -match '^[yY]') { return $found[0].Ip } else { return "" }
  }
  $pick = Read-Host "Number of the TV (or its IP address)"
  if ($pick -match '^\d+$' -and [int]$pick -ge 1 -and [int]$pick -le $found.Count) {
    $f = $found[[int]$pick - 1]
    if (-not $f.Adb) {
      Say "On that TV switch on Developer options and USB debugging first:"
      Say "Settings, Device Preferences (or System), About: press Build 7 times; then Developer options, USB debugging."
      Read-Host "Press Enter when it is on" | Out-Null
    }
    return $f.Ip
  }
  return $pick
}

if (-not $Tv -and (Test-Path $LastFile)) {
  $last = (Get-Content $LastFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  if ($last -and (OpenPorts @($last) @(5555) 1500)) { Say "Using the TV from last time: $last (pass -Tv to choose another)"; $Tv = $last }
}
if (-not $Tv) { Step "2. Finding the TV"; $Tv = FindTv }
if (-not $Tv) { throw "Stopped: no TV chosen." }
if ($Tv -notmatch '^\d{1,3}(\.\d{1,3}){3}$') { throw "That does not look like an IP address: $Tv" }

Step "3. Connecting to $Tv"
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
Set-Content -Path $LastFile -Value $Tv

Step "4. Halal TV"
if (-not $Apk) {
  $Apk = Join-Path $Dir "halal-tv-ontv.apk"
  Say "Downloading the newest Halal TV from github.com/$Repo ..."
  # The releases list, newest first, includes the beta (pre-)releases that /releases/latest skips.
  $rel = Invoke-RestMethod "https://api.github.com/repos/$Repo/releases?per_page=10" -Headers @{ "User-Agent" = "halal-tv-installer" }
  $asset = $rel | ForEach-Object { $_.assets } | Where-Object { $_.name -eq "halal-tv-ontv.apk" } | Select-Object -First 1
  if (-not $asset) { throw "No Halal TV release found on github.com/$Repo. Download halal-tv-ontv.apk yourself and pass -Apk." }
  Say "Version: $(($rel | Where-Object { $_.assets.name -contains 'halal-tv-ontv.apk' } | Select-Object -First 1).tag_name)"
  Invoke-WebRequest $asset.browser_download_url -OutFile $Apk
}
if (-not (Test-Path $Apk)) { throw "No app file at $Apk" }
$out = AdbText -s "${Tv}:5555" install -r "$Apk"
if ($out -match "INSTALL_FAILED_UPDATE_INCOMPATIBLE|signatures do not match") {
  Say "The Halal TV on the TV was signed with another key, so it cannot be updated in place."
  $yes = Read-Host "Remove it and install this one? Its settings on the TV go with it (y/N)"
  if ($yes -ne "y") { throw "Stopped. Nothing changed." }
  AdbText -s "${Tv}:5555" uninstall $Pkg | Out-Host
  $out = AdbText -s "${Tv}:5555" install "$Apk"
}
if ($out -notmatch "Success") { throw "Install failed: $out" }
Say "Installed."

# The first test builds used couch-tv's id. Two copies would both answer the Home button.
$old = (& $Adb -s "${Tv}:5555" shell pm list packages $OldPkg) -join ""
if ($old -match "package:$([regex]::Escape($OldPkg))\b") {
  Say "An older Halal TV test build ($OldPkg) is also on the TV."
  $yes = Read-Host "Remove the old test build? Its settings go with it (y/N)"
  if ($yes -eq "y") { AdbText -s "${Tv}:5555" uninstall $OldPkg | Out-Host }
  else { Say "Kept. If Home opens the old one, remove it in Settings, Apps." }
}

Step "5. Home screen"
& $Adb -s "${Tv}:5555" shell pm enable "$Pkg/$Cls.HomeAlias" | Out-Null
& $Adb -s "${Tv}:5555" shell cmd package set-home-activity "$Pkg/$Cls.HomeAlias" | Out-Host
AdbText -s "${Tv}:5555" shell pm grant $Pkg android.permission.READ_TV_LISTINGS | Out-Null
# The prayer-time card over other apps (Netflix, YouTube...) needs "display over other apps".
AdbText -s "${Tv}:5555" shell appops set $Pkg SYSTEM_ALERT_WINDOW allow | Out-Null
& $Adb -s "${Tv}:5555" shell am start -n "$Pkg/$Cls.SetupActivity" | Out-Null
Say "Done. On the TV: press Connect ADB in Halal TV (and Allow), then press Home."
Say "Undo: Settings, Apps, Halal TV, Uninstall."
