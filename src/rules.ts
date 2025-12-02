import * as vscode from "vscode";
import { EXTENSION_NAME } from "./extension";

export class RulesMap {
  targetByFolders: Map<string[], string> = new Map();
  targetByManifest: Map< string[], string> = new Map();
  targetByPattern: Map< { include: string[]; exclude?: string }, string> = new Map();
  targetByFileExts: Map<string[], string> = new Map();

  constructor(locationIdByProfile: Map<string, string>) {
    const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
    const rules = config.get<
      {
        profile: string;
        folders?: string[];
        projectManifestFile?:string[];
        pattern?: { include: string[]; exclude?: string };
        fileExts?: string[];
      }[]
    >("rules", []);

    for (const rule of rules) {
      let { profile, folders, projectManifestFile, pattern, fileExts } = rule;
      let locationId = locationIdByProfile.get(profile);
      if (!locationId) {
        locationId = "null";
      }
      if (folders) {
        this.targetByFolders.set(folders, locationId);
      }
      if (projectManifestFile) {
        this.targetByManifest.set(projectManifestFile, locationId);
      }
      if (pattern) {
        this.targetByPattern.set(pattern, locationId);
      }
      if (fileExts) {
        this.targetByFileExts.set(fileExts, locationId);
      }
    }
  }
}
