import * as vscode from "vscode";

export class WorkbenchState {
  isWorkspaceFile: boolean;
  currentFolder: string;
  isOpenTextDocument: boolean;
  isNothing: boolean;
  constructor() {
    this.isWorkspaceFile = false;
    this.currentFolder = "";
    this.isOpenTextDocument = false;
    this.isNothing = false;
  }
  setState() {
    this.resetState();
    const workspace = vscode.workspace;
    const workspaceFile = workspace.workspaceFile;
    const workspaceFolders = workspace.workspaceFolders;
    const length = workspace.textDocuments.length;
    if (workspaceFile) {
      this.isWorkspaceFile = true;
      return;
    }
    if (workspaceFolders) {
      this.currentFolder = workspaceFolders[0].uri.fsPath;
      return;
    }
    if (length !== 0) {
      this.isOpenTextDocument = true;
      return;
    }
    this.isNothing = true;
  }
  resetState() {
    this.isWorkspaceFile = false;
    this.currentFolder = "";
    this.isOpenTextDocument = false;
    this.isNothing = false;
  }
}
