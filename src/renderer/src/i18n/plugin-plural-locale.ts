import type { i18n as I18nInstance } from 'i18next'
import type { PluginLanguagePackRegistration } from '../../../shared/plugins/plugin-language-pack-artifact'

/**
 * Plural rules for plugin language packs.
 *
 * A pack registers its catalog under the synthetic `plugin<hex>` resource
 * language, which carries no locale information, so i18next cannot build
 * `Intl.PluralRules` from it and falls back to two English forms: a Russian
 * pack renders `5 сессии` where the language needs `5 сессий`. Feeding the
 * locale the pack declares to the resolver — and only to the resolver — makes
 * the CLDR categories reachable while resource lookup keeps running on the
 * synthetic tag exactly as before.
 */

type PluralRule = { resolvedOptions: () => { pluralCategories: string[] } } | undefined
type PluralResolverLike = {
  getRule: (code: string, options?: Record<string, unknown>) => PluralRule
  clearCache?: () => void
}

const declaredLocales = new Map<string, string>()
let installedResolver: PluralResolverLike | undefined

/**
 * The declared locale is author-supplied text: the manifest schema accepts any
 * string, so a pack can ship `ru_RU`, `not_a_locale`, or `xx`. Both failure
 * modes are silent without this gate — `Intl` rejects a malformed tag, and for
 * a well-formed but unknown one it falls back to the *host* locale, which would
 * give the pack whichever plural rules the user's machine happens to have.
 * Returning undefined instead leaves the lookup empty, so the resolver keeps
 * running on the synthetic tag and the pack degrades to i18next's default.
 */
function canonicalPluralLocale(declared: string): string | undefined {
  // POSIX-style tags are a common manifest slip; Intl only accepts dashes.
  const candidate = declared.trim().replace(/_/g, '-')
  let canonical: string | undefined
  try {
    canonical = Intl.getCanonicalLocales(candidate)[0]
  } catch {
    return undefined
  }
  if (!canonical) {
    return undefined
  }
  return Intl.PluralRules.supportedLocalesOf(canonical).length > 0 ? canonical : undefined
}

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
    if (!pack.locale || pack.locale === pack.resourceLanguage) {
      continue
    }
    const canonical = canonicalPluralLocale(pack.locale)
    if (canonical) {
      declaredLocales.set(pack.resourceLanguage, canonical)
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
