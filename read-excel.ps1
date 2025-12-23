$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$workbook = $excel.Workbooks.Open("C:\Users\Mark Ronnel Nieva\Desktop\TK Observation Tracker.xlsx")
$sheet = $workbook.Sheets.Item(1)
$usedRange = $sheet.UsedRange
$rows = $usedRange.Rows.Count
$cols = $usedRange.Columns.Count

Write-Host "Sheet Name: $($sheet.Name)"
Write-Host "Total Rows: $rows"
Write-Host "Total Columns: $cols"
Write-Host ""
Write-Host "=== COLUMN HEADERS (Row 1) ==="

for ($c = 1; $c -le $cols; $c++) {
    $val = $sheet.Cells.Item(1, $c).Text
    Write-Host "  Column $c : $val"
}

Write-Host ""
Write-Host "=== SAMPLE DATA (First 5 data rows) ==="

for ($r = 2; $r -le [Math]::Min(6, $rows); $r++) {
    Write-Host "--- Row $r ---"
    for ($c = 1; $c -le $cols; $c++) {
        $header = $sheet.Cells.Item(1, $c).Text
        $val = $sheet.Cells.Item($r, $c).Text
        if ($val -and $val.Trim() -ne "") {
            Write-Host "  $header : $val"
        }
    }
}

$workbook.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
