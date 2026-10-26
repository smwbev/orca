// Primary and dropdown actions have independent priority ladders.

import { translate } from '@/i18n/i18n'
import type { DropdownActionInputs, DropdownEntry } from './source-control-dropdown-item-types'
import { deriveDropdownActionContext } from './source-control-dropdown-action-context'
import { buildCommitDropdownItems } from './source-control-dropdown-commit-items'
import { buildRemoteDropdownItems } from './source-control-dropdown-remote-items'
import { buildHostedReviewDropdownItems } from './source-control-dropdown-review-items'

/** Keep menu shape stable across states: render every row, disabling blocked actions with tooltip reasons. */
export function resolveDropdownItems(inputs: DropdownActionInputs): DropdownEntry[] {
  const ctx = deriveDropdownActionContext(inputs)
  const { commit, commitPush, commitSync } = buildCommitDropdownItems(ctx)
  const { push, forcePush, pull, fastForward, sync, rebase, fetch, publish } =
    buildRemoteDropdownItems(ctx)
  const { createPR, pushCreatePR } = buildHostedReviewDropdownItems(ctx)
  const { conflictOperation, isPullRequestOperationActive, globalBusy } = ctx

  const entries: DropdownEntry[] = [
    commit,
    commitPush,
    commitSync,
    { kind: 'separator', id: 'before-remote' },
    push,
    forcePush,
    createPR,
    pushCreatePR,
    pull,
    fastForward,
    sync,
    rebase,
    fetch,
    publish
  ]
  if (conflictOperation === 'merge' || conflictOperation === 'rebase') {
    const isRebase = conflictOperation === 'rebase'
    const label = isRebase
      ? translate('auto.components.right.sidebar.SourceControl.425f138269', 'Abort rebase')
      : translate('auto.components.right.sidebar.SourceControl.540ca8f78c', 'Abort merge')
    entries.push(
      { kind: 'separator', id: 'before-abort' },
      {
        kind: isRebase ? 'abort_rebase' : 'abort_merge',
        label,
        title: globalBusy
          ? translate(
              'auto.components.right.sidebar.source.control.dropdown.items.titleOperationInProgress',
              'Operation in progress…'
            )
          : isRebase
            ? translate(
                'auto.components.right.sidebar.source.control.dropdown.items.titleAbortRebaseInProgress',
                'Abort the rebase in progress'
              )
            : translate(
                'auto.components.right.sidebar.source.control.dropdown.items.titleAbortMergeInProgress',
                'Abort the merge in progress'
              ),
        disabled: globalBusy,
        variant: 'destructive'
      }
    )
  }
  if (!isPullRequestOperationActive) {
    return entries
  }
  return entries.map((entry) =>
    entry.kind === 'separator'
      ? entry
      : {
          ...entry,
          title: translate(
            'auto.components.right.sidebar.source.control.dropdown.items.7aad2c0240',
            'Hosted review operation in progress…'
          ),
          disabled: true
        }
  )
}
