import * as vscode from "vscode";
import { Environment } from "./environment";
import { generateTemplate, TEMPLATE_FILE_NAME } from "./generate_template";
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
  let env = new Environment(context);
  await env.init();
  let rulesMap = new RulesMap(env.locationIdByProfile);

  const listenOpenTextDocument = vscode.workspace.onDidOpenTextDocument(
    (document) => {
      workbenchState = new WorkbenchState();
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
  const listenCloseTextDocument = vscode.workspace.onDidCloseTextDocument(
    () => {
      workbenchState = new WorkbenchState();

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
      env = new Environment(context);
      await env.init();
      rulesMap = new RulesMap(env.locationIdByProfile);
      workbenchState = new WorkbenchState();
    }
  );
  //
  statusBar = vscode.window.createStatusBarItem(
    "Switch.button",
    vscode.StatusBarAlignment.Left,
    Number.MAX_VALUE
  );
  statusBar.command = BUILT_IN_COMMAND;
  statusBar.text = "Profile Switcher";
  statusBar.show();

  context.subscriptions.push(
    statusBar,
    genTempCommand,
    reloadCommand,
    listenOpenTextDocument,
    listenCloseTextDocument,
    vscode.workspace.onDidChangeConfiguration(handleConfigChange)
  );
  try {
    switchForRules(rulesMap, workbenchState);
  } catch (error) {
    console.log(`switchForRules\n${error}`);
  }

  //
  function handleConfigChange(event: vscode.ConfigurationChangeEvent) {
    if (event.affectsConfiguration(EXTENSION_NAME)) {
      rulesMap = new RulesMap(env.locationIdByProfile);
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

  if (isNothing || isWorkspaceFile) {
    return;
  }

  const {
    targetByFolders,
    targetByManifest,
    targetByPattern,
    targetByFileExts,
  } = rulesMap;
  if (
    currentFolder === "" &&
    isOpenTextDocument &&
    vscode.window.activeTextEditor
  ) {
    switchForActiveFile(
      vscode.window.activeTextEditor.document,
      targetByFileExts
    );
    return;
  }
  if (targetByFolders.size !== 0) {
    //
    let getParentFolder = () => {
      let _parent = currentFolder.split("\\");
      _parent.splice(-1, 1);
      return _parent;
    };
    const parentFolder = getParentFolder();
    for (const folders of targetByFolders.keys()) {
      if (matchParentFolder(parentFolder, folders)) {
        return switchToTarget(targetByFolders.get(folders));
      }
    }
  }
  //
  if (targetByManifest.size !== 0) {
    //
    for (const manifest of targetByManifest.keys()) {
      if (await matchPattern(currentFolder, manifest)) {
        return switchToTarget(targetByManifest.get(manifest));
      }
    }
  }
  //
  if (targetByPattern.size !== 0) {
    //
    for (const pattern of targetByPattern.keys()) {
      let { include, exclude } = pattern;
      if (await matchPattern(currentFolder, include, exclude, 5)) {
        return switchToTarget(targetByPattern.get(pattern));
      }
    }
  }
  //
  function matchParentFolder(parentFolder: string[], folders: string[]) {
    for (const folder of folders) {
      if (parentFolder.includes(folder)) {
        return true;
      }
    }
    return false;
  }
  //
  async function matchPattern(
    folder: string,
    include: string[],
    exclude?: string | null,
    maxResults?: number
  ) {
    let patternList: vscode.RelativePattern[] = [];
    let resultList: vscode.Uri[][] = [];
    for (const _include of include) {
      const _pattern = new vscode.RelativePattern(folder, _include);
      patternList.push(_pattern);
    }
    for (const pattern of patternList) {
      const fileUriList = await vscode.workspace.findFiles(
        pattern,
        exclude,
        maxResults
      );
      resultList.push(fileUriList);
    }
    const isAllFound = (result: vscode.Uri[]) => result.length !== 0;
    return resultList.every(isAllFound);
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
  //
  for (const fileExts of targetByFileExts.keys()) {
    if (matchFileExts(fileExts, activeFileExt)) {
      counter += 1;
      return switchToTarget(targetByFileExts.get(fileExts));
    }
  }
  //
  function matchFileExts(fileExts: string[], activeFileExt: string) {
    return fileExts.includes(activeFileExt);
  }
  //
  function getActiveFileExt(document: vscode.TextDocument) {
    const fileName = document.fileName;
    if (!fileName || fileName.includes(TEMPLATE_FILE_NAME)) {
      return null;
    }
    const parts = fileName.split(".");
    return parts.length > 1 ? parts.pop() : null;
  }
}

//
function switchToTarget(target: string | undefined) {
  if (!target) {
    return;
  }
  try {
    vscode.commands.executeCommand(`${CMD_ACTIVATE_PROFILE_PREFIX}${target}`);
  } catch (error) {
    console.log(`executeCommand\n${error}`);
  }
}
