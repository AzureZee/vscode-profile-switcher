import fs from "fs/promises";
import * as path from "path";
import * as vscode from "vscode";

export class Environment {
  locationIdByProfile: Map<string, string> = new Map();
  globalStoragePath: string;

  constructor(context: vscode.ExtensionContext) {
    this.globalStoragePath = this.resolveGlobalStatePath(context);
  }
  async init() {
    const globalStorageData = await fs.readFile(this.globalStoragePath, {
      encoding: "utf-8",
    });
    const globalStorageObj = JSON.parse(globalStorageData);

    for (const profile of globalStorageObj["userDataProfiles"]) {
      this.locationIdByProfile.set(profile["name"], profile["location"]);
    }
  }

  getGlobalStateUri() {
    return vscode.Uri.file(this.globalStoragePath);
  }
  resolveGlobalStatePath(context: vscode.ExtensionContext) {
    let portableAppPath = process.env.VSCODE_PORTABLE;
    let globalStoragePath: string;
    if (portableAppPath === undefined) {
      globalStoragePath = path.join(
        context.globalStorageUri.fsPath,
        "../../..",
        "User",
        "globalStorage",
        "storage.json"
      );
    } else {
      globalStoragePath = path.join(
        portableAppPath,
        "user-data",
        "User",
        "globalStorage",
        "storage.json"
      );
    }
    return globalStoragePath;
  }
}
