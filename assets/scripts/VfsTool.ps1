<#
    .SYNOPSIS
    A simple tool that can create and extract BdBrowser VFS backup files.
    
    .DESCRIPTION
    The VFS Tool script supports two operations: Create and Extract.

    When used in "Create" mode, you can specify the root directory of your
    BetterDiscord AppData path (i.e. C:\Users\Meow\AppData\Roaming\BetterDiscord),
    a destination path for the backup file and have the script create a serialized
    copy of your real filesystem that you can then upload into BdBrowser's virtual
    filesystem.

    So in short:
    Parameter -Path points to the BetterDiscord AppData path.
    Parameter -OutputPath points to the filename for the backup file to create.

    ---

    If you use the script in "Extract" mode, you do instead specify the path to
    the VFS backup file and set the root output path where the structure should
    be extracted to.

    So in short:
    Parameter -Path points to the VFS backup file to extract.
    Parameter -OutputPath points to the root directory where it should be extracted to.

    .PARAMETER Operation
    Defines in which mode this script operates.

    Can either be "Create" to create a new VFS backup file from the real filesystem or
    "Extract" to extract the contents of a VFS backup file.

    .PARAMETER Path
    When in "Create" mode:
    Absolute path to the root of BetterDiscord's AppData path.

    When in "Extract" mode:
    Relative or absolute path to the BdBrowser VFS Backup file.

    .PARAMETER OutputPath
    When in "Create" mode:
    Relative or absolute path where the BdBrowser VFS Backup file should be written to.

    When in "Extract" mode:
    Relative or absolute path to the directory where the backup file structure should
    be extracted to.

    .EXAMPLE
    .\VfsTool.ps1 -Operation Create -Path "C:\Users\Meow\AppData\Roaming\BetterDiscord" -OutputPath "C:\Temp\Backup.json"

    Creates a new VFS backup file in C:\Temp\Backup.json and serializes the data from the specified -Path.

    .EXAMPLE
    .\VfsTool.ps1 -Operation Extract -Path "C:\Temp\Backup.json" -OutputPath "C:\Temp\Extracted"

    Extracts the contents of the VFS backup file "C:\Temp\Backup.json" into "C:\Temp\Extracted".

    Please note that the target directory has to exist already!
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [ValidateSet("Extract", "Create")]
    [String] $Operation,
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [String] $Path,
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [String] $OutputPath
)

function Initialize() {
    switch($Operation) {
        "Create" { CreateBackup }
        "Extract" { ExtractFromBackup }
    }    
}

function CreateBackup() {
    $now = [DateTimeOffset]::Now.ToUnixTimeSeconds()
    $pathContents = [Ordered] @{}

    # Create dummy file structure for expected root directories

    $pathContents["AppData"] = @{
        "atime"     = $now
        "birthtime" = $now
        "ctime"     = $now
        "fullName"  = "AppData"
        "mtime"     = $now
        "nodeType"  = "dir"
        "pathName"  = ""
        "size"      = 0
    }

    $pathContents["AppData/BetterDiscord"] = @{
        "atime"     = $now
        "birthtime" = $now
        "ctime"     = $now
        "fullName"  = "AppData/BetterDiscord"
        "mtime"     = $now
        "nodeType"  = "dir"
        "pathName"  = "AppData"
        "size"      = 0
    }

    # Now evaluate the contents of the given input path

    Push-Location -Path:$Path

    foreach($item in Get-ChildItem -Path:$Path -Recurse -Depth 99 -Exclude "emotes.asar") {
        $itemPathRelative = (Resolve-Path -Path $item -Relative).TrimStart('\', '.')
        $itemPathParent   = ""
        $itemPath         = (Join-Path -Path "AppData/BetterDiscord" -ChildPath $itemPathRelative).Replace('\', '/')

        $itemPathParent = [System.IO.Path]::GetDirectoryName($itemPath).TrimEnd('\').Replace('\', '/')

        if($item -is [System.IO.DirectoryInfo]) {
            $pathContents[$itemPath] = @{
                "atime"     = $now
                "birthtime" = $now
                "ctime"     = $now
                "fullName"  = $itemPath
                "mtime"     = $now
                "nodeType"  = "dir"
                "pathName"  = $itemPathParent
                "size"      = 0
            }
        }
        else
        {
            $pathContents[$itemPath] = @{
                "atime"     = $now
                "birthtime" = $now
                "contents"  = [Convert]::ToBase64String([IO.File]::ReadAllBytes($item.FullName))
                "ctime"     = $now
                "fullName"  = $itemPath
                "mtime"     = $now
                "nodeType"  = "file"
                "pathName"  = $itemPathParent
                "size"      = $item.Length
            }
        }
    }

    Pop-Location

    $pathContents | Sort-Object -Property Name | ConvertTo-Json -Compress | Set-Content -Path:$OutputPath
}

function ExtractFromBackup() {
    $fileContent = Get-Content -Path:$Path -Raw | ConvertFrom-Json

    foreach($key in $fileContent.psobject.properties.name) {
        $obj = $fileContent.$key

        $targetPath = Join-Path -Path $OutputPath -ChildPath $obj.fullName

        if($obj.nodeType -eq "dir") {
            New-Item -Path $targetPath -ItemType Directory -Force | Out-Null
        }

        if($obj.nodeType -eq "file") {
            # Try to create the directory structure again.
            $folderPath = Join-Path -Path $OutputPath -ChildPath $obj.pathName
            New-Item -Path $folderPath -ItemType Directory -Force | Out-Null

            # Now write out the file.
            $fileBytes = [Convert]::FromBase64String($obj.contents)
            [IO.File]::WriteAllBytes($targetPath, $fileBytes)
        }
    }
}

Initialize
