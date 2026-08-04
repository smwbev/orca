import type { i18n as I18nInstance } from 'i18next'
import type { PluginLanguagePackRegistration } from '../../../shared/plugins/plugin-language-pack-artifact'

/**
 * Plural rules for plugin language packs.
 *
 * A pack registers its catalog under the synthetic resource language returned by
 * `pluginLanguageResourceId()` — `plugin` followed by fixed-width hex — because
 * i18next parses punctuation in language tags during resource lookup. That tag
 * carries no locale information, so i18next's plural resolver cannot build
 * `Intl.PluralRules` from it and falls back to a two-form English rule. A
 * Russian pack then renders `5 сессии` where the language needs `5 сессий`.
 *
 * The pack already declares the locale those translations were written for.
 * Feeding that declared locale to the resolver — and only to the resolver —
 * makes the CLDR categories reachable without touching resource lookup, which
 * keeps working on the synthetic tag exactly as before.
 */

type PluralRule = { resolvedOptions: () => { pluralCategories: string[] } } | undefined
type PluralResolverLike = {
  getRule: (code: string, options?: Record<string, unknown>) => PluralRule
  clearCache?: () => void
}

const declaredLocales = new Map<string, string>()
let installedResolver: PluralResolverLike | undefined

function resolverOf(instance: I18nInstance): PluralResolverLike | undefined {
  const services = (instance as unknown as { services?: { pluralResolver?: PluralResolverLike } })
    .services
  return services?.pluralResolver
}

/**
 * Point the resolver at each pack's declared locale. Idempotent: the wrapper is
 * installed once, and later calls only refresh the mapping.
 */
export function applyPluginPluralLocales(
  instance: I18nInstance,
  packs: readonly PluginLanguagePackRegistration[]
): void {
  declaredLocales.clear()
  for (const pack of packs) {
    if (pack.locale && pack.locale !== pack.resourceLanguage) {
      declaredLocales.set(pack.resourceLanguage, pack.locale)
    }
  }

  const resolver = resolverOf(instance)
  if (!resolver) {
    return
  }
  // Why: rules are cached per code, so a pack that changes locale between calls
  // would otherwise keep the rule resolved for its previous one.
  resolver.clearCache?.()
  if (installedResolver === resolver) {
    return
  }

  const base = resolver.getRule.bind(resolver)
  resolver.getRule = (code, options) => base(declaredLocales.get(code) ?? code, options)
  installedResolver = resolver
}

/** The locale a synthetic resource language resolves plurals with, for tests. */
export function pluralLocaleForResourceLanguage(resourceLanguage: string): string | undefined {
  return declaredLocales.get(resourceLanguage)
}
