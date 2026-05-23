!macro customInstall
  ; Register context menu for folders
  WriteRegStr HKCU "Software\Classes\Directory\shell\ContextApp" "" "Upload to Context"
  WriteRegStr HKCU "Software\Classes\Directory\shell\ContextApp\command" "" '"$INSTDIR\Context.exe" "--action=organize" "--path=%1"'
  
  ; Register context menu for files
  WriteRegStr HKCU "Software\Classes\*\shell\ContextApp" "" "Upload to Context"
  WriteRegStr HKCU "Software\Classes\*\shell\ContextApp\command" "" '"$INSTDIR\Context.exe" "--action=summarize" "--path=%1"'
!macroend

!macro customUninstall
  DeleteRegKey HKCU "Software\Classes\Directory\shell\ContextApp"
  DeleteRegKey HKCU "Software\Classes\*\shell\ContextApp"
!macroend
