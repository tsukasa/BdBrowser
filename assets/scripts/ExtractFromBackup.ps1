<#
    .SYNOPSIS
    Extracts the contents of a BdBrowser VFS Backup file into the local file system.
    
    .DESCRIPTION
    This script accepts a BdBrowser VFS Backup file via the -Path parameter and will
    extract the contents within to the directory specified via the -OutputPath parameter.

    This allows easy access to the files contained within a backup.

    .PARAMETER Path
    Relative or absolute path to the BdBrowser VFS Backup file.

    .PARAMETER OutputPath
    Relative or absolute path to the directory where the backup file structure should
    be extracted to.
#>
[CmdletBinding()]
param (
    [String] $Path,
    [String] $OutputPath
)

$fileContent = Get-Content -Path:$Path -Raw | ConvertFrom-Json

foreach($key in $fileContent.psobject.properties.name) {
    $obj = $fileContent.$key

    $targetPath = Join-Path -Path $OutputPath -ChildPath $obj.fullName

    if($obj.nodeType -eq "dir") {
        New-Item -Path $targetPath -ItemType Directory -Force | Out-Null
    }

    if($obj.nodeType -eq "file") {
        $fileBytes = [Convert]::FromBase64String($obj.contents)
        [IO.File]::WriteAllBytes($targetPath, $fileBytes)
    }
}
