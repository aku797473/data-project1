# Resilient Local Web Server for VOLTIX EV Analytics Platform
param([int]$Port = 8080)

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Starting VOLTIX Server on http://localhost:$Port" -ForegroundColor Cyan

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try {
    $listener.Start()
} catch {
    $Port = 8081
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$Port/")
    $listener.Start()
}
Write-Host "Listening at: http://localhost:$Port/" -ForegroundColor Green

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        $res.AddHeader('Access-Control-Allow-Origin', '*')
        $res.AddHeader('Cache-Control', 'no-cache')

        $relPath = $req.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($relPath)) { $relPath = 'index.html' }
        $fullPath = Join-Path $root $relPath

        if (Test-Path $fullPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $mime = switch ($ext) {
                '.html' { 'text/html; charset=utf-8' }
                '.css'  { 'text/css; charset=utf-8' }
                '.js'   { 'application/javascript; charset=utf-8' }
                '.json' { 'application/json; charset=utf-8' }
                '.csv'  { 'text/csv; charset=utf-8' }
                '.svg'  { 'image/svg+xml' }
                '.png'  { 'image/png' }
                default { 'application/octet-stream' }
            }
            $res.ContentType = $mime
            $buf = [System.IO.File]::ReadAllBytes($fullPath)
            $res.ContentLength64 = $buf.Length
            if ($req.HttpMethod -ne 'HEAD') {
                $res.OutputStream.Write($buf, 0, $buf.Length)
            }
        } else {
            $res.StatusCode = 404
            $err = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
            $res.ContentLength64 = $err.Length
            if ($req.HttpMethod -ne 'HEAD') {
                $res.OutputStream.Write($err, 0, $err.Length)
            }
        }
        $res.Close()
    } catch {
        try { if ($context.Response) { $context.Response.Close() } } catch {}
    }
}
