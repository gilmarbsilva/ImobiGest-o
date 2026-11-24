$body = '{"month":6,"year":2026}'
try {
    $response = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/contracts/generate-payments -ContentType 'application/json' -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
    $response | ConvertTo-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response: $($reader.ReadToEnd())"
    }
}
