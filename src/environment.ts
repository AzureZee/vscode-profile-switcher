import fs from "fs/promises";
import * as path from "path";
import * as vscode from "vscode";

export class Environment {
  locationIdByProfile: Map<string, string>;

  constructor() {
    this.locationIdByProfile = new Map();
  }
  async build(context: vscode.ExtensionContext) {
    this.locationIdByProfile = new Map();
    const globalStoragePath = path.join(
      context.globalStorageUri.fsPath,
      "../storage.json"
    );
    const globalStorageData = await fs.readFile(globalStoragePath, {
      encoding: "utf-8",
    });
    const globalStorageObj = JSON.parse(globalStorageData);

    for (const profile of globalStorageObj["userDataProfiles"]) {
      // console.log(JSON.stringify(profile, ["name", "location"]));
      this.locationIdByProfile.set(profile["name"], profile["location"]);
    }
  }
}
