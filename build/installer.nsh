!macro customInstall
  ; Register context menu for folders
  WriteRegStr SHCTX "Software\Classes\Directory\shell\ContextApp" "" "Upload to Context"
  WriteRegStr SHCTX "Software\Classes\Directory\shell\ContextApp" "Icon" '"$INSTDIR\Context.exe"'
  WriteRegStr SHCTX "Software\Classes\Directory\shell\ContextApp\command" "" '"$INSTDIR\Context.exe" --action=upload --path="%1"'
  
  ; Register context menu for files
  WriteRegStr SHCTX "Software\Classes\*\shell\ContextApp" "" "Upload to Context"
  WriteRegStr SHCTX "Software\Classes\*\shell\ContextApp" "Icon" '"$INSTDIR\Context.exe"'
  WriteRegStr SHCTX "Software\Classes\*\shell\ContextApp\command" "" '"$INSTDIR\Context.exe" --action=upload --path="%1"'
!macroend

!macro customUninstall
  DeleteRegKey SHCTX "Software\Classes\Directory\shell\ContextApp"
  DeleteRegKey SHCTX "Software\Classes\*\shell\ContextApp"
!macroend
