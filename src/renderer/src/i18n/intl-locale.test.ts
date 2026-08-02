/**
 * `getIntlLocale()` exists because plugin catalogs register under a synthetic
 * `plugin<hex>` resource language. Passing that straight to `Intl` throws, and
 * passing `undefined` silently falls back to the OS locale rather than the
 * language the user selected.
 */
import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE } from './supported-languages'

describe('Intl locale resolution', () => {
  it('rejects the synthetic plugin resource language', () => {
    // Guards the reason the helper exists: Intl cannot consume the tag directly.
    expect(() => Intl.DateTimeFormat.supportedLocalesOf('plugin00720075')).toThrow(RangeError)
  })

  it('resolves a declared pack locale that Intl understands', () => {
    expect(Intl.DateTimeFormat.supportedLocalesOf('ru-RU')[0]).toBe('ru-RU')
  })

  it('has a default locale Intl can format with', () => {
    expect(Intl.DateTimeFormat.supportedLocalesOf(DEFAULT_LOCALE)[0]).toBe(DEFAULT_LOCALE)
  })
})
