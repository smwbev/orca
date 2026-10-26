import { translate } from '@/i18n/i18n'
import type { DropdownActionContext } from './source-control-dropdown-action-context'
import {
  describeFastForwardCount,
  describePullCount,
  describePushCount,
  describeSyncCounts,
  formatManualForcePushTitle,
  formatUnpublishedForcePushTitle
} from './source-control-dropdown-labels'

// Pull, Fast-forward, Sync, and Publish wait on the same branch and PR status checks.
function branchStatusTitle(ctx: DropdownActionContext): string | null {
  if (ctx.upstreamLoading) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.checkingBranchStatus',
      'Checking branch status…'
    )
  }
  if (ctx.publishBlockedByPRLoading) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titleCheckingPrStatus',
      'Checking PR status…'
    )
  }
  if (ctx.publishBlockedByMergedPR) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titlePrAlreadyMerged',
      'PR is already merged'
    )
  }
  return null
}

function linkedReviewTargetUnavailableTitle(): string {
  return translate(
    'auto.components.right.sidebar.source.control.dropdown.items.titleLinkedReviewTargetUnavailable',
    'Linked review branch target is unavailable'
  )
}

export function resolvePushTitle(ctx: DropdownActionContext): string {
  const { upstreamStatus, ahead, behind } = ctx
  if (ctx.publishBlockedByDetachedHead) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titleCheckOutBranchToPush',
      'Check out a branch before pushing commits'
    )
  }
  if (ctx.pushBlockedByOpenHostedReviewTarget) {
    return linkedReviewTargetUnavailableTitle()
  }
  if (!ctx.upstreamLoading && ctx.canPushUntrackedHostedReview) {
    return translate(
      'auto.components.right.sidebar.source.control.primary.action.1d47e850cf',
      'Push updates to the linked review branch'
    )
  }
  if (ctx.upstreamLoading || !ctx.hasUpstream) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titlePushAndSetUpstream',
      'Push this branch and set an upstream if needed'
    )
  }
  if (ctx.shouldForcePushWithLease) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titleTryRegularPush',
      'Try a regular push; git may require force push'
    )
  }
  if (behind > 0 && ahead > 0) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titlePushMayNeedSync',
      'Push local commits; git may require syncing first'
    )
  }
  if (ahead !== 0) {
    return describePushCount(ahead)
  }
  return upstreamStatus?.upstreamName
    ? translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titleNothingToPushTo',
        'Nothing to push to {{upstreamName}}',
        { upstreamName: upstreamStatus.upstreamName }
      )
    : translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titleNothingToPush',
        'Nothing to push'
      )
}

export function resolveForcePushTitle(ctx: DropdownActionContext): string {
  const { upstreamStatus, pushLabelCount, behind } = ctx
  if (ctx.publishBlockedByDetachedHead) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titleCheckOutBranchToForcePush',
      'Check out a branch before force pushing commits'
    )
  }
  if (ctx.pushBlockedByOpenHostedReviewTarget) {
    return linkedReviewTargetUnavailableTitle()
  }
  if (ctx.upstreamLoading || !ctx.hasUpstream) {
    return formatUnpublishedForcePushTitle(ctx.branchCommitsAhead)
  }
  if (pushLabelCount === 0) {
    return upstreamStatus?.upstreamName
      ? translate(
          'auto.components.right.sidebar.source.control.dropdown.items.titleNothingToForcePushTo',
          'Nothing to force push to {{upstreamName}}',
          { upstreamName: upstreamStatus.upstreamName }
        )
      : translate(
          'auto.components.right.sidebar.source.control.dropdown.items.titleNothingToForcePush',
          'Nothing to force push'
        )
  }
  return ctx.shouldForcePushWithLease
    ? ctx.forcePushTitle
    : formatManualForcePushTitle(pushLabelCount, behind, upstreamStatus?.upstreamName)
}

export function resolvePullTitle(ctx: DropdownActionContext): string {
  const statusTitle = branchStatusTitle(ctx)
  if (statusTitle !== null) {
    return statusTitle
  }
  if (ctx.publishBlockedByDetachedHead) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titleCheckOutBranchToPull',
      'Check out a branch before pulling commits'
    )
  }
  if (!ctx.hasUpstream) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titlePublishBranchFirstToPull',
      'Publish the branch first to pull commits'
    )
  }
  if (ctx.shouldForcePushWithLease) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titleNothingNewToPull',
      'Nothing new to pull — remote only has older copies of local commits'
    )
  }
  return ctx.behind === 0
    ? translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titleNothingToPull',
        'Nothing to pull'
      )
    : describePullCount(ctx.behind)
}

export function resolveFastForwardTitle(ctx: DropdownActionContext): string {
  const statusTitle = branchStatusTitle(ctx)
  if (statusTitle !== null) {
    return statusTitle
  }
  if (ctx.publishBlockedByDetachedHead) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titleCheckOutBranchToFastForward',
      'Check out a branch before fast-forwarding'
    )
  }
  if (!ctx.hasUpstream) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titlePublishBranchFirstToFastForward',
      'Publish the branch first to fast-forward'
    )
  }
  if (ctx.shouldForcePushWithLease) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titleNothingNewToFastForward',
      'Nothing new to fast-forward — remote only has older copies of local commits'
    )
  }
  if (ctx.behind === 0) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titleNothingToFastForward',
      'Nothing to fast-forward'
    )
  }
  return ctx.ahead > 0
    ? translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titleTryFastForwardPull',
        'Try a fast-forward pull; git may reject local commits'
      )
    : describeFastForwardCount(ctx.behind)
}

export function resolveSyncTitle(ctx: DropdownActionContext): string {
  const statusTitle = branchStatusTitle(ctx)
  if (statusTitle !== null) {
    return statusTitle
  }
  if (ctx.publishBlockedByDetachedHead) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titleCheckOutBranchToSync',
      'Check out a branch before syncing commits'
    )
  }
  if (!ctx.hasUpstream) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titlePublishBranchFirst',
      'Publish the branch first to sync commits'
    )
  }
  if (ctx.shouldForcePushWithLease) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titleUseForcePushToSync',
      'Use Force Push — remote only has older copies of local commits'
    )
  }
  return ctx.ahead === 0 && ctx.behind === 0
    ? translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titleBranchUpToDate',
        'Branch is up to date'
      )
    : describeSyncCounts(ctx.ahead, ctx.behind)
}

export function resolvePublishTitle(ctx: DropdownActionContext): string {
  const statusTitle = branchStatusTitle(ctx)
  if (statusTitle !== null) {
    return statusTitle
  }
  if (ctx.publishBlockedByOpenHostedReview) {
    return ctx.canPushLinkedReviewWithoutUpstream
      ? translate(
          'auto.components.right.sidebar.source.control.dropdown.items.titleLinkedReviewBranchExists',
          'Linked review branch already exists'
        )
      : linkedReviewTargetUnavailableTitle()
  }
  if (ctx.publishBlockedByDetachedHead) {
    return translate(
      'auto.components.right.sidebar.source.control.dropdown.items.titleCheckOutBranchToPublish',
      'Check out a branch before publishing commits'
    )
  }
  return ctx.hasUpstream
    ? translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titleBranchAlreadyPublished',
        'Branch is already published'
      )
    : translate(
        'auto.components.right.sidebar.source.control.primary.action.1884cf34af',
        'Publish this branch to origin'
      )
}
