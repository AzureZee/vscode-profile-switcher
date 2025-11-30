import * as vscode from "vscode";
export class WorkbenchState {
  isWorkspaceFile: boolean = false;
  currentFolder: string = "";
  isOpenTextDocument: boolean = false;
  isNothing: boolean = false;
  constructor() {
    const workspace = vscode.workspace;
    const workspaceFile = workspace.workspaceFile;
    const workspaceFolders = workspace.workspaceFolders;
    const length = workspace.textDocuments.length;

    this.isWorkspaceFile = workspaceFile ? true : false;

    this.currentFolder = workspaceFolders ? workspaceFolders[0].uri.fsPath : "";

    this.isOpenTextDocument = length !== 0 ? true : false;
    if (
      !this.isWorkspaceFile &&
      this.currentFolder === "" &&
      !this.isOpenTextDocument
    ) {
      this.isNothing = true;
    } else {
      this.isNothing = false;
    }
  }
}
