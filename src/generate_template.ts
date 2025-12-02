import * as vscode from "vscode";
export const TEMPLATE_FILE_NAME = "switcher_rules_template.jsonc";
export async function generateTemplate(
  locationIdByProfile: Map<string, string>
) {
  const template = [];
  for (const profileName of locationIdByProfile.keys()) {
    const folder = [`${profileName}-proj`];
    const rule = {
      profile: profileName,
      folders: folder,
      projectManifestFile:[],
      pattern: { include: [], exclude: "" },
      fileExts: [],
    };
    template.push(rule);
  }

  const jsonContent = JSON.stringify(template, null, 2);
  const commentedContent = `// ${TEMPLATE_FILE_NAME}\n${jsonContent}`;

  const workspaceFolders = vscode.workspace.workspaceFolders;
  let fileUri: vscode.Uri | undefined;

  if (workspaceFolders) {
    const folderUri = workspaceFolders[0].uri;
    fileUri = vscode.Uri.joinPath(folderUri, `${TEMPLATE_FILE_NAME}`);
  } else {
    fileUri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(`${TEMPLATE_FILE_NAME}`),
      filters: { JSONC: ["jsonc"] },
    });
  }

  if (fileUri) {
    await vscode.workspace.fs.writeFile(
      fileUri,
      Buffer.from(commentedContent, "utf8")
    );

    vscode.window.showTextDocument(
      await vscode.workspace.openTextDocument(fileUri)
    );
  }
}
