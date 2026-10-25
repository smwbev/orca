// Exact nonsecurity chrome exemptions preserve fail-closed protection for new plugin security copy. Never exempt trust badges,
// permission claims, install/trust failures or destructive confirmations; translated reassurance could mislead consent decisions
// (the PluginConsentProvenance extraction exposed this gap). Headings/search/local form copy may be translated.
const TRANSLATABLE_PLUGIN_CHROME = new Set([
  // Plugins pane frame: headings and list states, no claims about behavior.
  'auto.components.settings.PluginsSettingsSection.title',
  'auto.components.settings.PluginsSettingsSection.systemLabel',
  'auto.components.settings.PluginsSettingsSection.install',
  'auto.components.settings.PluginsSettingsSection.loading',
  'auto.components.settings.PluginsSettingsSection.empty',
  'auto.components.settings.PluginsSettingsSection.emptyTitle',
  'auto.components.settings.PluginsSettingsSection.noInstalledResults',
  'auto.components.settings.PluginsSettingsSection.noInstalledResultsTitle',
  // Marketplace browser chrome: refresh, search, and empty states.
  'auto.components.settings.PluginMarketplaceBrowser.manageSources',
  'auto.components.settings.PluginMarketplaceBrowser.addSource',
  'auto.components.settings.PluginMarketplaceBrowser.refresh',
  'auto.components.settings.PluginMarketplaceBrowser.refreshing',
  'auto.components.settings.PluginMarketplaceBrowser.loading',
  'auto.components.settings.PluginMarketplaceBrowser.tryAgain',
  'auto.components.settings.PluginMarketplaceBrowser.clearSearch',
  'auto.components.settings.PluginMarketplaceBrowser.empty',
  'auto.components.settings.PluginMarketplaceBrowser.emptyTitle',
  'auto.components.settings.PluginMarketplaceBrowser.noInstalled',
  'auto.components.settings.PluginMarketplaceBrowser.noInstalledTitle',
  'auto.components.settings.PluginMarketplaceBrowser.noResults',
  'auto.components.settings.PluginMarketplaceBrowser.noResultsTitle',
  'auto.components.settings.PluginMarketplaceBrowser.noSourcesTitle',
  // Local development form: field labels and validation, desktop-only paths.
  'auto.components.settings.PluginDevelopmentSection.title',
  'auto.components.settings.PluginDevelopmentSection.add',
  'auto.components.settings.PluginDevelopmentSection.remove',
  'auto.components.settings.PluginDevelopmentSection.pathLabel',
  'auto.components.settings.PluginDevelopmentSection.pathRequired',
  'auto.components.settings.PluginDevelopmentSection.placeholder',
  // Settings-search index entries: they route to a pane, they do not assert.
  'auto.components.settings.plugins.search.title',
  'auto.components.settings.plugins.search.description',
  'auto.components.settings.plugins.search.install',
  'auto.components.settings.plugins.search.permissions',
  'auto.components.settings.plugins.search.logs',
  'auto.components.settings.plugins.search.development',

  // Maturity badge on the pane heading: how finished the feature is, not what a plugin may do.
  'auto.components.settings.PluginsSettingsSection.experimental',

  // Install form labels and blank-field checks; `gitRefRequired` argues for pinning, so stays protected.
  'auto.components.settings.PluginInstallDialog.cancel',
  'auto.components.settings.PluginInstallDialog.gitLabel',
  'auto.components.settings.PluginInstallDialog.gitPlaceholder',
  'auto.components.settings.PluginInstallDialog.gitTab',
  'auto.components.settings.PluginInstallDialog.gitUrlRequired',
  'auto.components.settings.PluginInstallDialog.install',
  'auto.components.settings.PluginInstallDialog.installing',
  'auto.components.settings.PluginInstallDialog.localLabel',
  'auto.components.settings.PluginInstallDialog.localPlaceholder',
  'auto.components.settings.PluginInstallDialog.localRequired',
  'auto.components.settings.PluginInstallDialog.localTab',
  'auto.components.settings.PluginInstallDialog.source',
  'auto.components.settings.PluginInstallDialog.title',

  // Installed-row log controls and runtime state; trust state and enable/remove/rollback stay protected.
  'auto.components.settings.PluginSettingsRow.hideLogs',
  'auto.components.settings.PluginSettingsRow.loadingLogs',
  'auto.components.settings.PluginSettingsRow.logCount',
  'auto.components.settings.PluginSettingsRow.moreActions',
  'auto.components.settings.PluginSettingsRow.noLogs',
  'auto.components.settings.PluginSettingsRow.restartCount',
  'auto.components.settings.PluginSettingsRow.restarting',
  'auto.components.settings.PluginSettingsRow.running',
  'auto.components.settings.PluginSettingsRow.viewLogs'
])

/** True when a protected-prefix path is plugin chrome a language pack may translate. */
export function translatablePluginChrome(path: string): boolean {
  return TRANSLATABLE_PLUGIN_CHROME.has(path)
}

/** Walk protected containers only when exempt chrome exists below; independently validate every descendant leaf’s full path. */
export function translatablePluginChromeContainer(path: string): boolean {
  const prefix = `${path}.`
  for (const exempt of TRANSLATABLE_PLUGIN_CHROME) {
    if (exempt.startsWith(prefix)) {
      return true
    }
  }
  return false
}

/** The exempt paths, for tests that check the list against the English catalog. */
export function translatablePluginChromePaths(): string[] {
  return [...TRANSLATABLE_PLUGIN_CHROME]
}
