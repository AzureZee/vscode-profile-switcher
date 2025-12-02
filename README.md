# VSCode Profile Switcher

## 中文说明

VSCode Profile Switcher 是一个 VSCode 扩展，可以根据不同的条件自动切换 VSCode 配置文件（Profile）。

### 功能特性
- 根据打开的文件夹自动切换配置文件
- 根据工作区文件自动切换配置文件
- 根据打开的文件扩展名自动切换配置文件
- 可通过状态栏手动切换配置文件
- 支持通过配置规则自定义切换逻辑

---

### 使用方法
1. 确保在所有需要的配置文件上安装此扩展，以便可以从其中任何一个进行切换。
<img src="./img/setting-1.png" alt="setting-1" width="350" height="200">
2. 在设置文件中配置 `profileSwitcher.rules`
<img src="./img/setting-2.png" alt="setting-2" width="350" height="100">
<img src="./img/setting-3.png" alt="setting-3" width="280" height="100">
3. `ctrl+shift+p`打开命令面板输入 `Gentemplate` 生成配置模板文件，修改模版，再复制到`setting.json`
模板是通过读取你创建的所有**配置文件的名称**生成的(不包括默认配置), 不需要的选项可以删除
<img src="./img/setting-4.png" alt="setting-4" width="300" height="60">
模板示例:
<img src="./img/setting-5.png" alt="setting-5" width="180" height="300">
修改后复制到`setting.json`示例:
<img src="./img/setting-6.png" alt="setting-6" width="500" height="400">
4. 扩展会根据配置的规则以及**打开的vscode窗口的工作区状态**自动切换配置文件.

---

### 配置选项
在 VSCode 设置中可以配置 `profileSwitcher.rules`，规则包含以下字段：
- `profile`: 配置文件名称
- `folders`: 指定文件夹，当打开这些指定文件夹下的子文件夹时使用指定的配置文件. **优先级最高**.
- `projectManifestFile`: 使用文件匹配模式，当工作区包含匹配的**不同编程语言特有的项目清单文件**(比如`Cargo.toml`,`package.json`)时使用指定的配置文件.
**此选项比通用的`pattern`选项优先级更高**.
- `pattern`: 使用文件匹配模式，当工作区包含匹配的文件时使用指定的配置文件
- `fileExts`: 根据文件扩展名切换配置文件. **只在窗口没有工作区打开但打开了文本文档时切换一次**, 窗口内没有文档打开时计数归零.

### 命令
- `Profiles: Gen template`: 生成配置模板文件
- `Profiles: Reload configuration`: 重新加载配置（当更改配置文件后使用）

---

## English Documentation

VSCode Profile Switcher is a VSCode extension that automatically switches VSCode profiles based on different conditions.

### Features
- Automatically switch profiles based on opened folders
- Automatically switch profiles based on workspace files
- Automatically switch profiles based on opened file extensions
- Manually switch profiles via status bar
- Support custom switching logic through configuration rules

### Usage
1. Install the extension
2. Configure switching rules (configure `profileSwitcher.rules` in settings)
3. Enter `Gen template` in the command palette to generate a configuration template file, modify the template, and then copy it to `setting.json`
4. The extension will automatically switch profiles according to the configured rules

### Configuration Options
In VSCode settings, you can configure `profileSwitcher.rules` with the following fields:
- `profile`: Profile name
- `folders`: Specify folders, when subfolders under these specified folders are opened, use the specified profile
- `pattern`: Use file matching patterns, when the workspace contains matching files, use the specified profile
- `fileExts`: Switch profiles based on file extensions

### Commands
- `Profiles: Gen template`: Generate configuration template file
- `Profiles: Reload configuration`: Reload configuration (use after changing profiles)