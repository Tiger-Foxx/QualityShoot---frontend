!macro customFinish
  Function CustomFinish
    SetOutPath $TEMP
    File /oname=$TEMP\finish.bmp "..\..\public\finish.bmp"
    nsDialogs::Create 1018
    Pop $Dialog
    ${If} $Dialog <> error
      nsDialogs::CreateControl "STATIC" 0x50000000 0 0 0 314 164 ""
      Pop $Image
      ${NSD_SetImage} $Image "$TEMP\finish.bmp"
    ${EndIf}
    nsDialogs::Show
  FunctionEnd

  !define MUI_FINISHPAGE_CUSTOMFUNCTION_SHOW CustomFinish
!macroend