// extension
// 1. open window, extension activated, executed once
// 2. open workspaceFolder, match parent folder or match files
// 3. no folder, open document, match file ext
// 4. no folder not open document, no operation
// statusBar
// 1. click, execute BUILT_IN_COMMAND.
// 2. hover, show ToolTip
// tooltip:
// 1.generateTemplate
// 2.reload extension (updated profiles, use this reload extension config)

import * as vscode from "vscode";
import { Environment } from "./environment";
import { generateTemplate,TEMPLATE_FILE_NAME } from "./generate_template";
import { RulesMap } from "./rules";
import { WorkbenchState } from "./workbench_state";

export const EXTENSION_NAME = "profileSwitcher";

const MY_EXT_COMMAND = [
  "profileSwitcher.generateTemplate",
  "profileSwitcher.reloadConfig",
];
const BUILT_IN_COMMAND = "workbench.profiles.actions.switchProfile";
const CMD_ACTIVATE_PROFILE_PREFIX = "workbench.profiles.actions.profileEntry.";

let counter = 0; // only executed once switchForActiveFile
let statusBar: vscode.StatusBarItem;
//
export async function activate(context: vscode.ExtensionContext) {
  let workbenchState = new WorkbenchState();
  let env = new Environment();
  let rulesMap = new RulesMap();

  await env.build(context);
  rulesMap.bulid(env.locationIdByProfile);
  workbenchState.setState();

  await switchForRules(rulesMap, workbenchState);
  //
  statusBar = vscode.window.createStatusBarItem(
    "Switch.button",
    vscode.StatusBarAlignment.Left,
    Number.MAX_VALUE
  );
  statusBar.command = BUILT_IN_COMMAND;
  statusBar.text = "Profile Switcher";
  statusBar.show();
  //
  const lisentOpenTextDocument = vscode.workspace.onDidOpenTextDocument(
    (document) => {
      workbenchState.setState();
      if (
        workbenchState.isWorkspaceFile ||
        workbenchState.currentFolder !== "" ||
        document.isUntitled ||
        rulesMap.targetByFileExts.size === 0 ||
        counter === 1
      ) {
        return;
      }
      switchForActiveFile(document, rulesMap.targetByFileExts);
    }
  );
  const lisentCloseTextDocument = vscode.workspace.onDidCloseTextDocument(
    () => {
      workbenchState.setState();
      if (
        workbenchState.isWorkspaceFile ||
        workbenchState.currentFolder !== ""
      ) {
        return;
      }
      if (workbenchState.isNothing) {
        counter = 0;
      }
    }
  );
  //
  const genTempCommand = vscode.commands.registerCommand(
    MY_EXT_COMMAND[0],
    () => {
      generateTemplate(env.locationIdByProfile);
    }
  );
  const reloadCommand = vscode.commands.registerCommand(
    MY_EXT_COMMAND[1],
    async () => {
      await env.build(context);
      rulesMap.bulid(env.locationIdByProfile);
      workbenchState.setState();
    }
  );

  context.subscriptions.push(
    statusBar,
    genTempCommand,
    reloadCommand,
    lisentOpenTextDocument,
    lisentCloseTextDocument,
    vscode.workspace.onDidChangeConfiguration(handleConfigChange)
  );

  //
  function handleConfigChange(event: vscode.ConfigurationChangeEvent) {
    if (event.affectsConfiguration(EXTENSION_NAME)) {
      rulesMap.bulid(env.locationIdByProfile);
    }
  }
}

//
export function deactivate() {
  statusBar.hide();
}

//
async function switchForRules(
  rulesMap: RulesMap,
  workbenchState: WorkbenchState
) {
  const { isWorkspaceFile, currentFolder, isOpenTextDocument, isNothing } =
    workbenchState;

  if (isWorkspaceFile) {
    return;
  }
  const { targetByFolders, targetByPattern, targetByFileExts } = rulesMap;
  if (
    currentFolder === "" &&
    isOpenTextDocument &&
    vscode.window.activeTextEditor
  ) {
    switchForActiveFile(
      vscode.window.activeTextEditor.document,
      targetByFileExts
    );
  }
  if (isNothing) {
    return;
  }
  if (targetByFolders.size !== 0) {
    //
    for (const folders of targetByFolders.keys()) {
      if (matchParentFolder(currentFolder, folders)) {
        return switchToTarget(targetByFolders.get(folders));
      }
    }
  }
  //
  if (targetByPattern.size !== 0) {
    //
    for (const pattern of targetByPattern.keys()) {
      let { include, exclude } = pattern;
      if (await matchPattern(currentFolder, include, exclude)) {
        return switchToTarget(targetByPattern.get(pattern));
      }
    }
  }
  function matchParentFolder(workspaceFolder: string, folders: string[]) {
    for (const folder of folders) {
      if (workspaceFolder.includes(folder)) {
        return true;
      }
    }
    return false;
  }

  async function matchPattern(
    folder: string,
    include: string,
    exclude?: string | null
  ) {
    const _include = new vscode.RelativePattern(folder, include);

    const result = await vscode.workspace.findFiles(_include, exclude, 10);
    return result ? true : false;
  }
}

//
function switchForActiveFile(
  document: vscode.TextDocument,
  targetByFileExts: Map<any, any>
) {
  const activeFileExt = getActiveFileExt(document);
  if (!activeFileExt) {
    return;
  }
  for (const fileExts of targetByFileExts.keys()) {
    if (matchFileExts(fileExts, activeFileExt)) {
      counter += 1;
      return switchToTarget(targetByFileExts.get(fileExts));
    }
  }
  function matchFileExts(fileExts: string[], activeFileExt: string) {
    return fileExts.includes(activeFileExt);
  }
  function getActiveFileExt(document: vscode.TextDocument) {
    const fileName = document.fileName;
    if (!fileName||fileName.includes(TEMPLATE_FILE_NAME)) {
      return null;
    }
    const parts = fileName.split(".");
    return parts.length > 1 ? parts.pop() : null;
  }
}

//
async function switchToTarget(target: string) {
  await vscode.commands.executeCommand(
    `${CMD_ACTIVATE_PROFILE_PREFIX}${target}`
  );
}
