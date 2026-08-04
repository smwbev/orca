import { translate } from '@/i18n/i18n'

export function formatTerminalSessionCount(count: number): string {
  return count === 1
    ? translate(
        'auto.components.status.bar.ResourceUsageStatusSegment.terminalSessionCountOne',
        '{{value0}} terminal session',
        { value0: count }
      )
    : translate(
        'auto.components.status.bar.ResourceUsageStatusSegment.terminalSessionCountOther',
        '{{value0}} terminal sessions',
        { value0: count }
      )
}

export function getResourceManagerTooltipLines(args: {
  memoryLabel: string
  sessionCount: number
  spaceScanReady: boolean
}): string[] {
  const rawMemoryLabel = args.memoryLabel.trim()
  const memoryLabel =
    rawMemoryLabel === '' || rawMemoryLabel === '-' || rawMemoryLabel === '—'
      ? translate(
          'auto.components.status.bar.ResourceUsageStatusSegment.memoryUnavailable',
          'memory unavailable'
        )
      : rawMemoryLabel
  const lines = [
    translate(
      'auto.components.status.bar.ResourceUsageStatusSegment.tooltipHeadline',
      'Resource Manager - {{value0}} - {{value1}}',
      { value0: memoryLabel, value1: formatTerminalSessionCount(args.sessionCount) }
    )
  ]

  if (args.spaceScanReady) {
    lines.push(
      translate(
        'auto.components.status.bar.ResourceUsageStatusSegment.spaceScanReady',
        'Space scan ready'
      )
    )
  }

  if (args.sessionCount > 0) {
    lines.push(
      translate(
        'auto.components.status.bar.ResourceUsageStatusSegment.sessionsGroupedByWorkspace',
        'Terminal sessions are grouped by workspace.'
      )
    )
  } else {
    lines.push(
      translate(
        'auto.components.status.bar.ResourceUsageStatusSegment.noTerminalSessions',
        'No terminal sessions yet.'
      )
    )
  }

  return lines
}

export function getResourceManagerAriaLabel(args: {
  sessionCount: number
  spaceScanReady: boolean
}): string {
  const parts = [
    translate(
      'auto.components.status.bar.ResourceUsageStatusSegment.resourceManager',
      'Resource Manager'
    ),
    formatTerminalSessionCount(args.sessionCount)
  ]

  if (args.spaceScanReady) {
    parts.push(
      translate(
        'auto.components.status.bar.ResourceUsageStatusSegment.spaceScanReady',
        'Space scan ready'
      )
    )
  }

  return parts.join(', ')
}
