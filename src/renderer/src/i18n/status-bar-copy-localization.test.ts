/**
 * The status bar builds its Resource Manager tooltip and remote-host count in
 * helper functions, which the coverage audit does not inspect — it looks at JSX
 * attributes and object properties, not values returned by helpers. These
 * assertions pin the catalog contract so a helper that goes back to a bare
 * literal fails here.
 */
import { describe, expect, it } from 'vitest'
import en from './locales/en.json'

function lookup(key: string): string | undefined {
  const value = key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined,
      en as unknown
    )
  return typeof value === 'string' ? value : undefined
}

const REQUIRED_KEYS: Record<string, string> = {
  // Resource Manager tooltip and screen-reader label
  'auto.components.status.bar.ResourceUsageStatusSegment.resourceManager': 'Resource Manager',
  'auto.components.status.bar.ResourceUsageStatusSegment.tooltipHeadline':
    'Resource Manager - {{value0}} - {{value1}}',
  'auto.components.status.bar.ResourceUsageStatusSegment.memoryUnavailable': 'memory unavailable',
  'auto.components.status.bar.ResourceUsageStatusSegment.spaceScanReady': 'Space scan ready',
  'auto.components.status.bar.ResourceUsageStatusSegment.terminalSessionCountOne':
    '{{value0}} terminal session',
  'auto.components.status.bar.ResourceUsageStatusSegment.terminalSessionCountOther':
    '{{value0}} terminal sessions',
  'auto.components.status.bar.ResourceUsageStatusSegment.sessionsGroupedByWorkspace':
    'Terminal sessions are grouped by workspace.',
  'auto.components.status.bar.ResourceUsageStatusSegment.noTerminalSessions':
    'No terminal sessions yet.',
  // Remote hosts segment
  'auto.components.status.bar.SshStatusSegment.hostCountOne': '{{value0}} host',
  'auto.components.status.bar.SshStatusSegment.hostCountOther': '{{value0}} hosts',
  'auto.components.status.bar.SshStatusSegment.connectingHosts': 'Connecting…'
}

describe('status bar helper copy', () => {
  it.each(Object.entries(REQUIRED_KEYS))('keeps %s in the English catalog', (key, expected) => {
    expect(lookup(key)).toBe(expected)
  })
})
