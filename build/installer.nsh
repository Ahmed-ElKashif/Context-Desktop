!include nsDialogs.nsh
!include LogicLib.nsh

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
    WriteRegStr SHCTX "Software\Classes\*\shell\ContextApp" "" "Upload to Context"
    WriteRegStr SHCTX "Software\Classes\*\shell\ContextApp" "Icon" '"$INSTDIR\Context.exe"'
    WriteRegStr SHCTX "Software\Classes\*\shell\ContextApp\command" "" '"$INSTDIR\Context.exe" --action=upload --path="%1"'
  ${EndIf}

  ${If} $CheckboxDirs_State == ${BST_CHECKED}
    WriteRegStr SHCTX "Software\Classes\Directory\shell\ContextApp" "" "Upload to Context"
    WriteRegStr SHCTX "Software\Classes\Directory\shell\ContextApp" "Icon" '"$INSTDIR\Context.exe"'
    WriteRegStr SHCTX "Software\Classes\Directory\shell\ContextApp\command" "" '"$INSTDIR\Context.exe" --action=upload --path="%1"'
  ${EndIf}
!macroend

!macro customUninstall
  DeleteRegKey SHCTX "Software\Classes\Directory\shell\ContextApp"
  DeleteRegKey SHCTX "Software\Classes\*\shell\ContextApp"
!macroend
