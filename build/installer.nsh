!include nsDialogs.nsh
!include LogicLib.nsh

; ── Per-extension registration macros (SystemFileAssociations) ──
!macro _RegisterExtension _ext
  WriteRegStr SHCTX "Software\Classes\SystemFileAssociations\${_ext}\shell\ContextAppFile" "" "Upload to Context"
  WriteRegStr SHCTX "Software\Classes\SystemFileAssociations\${_ext}\shell\ContextAppFile" "Icon" '"$INSTDIR\Context.exe"'
  WriteRegStr SHCTX "Software\Classes\SystemFileAssociations\${_ext}\shell\ContextAppFile\command" "" '"$INSTDIR\Context.exe" --action=upload --path="%1"'
!macroend

!macro _UnregisterExtension _ext
  DeleteRegKey SHCTX "Software\Classes\SystemFileAssociations\${_ext}\shell\ContextAppFile\command"
  DeleteRegKey SHCTX "Software\Classes\SystemFileAssociations\${_ext}\shell\ContextAppFile"
!macroend

!macro customPageAfterChangeDir
  Page custom AdditionalTasksPage AdditionalTasksPageLeave
!macroend

!macro customInit
  ; Default checkboxes to checked
  StrCpy $CheckboxFiles_State ${BST_CHECKED}
  StrCpy $CheckboxDirs_State ${BST_CHECKED}
!macroend

!ifndef BUILD_UNINSTALLER
Var Dialog
Var CheckboxFiles
Var CheckboxDirs
Var CheckboxFiles_State
Var CheckboxDirs_State

Function AdditionalTasksPage
  nsDialogs::Create 1018
  Pop $Dialog
  ${If} $Dialog == error
    Abort
  ${EndIf}

  ${NSD_CreateCheckbox} 0 0 100% 12u "Add $\"Upload to Context$\" action to Windows Explorer file context menu"
  Pop $CheckboxFiles
  ${NSD_SetState} $CheckboxFiles $CheckboxFiles_State

  ${NSD_CreateCheckbox} 0 14u 100% 12u "Add $\"Upload to Context$\" action to Windows Explorer directory context menu"
  Pop $CheckboxDirs
  ${NSD_SetState} $CheckboxDirs $CheckboxDirs_State

  nsDialogs::Show
FunctionEnd

Function AdditionalTasksPageLeave
  ${NSD_GetState} $CheckboxFiles $CheckboxFiles_State
  ${NSD_GetState} $CheckboxDirs $CheckboxDirs_State
FunctionEnd
!endif

!macro customInstall
  ${If} $CheckboxFiles_State == ${BST_CHECKED}
    ; Register per-extension using SystemFileAssociations (standard approach)
    !insertmacro _RegisterExtension ".pdf"
    !insertmacro _RegisterExtension ".png"
    !insertmacro _RegisterExtension ".jpeg"
    !insertmacro _RegisterExtension ".jpg"
    !insertmacro _RegisterExtension ".webp"
    !insertmacro _RegisterExtension ".csv"
    !insertmacro _RegisterExtension ".doc"
    !insertmacro _RegisterExtension ".docx"
    !insertmacro _RegisterExtension ".xls"
    !insertmacro _RegisterExtension ".xlsx"
    ; Clean up legacy wildcard keys from older installs
    DeleteRegKey SHCTX "Software\Classes\*\shell\ContextApp\command"
    DeleteRegKey SHCTX "Software\Classes\*\shell\ContextApp"
    DeleteRegKey SHCTX "Software\Classes\*\shell\ContextAppFile\command"
    DeleteRegKey SHCTX "Software\Classes\*\shell\ContextAppFile"
  ${EndIf}

  ${If} $CheckboxDirs_State == ${BST_CHECKED}
    WriteRegStr SHCTX "Software\Classes\Directory\shell\ContextApp" "" "Upload to Context"
    WriteRegStr SHCTX "Software\Classes\Directory\shell\ContextApp" "Icon" '"$INSTDIR\Context.exe"'
    WriteRegStr SHCTX "Software\Classes\Directory\shell\ContextApp\command" "" '"$INSTDIR\Context.exe" --action=upload --path="%V"'
  ${EndIf}
!macroend

!macro customUninstall
  ; Clean up per-extension file entries
  !insertmacro _UnregisterExtension ".pdf"
  !insertmacro _UnregisterExtension ".png"
  !insertmacro _UnregisterExtension ".jpeg"
  !insertmacro _UnregisterExtension ".jpg"
  !insertmacro _UnregisterExtension ".webp"
  !insertmacro _UnregisterExtension ".csv"
  !insertmacro _UnregisterExtension ".doc"
  !insertmacro _UnregisterExtension ".docx"
  !insertmacro _UnregisterExtension ".xls"
  !insertmacro _UnregisterExtension ".xlsx"
  ; Clean up directory entry
  DeleteRegKey SHCTX "Software\Classes\Directory\shell\ContextApp\command"
  DeleteRegKey SHCTX "Software\Classes\Directory\shell\ContextApp"
  ; Clean up legacy wildcard keys (from older installs)
  DeleteRegKey SHCTX "Software\Classes\*\shell\ContextApp\command"
  DeleteRegKey SHCTX "Software\Classes\*\shell\ContextApp"
  DeleteRegKey SHCTX "Software\Classes\*\shell\ContextAppFile\command"
  DeleteRegKey SHCTX "Software\Classes\*\shell\ContextAppFile"
!macroend

