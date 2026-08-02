/**
 * `getIntlLocale()` exists because plugin catalogs register under a synthetic
 * `plugin<hex>` resource language. Passing that straight to `Intl` throws, and
 * passing `undefined` silently falls back to the OS locale rather than the
 * language the user selected.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { getIntlLocale, i18n, setRendererPluginLanguagePacks } from './i18n'
import { pluginLanguageResourceId } from '../../../shared/plugins/plugin-language-pack-artifact'
import { DEFAULT_LOCALE } from './supported-languages'

const PACK_ID = 'plugin:smwbev.russian/ru-RU' as const
const PACK_RESOURCE = pluginLanguageResourceId(PACK_ID)

async function activate(
  language: string,
  packs: Parameters<typeof setRendererPluginLanguagePacks>[0] = []
) {
  setRendererPluginLanguagePacks(packs)
  await i18n.changeLanguage(language)
}

afterEach(async () => {
  setRendererPluginLanguagePacks([])
  await i18n.changeLanguage(DEFAULT_LOCALE)
})

describe('getIntlLocale', () => {
  it('passes a built-in locale straight through', async () => {
    await activate('es')
    expect(getIntlLocale()).toBe('es')
  })

  it('resolves a plugin resource language to the locale the pack declares', async () => {
    await activate(PACK_RESOURCE, [
      {
        id: PACK_ID,
        resourceLanguage: PACK_RESOURCE,
        pluginKey: 'smwbev.russian',
        locale: 'ru-RU',
        catalog: {}
      }
    ])
    // Without the lookup this would reach Intl as `plugin<hex>` and throw.
    expect(getIntlLocale()).toBe('ru-RU')
  })

  it('falls back to the default locale when Intl has no data for the tag', async () => {
    // A syntactically valid tag Intl does not carry data for: the guard must not
    // return it, otherwise Intl silently formats with the runtime locale.
    await activate('qaa')
    expect(getIntlLocale()).toBe(DEFAULT_LOCALE)
  })

  it('falls back to the default locale for a tag Intl rejects outright', async () => {
    await activate(PACK_RESOURCE)
    expect(getIntlLocale()).toBe(DEFAULT_LOCALE)
  })

  it('keeps the synthetic resource language unusable for Intl directly', () => {
    // Guards the reason the helper exists at all.
    expect(() => Intl.DateTimeFormat.supportedLocalesOf(PACK_RESOURCE)).toThrow(RangeError)
  })
})
