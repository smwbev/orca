import { describe, expect, it } from 'vitest'
import {
  formatTerminalSessionCount,
  getResourceManagerAriaLabel,
  getResourceManagerTooltipLines
} from './resource-manager-terminal-copy'

describe('resource manager terminal copy', () => {
  it('formats terminal session counts with the terminal noun visible', () => {
    expect(formatTerminalSessionCount(1)).toBe('1 terminal session')
    expect(formatTerminalSessionCount(3)).toBe('3 terminal sessions')
  })

  it('points users from the status-bar count back to workspace terminals', () => {
    expect(
      getResourceManagerTooltipLines({
        memoryLabel: '512 MB · Σ RSS',
        sessionCount: 2,
        spaceScanReady: false
      })
    ).toEqual([
      { text: 'Resource Manager - 512 MB · Σ RSS - 2 terminal sessions', emphasized: false },
      { text: 'Terminal sessions are grouped by workspace.', emphasized: false }
    ])
  })

  it('keeps local session copy active under runtime focus', () => {
    expect(
      getResourceManagerTooltipLines({
        memoryLabel: '-',
        sessionCount: 0,
        spaceScanReady: true
      })
    ).toEqual([
      { text: 'Resource Manager - memory unavailable - 0 terminal sessions', emphasized: false },
      { text: 'Space scan ready', emphasized: true },
      { text: 'No terminal sessions yet.', emphasized: false }
    ])
  })

  // Why: the segment used to tint the space-scan row by comparing it against the
  // English text, so a translated build lost the tint. The flag replaces that.
  it('flags the space-scan row instead of leaving callers to match its text', () => {
    const lines = getResourceManagerTooltipLines({
      memoryLabel: '512 MB',
      sessionCount: 1,
      spaceScanReady: true
    })

    expect(lines.filter((line) => line.emphasized).map((line) => line.text)).toEqual([
      'Space scan ready'
    ])
  })

  it('keeps the trigger label descriptive for screen readers', () => {
    expect(
      getResourceManagerAriaLabel({
        sessionCount: 1,
        spaceScanReady: true
      })
    ).toBe('Resource Manager, 1 terminal session, Space scan ready')
  })
})
