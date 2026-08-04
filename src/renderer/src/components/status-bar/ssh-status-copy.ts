import { translate } from '@/i18n/i18n'

/** Host count shown on the collapsed remote-hosts segment. */
export function connectedHostCountLabel(count: number): string {
  return count === 1
    ? translate('auto.components.status.bar.SshStatusSegment.hostCountOne', '{{value0}} host', {
        value0: count
      })
    : translate('auto.components.status.bar.SshStatusSegment.hostCountOther', '{{value0}} hosts', {
        value0: count
      })
}

/** Placeholder shown while at least one host is still connecting. */
export function connectingHostsLabel(): string {
  return translate('auto.components.status.bar.SshStatusSegment.connectingHosts', 'Connecting…')
}
