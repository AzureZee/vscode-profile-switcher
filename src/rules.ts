import * as vscode from "vscode";
import { EXTENSION_NAME } from "./extension";

export class RulesMap {
  targetByFolders: Map<any, any>;
  targetByPattern: Map<any, any>;
  targetByFileExts: Map<any, any>;
  constructor() {
    this.targetByFolders = new Map();
    this.targetByPattern = new Map();
    this.targetByFileExts = new Map();
  }
  bulid(locationIdByProfile: Map<string, string>) {
    this.clear();
    const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
    const rules = config.get<
      {
        profile: string;
        folders?: string[];
        pattern?: { include: string; exclude?: string };
        fileExts?: string[];
      }[]
    >("rules", []);

    for (const rule of rules) {
      let { profile, folders, pattern, fileExts } = rule;
      let locationId = locationIdByProfile.get(profile);
      if (!locationId) {
        locationId = "null";
      }
      if (folders) {
        this.targetByFolders.set(folders, locationId);
      }
      if (pattern) {
        this.targetByPattern.set(pattern, locationId);
      }
      if (fileExts) {
        this.targetByFileExts.set(fileExts, locationId);
      }
    }
  }
  clear() {
    this.targetByFolders.clear();
    this.targetByPattern.clear();
    this.targetByFileExts.clear();
  }
}
