// Share commit blockers across Commit, Commit & Push, and Commit & Sync so disabled reasons agree.

import { translate } from '@/i18n/i18n'
import {
  COMMIT_MESSAGE_REQUIRED_REASON,
  type CommitDisabledReason
} from './source-control-commit-eligibility'
import type { DropdownItem } from './source-control-dropdown-item-types'
import type { DropdownActionContext } from './source-control-dropdown-action-context'

export type CommitDropdownItems = {
  commit: DropdownItem
  commitPush: DropdownItem
  commitSync: DropdownItem
}

// Eligibility compares the English reasons, so translate them only for display.
function localizeCommitDisabledReason(reason: CommitDisabledReason | null): string | null {
  switch (reason) {
    case 'Resolve conflicts before committing':
      return translate(
        'auto.components.right.sidebar.source.control.primary.action.a6457b46a7',
        'Resolve conflicts before committing'
      )
    case 'Stage at least one file to commit':
      return translate(
        'auto.components.right.sidebar.source.control.primary.action.fa3bd4f40c',
        'Stage at least one file to commit'
      )
    case COMMIT_MESSAGE_REQUIRED_REASON:
      return translate(
        'auto.components.right.sidebar.source.control.primary.action.f01f16d77f',
        'Enter a commit message to commit'
      )
    case null:
      return null
  }
}

export function buildCommitDropdownItems(ctx: DropdownActionContext): CommitDropdownItems {
  const {
    globalBusy,
    upstreamLoading,
    hasUpstream,
    hasOpenHostedReview,
    canPushLinkedReviewWithoutUpstream,
    pushBlockedByOpenHostedReviewTarget,
    publishBlockedByMergedPR,
    publishBlockedByPRLoading,
    publishBlockedByDetachedHead,
    behind,
    shouldForcePushWithLease,
    commitDisabledReason,
    canCommit
  } = ctx
  const commitDisabledTitle = localizeCommitDisabledReason(commitDisabledReason)

  const commit: DropdownItem = {
    kind: 'commit',
    label: translate(
      'auto.components.right.sidebar.source.control.dropdown.items.2b8e6595fd',
      'Commit'
    ),
    title:
      commitDisabledTitle ??
      translate(
        'auto.components.right.sidebar.source.control.primary.action.ab41fb926b',
        'Commit staged changes'
      ),
    disabled: !canCommit
  }

  // Committing changes divergence, so compound labels must omit pre-commit counts.
  const commitPushTitle = ((): string => {
    if (upstreamLoading) {
      return translate(
        'auto.components.right.sidebar.source.control.dropdown.items.checkingBranchStatus',
        'Checking branch status…'
      )
    }
    if (publishBlockedByPRLoading) {
      return translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titleCheckingPrStatus',
        'Checking PR status…'
      )
    }
    if (publishBlockedByMergedPR) {
      return translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titlePrAlreadyMerged',
        'PR is already merged'
      )
    }
    if (publishBlockedByDetachedHead) {
      return translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titleCheckOutBranchToPush',
        'Check out a branch before pushing commits'
      )
    }
    if (pushBlockedByOpenHostedReviewTarget) {
      return translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titleLinkedReviewTargetUnavailable',
        'Linked review branch target is unavailable'
      )
    }
    if (!hasUpstream && !(hasOpenHostedReview && canPushLinkedReviewWithoutUpstream)) {
      return translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titlePublishBranchFirstToPush',
        'Publish the branch first to push commits'
      )
    }
    if (commitDisabledTitle !== null) {
      return commitDisabledTitle
    }
    if (shouldForcePushWithLease) {
      return translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titleCommitAndForcePush',
        'Commit staged changes and force push with lease'
      )
    }
    return behind > 0
      ? translate(
          'auto.components.right.sidebar.source.control.dropdown.items.titleCommitAndTryPush',
          'Commit staged changes and try to push'
        )
      : translate(
          'auto.components.right.sidebar.source.control.dropdown.items.titleCommitAndPush',
          'Commit staged changes and push'
        )
  })()
  const commitPush: DropdownItem = {
    kind: 'commit_push',
    label: shouldForcePushWithLease
      ? translate(
          'auto.components.right.sidebar.source.control.dropdown.items.commitForcePush',
          'Commit & Force Push'
        )
      : translate(
          'auto.components.right.sidebar.source.control.dropdown.items.commitPush',
          'Commit & Push'
        ),
    title: commitPushTitle,
    // Match Push: without upstream, Commit & Push requires a known open-review head.
    disabled:
      globalBusy ||
      upstreamLoading ||
      (!hasUpstream && !(hasOpenHostedReview && canPushLinkedReviewWithoutUpstream)) ||
      publishBlockedByDetachedHead ||
      publishBlockedByPRLoading ||
      publishBlockedByMergedPR ||
      commitDisabledReason !== null
  }

  const commitSyncTitle = ((): string => {
    if (upstreamLoading) {
      return translate(
        'auto.components.right.sidebar.source.control.dropdown.items.checkingBranchStatus',
        'Checking branch status…'
      )
    }
    if (publishBlockedByPRLoading) {
      return translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titleCheckingPrStatus',
        'Checking PR status…'
      )
    }
    if (publishBlockedByMergedPR) {
      return translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titlePrAlreadyMerged',
        'PR is already merged'
      )
    }
    if (publishBlockedByDetachedHead) {
      return translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titleCheckOutBranchToSync',
        'Check out a branch before syncing commits'
      )
    }
    if (!hasUpstream) {
      // Point to the existing Publish Branch primary instead of naming a nonexistent compound action.
      return translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titlePublishBranchFirst',
        'Publish the branch first to sync commits'
      )
    }
    if (shouldForcePushWithLease) {
      return (
        commitDisabledTitle ??
        translate(
          'auto.components.right.sidebar.source.control.dropdown.items.titleUseForcePush',
          'Use Commit & Force Push — remote only has older copies of local commits'
        )
      )
    }
    return (
      commitDisabledTitle ??
      translate(
        'auto.components.right.sidebar.source.control.dropdown.items.titleCommitThenPullPush',
        'Commit, then pull and push'
      )
    )
  })()
  const commitSync: DropdownItem = {
    kind: 'commit_sync',
    label: translate(
      'auto.components.right.sidebar.source.control.dropdown.items.323bb614aa',
      'Commit & Sync'
    ),
    title: commitSyncTitle,
    disabled:
      globalBusy ||
      upstreamLoading ||
      !hasUpstream ||
      publishBlockedByDetachedHead ||
      shouldForcePushWithLease ||
      commitDisabledReason !== null
  }

  return { commit, commitPush, commitSync }
}
