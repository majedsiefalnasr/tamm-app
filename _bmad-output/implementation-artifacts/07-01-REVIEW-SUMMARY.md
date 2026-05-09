# Story 07-01 Code Review — Quick Summary

**Status:** ⚠️ **NOT READY FOR MERGE**

## Critical Blockers (4)

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 1 | Hardcoded "No contractors available" (not i18n'ed) | Arabic users see English | Add i18n key `projects.openForBids.noContractorsAvailable` |
| 2 | Helper text not visible until selection made | Violates AC; confuses user | Move helper text outside conditional; always show |
| 3 | No loading toast during API call | No user feedback during 300-800ms wait | Call `useNotification().info(loadingMessage)` before API |
| 4 | Race condition on double-click confirm | Double API calls; confusing error | Add `isSubmittingBids` guard; disable button during submission |

## High Priority (4)

| # | Issue | Fix |
|---|-------|-----|
| 5 | Missing subtitle element (AC requirement) | Add subtitle section in DialogHeader |
| 6 | Checkbox component (raw HTML vs shadcn-vue) | Use `<Checkbox>` component from shadcn-vue |
| 7 | No validation feedback if confirm blocked | Show error toast if user clicks when 0 selected |
| 8 | Unsafe API error handling (404 assumption) | Explicitly check response status, not just error message |

## Medium Priority (3)

- **#9** Dialog reopen state reset — Reset contractor list on close
- **#10** Empty contractor response — Add retry mechanism
- **#11-15** Polish issues (loading skeleton, timeout errors, etc.)

---

## Files Affected

```
app/components/project/OpenForBidsDialog.vue     — 6 issues (dialog component)
app/pages/projects/[id].vue                       — 3 issues (orchestration)
app/composables/useProjects.ts                    — 2 issues (API integration)
i18n/locales/en.json & ar.json                    — 1 issue (missing keys)
tests/e2e/story-07-01-open-for-bids.spec.ts       — Coverage gap
```

---

## Estimated Fix Time

- **CRITICAL blockers:** 40 min
- **HIGH priority:** 50 min
- **Test updates:** 30 min
- **Total:** 2–2.5 hours

---

## Next Steps

1. **Fix critical blockers** (#1-4)
2. **Address high-priority issues** (#5-8)
3. **Update E2E tests** (add coverage for loading toast, helper text, error cases)
4. **Test in Arabic RTL** to verify layout
5. **Re-run code review** (spot check)
6. **Mark ready** for final approval

---

**Detailed Report:** See `07-01-CODE-REVIEW-FINDINGS.md` for full code snippets and explanations.
