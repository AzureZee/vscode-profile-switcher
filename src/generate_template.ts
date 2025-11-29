import * as vscode from "vscode";
import { WorkbenchState } from "./workbench_state";

export async function generateTemplate(
  locationIdByProfile: Map<string, string>
) {
  const workbenchState = new WorkbenchState();
  workbenchState.setState();
  if (workbenchState.isWorkspaceFile) {
    vscode.window.showErrorMessage("不支持从文件打开的工作区与多根工作区");
    return;
  }

  if (workbenchState.currentFolder === "") {
    vscode.window.showErrorMessage("没有打开工作区");
    return;
  }
  const template = [];
  for (const profileName of locationIdByProfile.keys()) {
    const folder = [`${profileName}-proj`];
    const rule = {
      profile: profileName,
      folders: folder,
      pattern: { include: "", exclude: "" },
      fileExts: [],
    };
    template.push(rule);
  }

  const jsonContent = JSON.stringify(template, null, 2);
  const commentedContent = `// 这是自动生成的模板文件\n${jsonContent}`;

  // 文件路径（在工作区根目录下）
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return;
  }
  const folderUri = workspaceFolders[0].uri;
  const fileUri = vscode.Uri.joinPath(folderUri, "template.jsonc");

  // 写入文件
  await vscode.workspace.fs.writeFile(
    fileUri,
    Buffer.from(commentedContent, "utf8")
  );

  vscode.window.showInformationMessage(`模板文件已生成: ${fileUri.fsPath}`);
}
