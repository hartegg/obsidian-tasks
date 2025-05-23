/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => VaultNicknamePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_PLUGIN_SETTINGS = {
  overrideAppTitle: "override-app-title:file-first"
};
var DEFAULT_SHARED_SETTINGS = {
  nickname: "My Vault Nickname"
};
var PATH_SEPARATOR = import_obsidian.Platform.isWin ? "\\" : "/";
var VAULT_LOCAL_SHARED_SETTINGS_FILE_PATH = ".vault-nickname";
var VaultNicknamePlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    /// Is the plugin is enabled. Used by `onload` to reliably check the
    /// plugin's state as a workaround for `this.app.plugins.enabledPlugins`
    /// omitting plugins that are actively loading.
    ///
    this.isEnabled = false;
  }
  async onload() {
    this.isEnabled = true;
    this.desktopVaultSwitcherClickCallback = this.onDesktopVaultSwitcherClicked.bind(this);
    this.desktopVaultSwitcherContextMenuCallback = this.onDesktopVaultSwitcherContextMenu.bind(this);
    this.vaultItemRenamedCallback = this.onVaultItemRenamed.bind(this);
    this.activeLeafChangeCallback = this.onActiveLeafChange.bind(this);
    await this.loadSettings();
    const settingsFilePath = this.getSharedSettingsFilePath();
    let saveSettingsExist = false;
    await this.app.vault.adapter.exists(settingsFilePath).then(
      (exists) => {
        saveSettingsExist = exists;
      },
      (rejectReason) => {
        saveSettingsExist = false;
      }
    );
    if (!saveSettingsExist) {
      await this.saveSettings();
    }
    this.addSettingTab(new VaultNicknameSettingTab(this.app, this));
    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
    this.registerEvent(this.app.vault.on("rename", this.vaultItemRenamedCallback));
    this.registerEvent(this.app.workspace.on("active-leaf-change", this.activeLeafChangeCallback));
  }
  onunload() {
    this.isEnabled = false;
    this.useDesktopVaultSwitcherCallbacks(false);
    this.refreshVaultDisplayName();
  }
  onLayoutReady() {
    this.desktopVaultSwitcherElement = window.activeDocument.querySelector(".workspace-drawer-vault-switcher");
    this.useDesktopVaultSwitcherCallbacks(true);
    this.refreshVaultDisplayName();
  }
  useDesktopVaultSwitcherCallbacks(use) {
    if (import_obsidian.Platform.isMobile) {
      return;
    }
    if (!this.desktopVaultSwitcherElement) {
      console.error("Vault switcher element not found. Cannot update its events.");
      return;
    }
    this.desktopVaultSwitcherElement.removeEventListener("click", this.desktopVaultSwitcherClickCallback);
    this.desktopVaultSwitcherElement.removeEventListener("contextmenu", this.desktopVaultSwitcherContextMenuCallback);
    if (use) {
      this.desktopVaultSwitcherElement.addEventListener("click", this.desktopVaultSwitcherClickCallback);
      this.desktopVaultSwitcherElement.addEventListener("contextmenu", this.desktopVaultSwitcherContextMenuCallback);
    }
  }
  /// Query for a selector. If not found, try observing for
  /// `timeoutMilliseconds` for it to be added, otherwise return `null`.
  ///
  async waitForSelector(searchFrom, selector, timeoutMilliseconds) {
    return new Promise((resolve) => {
      const element = searchFrom.querySelector(selector);
      if (element) {
        return resolve(element);
      }
      const timeout = setTimeout(() => resolve(null), timeoutMilliseconds);
      const observer = new MutationObserver((mutations) => {
        const element2 = searchFrom.querySelector(selector);
        if (element2) {
          clearTimeout(timeout);
          observer.disconnect();
          resolve(element2);
        }
      });
      observer.observe(searchFrom, {
        childList: true,
        subtree: true
      });
    });
  }
  /// Wait for an element to be removed.
  ///
  async waitForElementToBeRemoved(element, timeoutMilliseconds) {
    return new Promise((resolve) => {
      const parent = element.parentNode;
      if (!parent) {
        resolve();
        return;
      }
      const timeout = setTimeout(() => resolve(), timeoutMilliseconds);
      const observer = new MutationObserver(() => {
        if (!element.parentNode) {
          clearTimeout(timeout);
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(parent, {
        childList: true,
        subtree: true
      });
    });
  }
  /// Invoked when a vault item is renamed. Applies the vault's nickname to
  /// the window title.
  ///
  onVaultItemRenamed(_) {
    this.refreshVaultDisplayName();
  }
  /// Invoked when the active workspace leaf was changed. Applies the vault's
  /// nickname to the window title.
  ///
  onActiveLeafChange(_) {
    this.refreshVaultDisplayName();
  }
  /// Invoked when the user clicks the workspace's vault switcher drawer.
  /// This function changes the vault names shown in the vault popup menu
  /// to the names provided by the vault's personal Vault Nickname plugin.
  ///
  async onDesktopVaultSwitcherClicked() {
    if (import_obsidian.Platform.isMobile) {
      return;
    }
    if (this.desktopVaultSwitcherElement && this.desktopVaultSwitcherElement.hasClass("has-active-menu")) {
      return;
    }
    const vaultSwitcherMenu = await this.waitForSelector(window.activeDocument, ".menu", 100);
    if (!vaultSwitcherMenu) {
      console.error("The vault switcher menu was not found after the timeout.");
      return;
    }
    const vaults = electron.ipcRenderer.sendSync("vault-list");
    if (!vaults) {
      console.error("Failed to retrieve list of known vaults.");
    }
    const vaultKeys = Object.keys(vaults);
    const menuItems = vaultSwitcherMenu.querySelectorAll(".menu-item");
    const min = Math.min(menuItems.length, vaultKeys.length);
    for (let i = 0; i < min; ++i) {
      const vaultKey = vaultKeys[i];
      const vault = vaults[vaultKey];
      const titleElement = menuItems[i].querySelector(".menu-item-title");
      if (!titleElement) {
        console.error("No title element for this vault: " + vault.path);
        continue;
      }
      const vaultPluginSettingsFilePath = (0, import_obsidian.normalizePath)([
        vault.path,
        VAULT_LOCAL_SHARED_SETTINGS_FILE_PATH
      ].join(PATH_SEPARATOR));
      if (!this.filePathExistsSync(vaultPluginSettingsFilePath)) {
        continue;
      }
      const vaultPluginSettingsJson = this.readUtf8FileSync(vaultPluginSettingsFilePath);
      if (!vaultPluginSettingsJson) {
        continue;
      }
      const vaultPluginSettings = JSON.parse(vaultPluginSettingsJson);
      if (!vaultPluginSettings || !vaultPluginSettings.nickname || !vaultPluginSettings.nickname.trim()) {
        continue;
      }
      titleElement.textContent = vaultPluginSettings.nickname;
    }
  }
  /// Invoked when the user context-clicks on the vault switcher drop down.
  /// Adds a "Set nickname" item to the spawned menu as a shortcut to the
  /// plugin's settings page.
  ///
  async onDesktopVaultSwitcherContextMenu() {
    if (import_obsidian.Platform.isMobile) {
      return;
    }
    if (this.desktopVaultSwitcherElement && this.desktopVaultSwitcherElement.hasClass("has-active-menu")) {
      const alreadyOpenMenu = window.activeDocument.querySelector(".menu");
      if (alreadyOpenMenu) {
        await this.waitForElementToBeRemoved(alreadyOpenMenu, 200);
      }
    }
    const vaultSwitcherMenu = await this.waitForSelector(window.activeDocument, ".menu", 200);
    if (!vaultSwitcherMenu) {
      console.error("The vault switcher menu was not found after the timeout.");
      return;
    }
    const templateMenuItem = vaultSwitcherMenu.querySelector(".menu-item");
    if (!templateMenuItem) {
      console.error("No menu-item to clone");
      return;
    }
    const openSettingsMenuItem = templateMenuItem.cloneNode(true);
    if (!openSettingsMenuItem) {
      console.error("Failed to clone menu-item");
      return;
    }
    const openSettingsMenuItemIcon = openSettingsMenuItem.querySelector(".menu-item-icon");
    if (openSettingsMenuItemIcon) {
      openSettingsMenuItemIcon.toggleVisibility(false);
    }
    const openSettingsMenuItemLabel = openSettingsMenuItem.querySelector(".menu-item-title");
    if (!openSettingsMenuItemLabel) {
      console.error("No menu-item-title in cloned menu-item");
      return;
    }
    openSettingsMenuItemLabel.textContent = "Set nickname";
    openSettingsMenuItem.addEventListener("click", this.openVaultNicknameSettings.bind(this));
    const onMouseOver = function() {
      const parent = this.parentElement;
      const menuItems = parent.querySelectorAll(".menu-item");
      for (const menuItem of menuItems) {
        menuItem.removeClass("selected");
      }
      this.addClass("selected");
    };
    const onMouseLeave = function() {
      this.removeClass("selected");
    };
    openSettingsMenuItem.addEventListener("mouseover", onMouseOver.bind(openSettingsMenuItem));
    openSettingsMenuItem.addEventListener("mouseleave", onMouseLeave.bind(openSettingsMenuItem));
    vaultSwitcherMenu.appendChild(openSettingsMenuItem);
  }
  /// Invoked by the custom "Set nickname" menu item added to the vault
  /// switcher's context menu. Opens the plugins setting page for quick
  /// access to nickname field.
  ///
  async openVaultNicknameSettings() {
    this.app.commands.executeCommandById("app:open-settings");
    const settingsMenu = await this.waitForSelector(window.activeDocument, ".mod-settings", 200);
    if (!settingsMenu) {
      console.error("The vault settings menu was not found after the timeout.");
      return;
    }
    const anyTab = await this.waitForSelector(window.activeDocument, ".vertical-tab-nav-item", 200);
    if (!anyTab) {
      console.error("Timeout while waiting for a settings menu tab to be found.");
      return;
    }
    const settingsTabs = settingsMenu.querySelectorAll(".vertical-tab-nav-item");
    for (const tab of settingsTabs) {
      if (tab.textContent !== this.manifest.name) {
        continue;
      }
      tab.click();
      return;
    }
    console.error("Plugin tab not found.");
  }
  /// Refresh the text for the active vault in the workspace's vault switcher
  /// drawer. If no nickname exists for the active vault, the label will
  /// fallback to the vault's folder name.
  ///
  refreshVaultDisplayName() {
    const currentVaultName = this.isEnabled && this.sharedSettings && this.sharedSettings.nickname && this.sharedSettings.nickname.trim() ? this.sharedSettings.nickname.trim() : this.app.vault.getName();
    this.setVaultDisplayName(currentVaultName);
  }
  /// Change the display name of the active vault in the workspace's vault
  /// switcher drawer and the app window's title.
  ///
  async setVaultDisplayName(vaultDisplayName) {
    const selectedVaultNameElement = await this.getVaultTitleElement();
    if (!selectedVaultNameElement) {
      console.error("Vault name element not found. Cannot apply nickname.");
      return;
    }
    if (selectedVaultNameElement) {
      selectedVaultNameElement.textContent = vaultDisplayName;
    }
    this.setAppTitle(vaultDisplayName);
  }
  /// Change the app's title. This applies the provided vault name and
  /// optionally switches the order of the vault and document names.
  ///
  setAppTitle(vaultDisplayName) {
    if (import_obsidian.Platform.isMobileApp) {
      return;
    }
    if (this.settings.overrideAppTitle === "override-app-title:off") {
      this.app.workspace.updateTitle();
      return;
    }
    const titleSeparator = " - ";
    const appTitle = this.app.title;
    if (!appTitle) {
      console.error("no this.app.title");
      return;
    }
    const titleParts = appTitle.split(titleSeparator);
    if (!titleParts || titleParts.length < 2) {
      console.error("unexpected title format: " + appTitle);
      return;
    }
    const obsidianVersion = titleParts[titleParts.length - 1];
    const documentTitle = (() => {
      const activeEditor = this.app.workspace.activeEditor;
      if (activeEditor && activeEditor.titleEl) {
        return activeEditor.titleEl.textContent;
      }
      return "New tab";
    })();
    if (this.settings.overrideAppTitle === "override-app-title:vault-first") {
      window.activeDocument.title = [
        vaultDisplayName,
        documentTitle,
        obsidianVersion
      ].join(titleSeparator);
    } else {
      window.activeDocument.title = [
        documentTitle,
        vaultDisplayName,
        obsidianVersion
      ].join(titleSeparator);
    }
  }
  /// Load the vault's nickname. Currently, a hidden file in the root of the
  /// vault is used because it simplifies sharing vault nicknames between
  /// other instances of the plugin.
  ///
  async loadSettings() {
    const loadedSharedSettings = Object.assign({}, DEFAULT_SHARED_SETTINGS);
    const parentFolderName = this.getVaultParentFolderName();
    if (parentFolderName) {
      loadedSharedSettings.nickname = parentFolderName;
    }
    const sharedSettingsFilePath = this.getSharedSettingsFilePath();
    if (this.filePathExistsSync(sharedSettingsFilePath)) {
      const settingsJson = this.readUtf8FileSync(sharedSettingsFilePath);
      loadedSharedSettings;
      Object.assign(loadedSharedSettings, JSON.parse(settingsJson));
    }
    this.sharedSettings = loadedSharedSettings;
    this.settings = Object.assign({}, DEFAULT_PLUGIN_SETTINGS, await this.loadData());
    this.refreshVaultDisplayName();
  }
  /// Write the vault's nickname to disk. Currently, a hidden file in the
  /// root of the vault is used because it simplifies sharing vault nicknames
  /// between other instances of the plugin.
  ///
  async saveSettings() {
    const sharedSettingsFilePath = this.getSharedSettingsFilePath();
    if (sharedSettingsFilePath) {
      const sharedSettingsJson = JSON.stringify(this.sharedSettings, null, 2);
      this.writeUtf8FileSync(sharedSettingsFilePath, sharedSettingsJson);
    }
    await this.saveData(this.settings);
    this.refreshVaultDisplayName();
  }
  async getVaultTitleElement() {
    return await this.waitForSelector(
      window.activeDocument,
      import_obsidian.Platform.isDesktop ? ".workspace-drawer-vault-name" : ".workspace-drawer-header-name-text",
      200
    );
  }
  /// Get the name of the vault's parent folder. This is used as the plugin's
  /// default vault nickname
  ///
  getVaultParentFolderName() {
    const vaultAbsoluteFilePath = this.app.vault.adapter.getBasePath();
    if (!vaultAbsoluteFilePath) {
      return "";
    }
    const explodedVaultPath = vaultAbsoluteFilePath.split(PATH_SEPARATOR);
    const indexOfParentFolder = explodedVaultPath.length - 2;
    if (indexOfParentFolder < 0 || !explodedVaultPath[indexOfParentFolder] || !explodedVaultPath[indexOfParentFolder].trim()) {
      return "";
    }
    return explodedVaultPath[indexOfParentFolder].trim();
  }
  /// Get the absolute path to this vault's nickname settings. This is a
  /// hidden file in the root of the vault. Ideally, we would have this file
  /// in the plugin's install folder but it is currently tricky to access
  /// files in other vaults' config folder.
  ///
  getSharedSettingsFilePath() {
    return [
      this.app.vault.adapter.getBasePath(),
      VAULT_LOCAL_SHARED_SETTINGS_FILE_PATH
    ].join(PATH_SEPARATOR);
  }
  // Using synchronous calls because they prevent momentary flicker when
  // vault nicknames are applied.
  filePathExistsSync(absoluteFilePath) {
    return this.app.vault.adapter.fs.existsSync(absoluteFilePath);
  }
  readUtf8FileSync(absoluteFilePath) {
    return this.app.vault.adapter.fs.readFileSync(absoluteFilePath, "utf8");
  }
  writeUtf8FileSync(absoluteFilePath, content) {
    this.app.vault.adapter.fs.writeFileSync(absoluteFilePath, content, "utf8");
  }
};
var VaultNicknameSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("vault-nickname-settings");
    new import_obsidian.Setting(containerEl).setName("Vault nickname").setDesc("Override the vault's display name.").setTooltip(
      import_obsidian.Platform.isDesktop ? "A vault nickname controls the text shown in the workspace's vault switcher. The 'Manage Vaults' window will continue showing the true vault name as these may be disambiguated by their visible path." : "A vault nickname controls the text shown in the workspace's side panel."
    ).addText((textComponent) => {
      textComponent.setPlaceholder("No nickname").setValue(this.plugin.sharedSettings.nickname).onChange(async (newValue) => {
        this.plugin.sharedSettings.nickname = newValue;
        await this.plugin.saveSettings();
      });
    }).addButton((buttonComponent) => {
      buttonComponent.setIcon("folder-up").setTooltip("Use the name of the vault's parents folder.").onClick(async (mouseEvent) => {
        const parentFolderName = this.plugin.getVaultParentFolderName();
        if (!parentFolderName) {
          return;
        }
        this.plugin.sharedSettings.nickname = parentFolderName;
        this.display();
        await this.plugin.saveSettings();
      });
    });
    if (import_obsidian.Platform.isDesktopApp) {
      new import_obsidian.Setting(containerEl).setName("Nickname in app title").setDesc("Position and use of vault nickname in the app title.").addDropdown((dropdownComponent) => {
        dropdownComponent.addOption("override-app-title:off", "Off");
        dropdownComponent.addOption("override-app-title:vault-first", "Vault name first");
        dropdownComponent.addOption("override-app-title:file-first", "File name first");
        dropdownComponent.setValue(this.plugin.settings.overrideAppTitle);
        dropdownComponent.onChange(async (newValue) => {
          this.plugin.settings.overrideAppTitle = newValue;
          this.plugin.refreshVaultDisplayName();
          await this.plugin.saveSettings();
        });
      });
    }
  }
};


/* nosourcemap */