import { translate } from '@/i18n/i18n'
import type { DropdownItem } from './source-control-dropdown-item-types'
import type { DropdownActionContext } from './source-control-dropdown-action-context'
import {
  formatCountLabel,
  formatRebaseBaseRef,
  formatSyncLabel
} from './source-control-dropdown-labels'
import {
  resolveFastForwardTitle,
  resolveForcePushTitle,
  resolvePublishTitle,
  resolvePullTitle,
  resolvePushTitle,
  resolveSyncTitle
} from './source-control-dropdown-remote-titles'

export type RemoteDropdownItems = {
  push: DropdownItem
  forcePush: DropdownItem
  pull: DropdownItem
  fastForward: DropdownItem
  sync: DropdownItem
  rebase: DropdownItem
  fetch: DropdownItem
  publish: DropdownItem
}

export function buildRemoteDropdownItems(ctx: DropdownActionContext): RemoteDropdownItems {
  const {
    rebaseBaseRef,
    hasDirtyLocalChanges,
    globalBusy,
    upstreamLoading,
    hasUpstream,
    pushBlockedByOpenHostedReviewTarget,
    publishBlockedByMergedPR,
    publishBlockedByPRLoading,
    publishBlockedByOpenHostedReview,
    publishBlockedByDetachedHead,
    ahead,
    behind,
    shouldForcePushWithLease,
    pushLabelCount
  } = ctx

  const push: DropdownItem = {
    kind: 'push',
    label: formatCountLabel(
      translate('auto.components.right.sidebar.source.control.primary.action.95550cff15', 'Push'),
      ahead
    ),
    title: resolvePushTitle(ctx),
    // Push can set upstream and coexist with force-with-lease; detached HEAD and unknown review targets still block it.
    disabled: globalBusy || publishBlockedByDetachedHead || pushBlockedByOpenHostedReviewTarget
  }

  const forcePush: DropdownItem = {
    kind: 'force_push',
    label: formatCountLabel(
      translate(
        'auto.components.right.sidebar.source.control.primary.action.390abeab93',
        'Force Push'
      ),
      pushLabelCount
    ),
    title: resolveForcePushTitle(ctx),
    // Match Push target safety; force-with-lease must not push the wrong review head.
    disabled: globalBusy || publishBlockedByDetachedHead || pushBlockedByOpenHostedReviewTarget
  }

  const pull: DropdownItem = {
    kind: 'pull',
    label: formatCountLabel(
      translate('auto.components.right.sidebar.source.control.primary.action.d64292a938', 'Pull'),
      behind
    ),
    title: resolvePullTitle(ctx),
    disabled: globalBusy || upstreamLoading || !hasUpstream || publishBlockedByDetachedHead
  }

  const fastForward: DropdownItem = {
    kind: 'fast_forward',
    label: formatCountLabel(
      translate(
        'auto.components.right.sidebar.source.control.dropdown.items.fastForward',
        'Fast-forward'
      ),
      behind
    ),
    title: resolveFastForwardTitle(ctx),
    disabled: globalBusy || upstreamLoading || !hasUpstream || publishBlockedByDetachedHead
  }

  const sync: DropdownItem = {
    kind: 'sync',
    label: formatSyncLabel(
      translate('auto.components.right.sidebar.source.control.primary.action.795f1509c5', 'Sync'),
      ahead,
      behind
    ),
    title: resolveSyncTitle(ctx),
    disabled:
      globalBusy ||
      upstreamLoading ||
      !hasUpstream ||
      publishBlockedByDetachedHead ||
      shouldForcePushWithLease
  }

  const rebaseBaseLabel = rebaseBaseRef ? formatRebaseBaseRef(rebaseBaseRef) : null
  const hasRemoteBaseRef = rebaseBaseLabel?.includes('/') === true
  const rebase: DropdownItem = {
    kind: 'rebase_base',
    label: rebaseBaseLabel
      ? translate(
          'auto.components.right.sidebar.source.control.dropdown.items.rebaseFromNamedBase',
          'Rebase from {{baseRef}}',
          { baseRef: rebaseBaseLabel }
        )
      : translate(
          'auto.components.right.sidebar.source.control.dropdown.items.rebaseFromBase',
          'Rebase from Base'
        ),
    title: ((): string => {
      if (!rebaseBaseLabel || !hasRemoteBaseRef) {
        return translate(
          'auto.components.right.sidebar.source.control.dropdown.items.rebaseChooseRemoteBase',
          'Choose a remote base branch to rebase from'
        )
      }
      if (hasDirtyLocalChanges) {
        return translate(
          'auto.components.right.sidebar.source.control.dropdown.items.rebaseDirtyHint',
          'Try rebasing; git may require committing or stashing local changes first'
        )
      }
      return translate(
        'auto.components.right.sidebar.source.control.dropdown.items.rebaseWithLatestFrom',
        'Rebase current branch with latest commits from {{baseRef}}',
        { baseRef: rebaseBaseLabel }
      )
    })(),
    disabled: globalBusy || !rebaseBaseRef || !hasRemoteBaseRef
  }

  const fetch: DropdownItem = {
    kind: 'fetch',
    label: translate(
      'auto.components.right.sidebar.source.control.dropdown.items.226b85a3a7',
      'Fetch'
    ),
    title: translate(
      'auto.components.right.sidebar.source.control.dropdown.items.04d709801d',
      'Fetch from remote without merging'
    ),
    disabled: globalBusy
  }

  const publish: DropdownItem = {
    kind: 'publish',
    label:
      publishBlockedByMergedPR || publishBlockedByPRLoading
        ? translate(
            'auto.components.right.sidebar.source.control.dropdown.items.publishPrStatus',
            'PR Status'
          )
        : publishBlockedByOpenHostedReview
          ? translate(
              'auto.components.right.sidebar.source.control.dropdown.items.publishLinkedReview',
              'Linked Review'
            )
          : publishBlockedByDetachedHead
            ? translate(
                'auto.components.right.sidebar.source.control.dropdown.items.publishNoBranch',
                'No Branch'
              )
            : translate(
                'auto.components.right.sidebar.source.control.primary.action.7b4d02e6b8',
                'Publish Branch'
              ),
    title: resolvePublishTitle(ctx),
    disabled:
      globalBusy ||
      upstreamLoading ||
      hasUpstream ||
      publishBlockedByPRLoading ||
      publishBlockedByMergedPR ||
      publishBlockedByOpenHostedReview ||
      publishBlockedByDetachedHead
  }

  return { push, forcePush, pull, fastForward, sync, rebase, fetch, publish }
}
