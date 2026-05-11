# OpenAPI export inventory — 2026-05-11

**Source:** [`https://tamm.ultimate-dev2.com/public/docs?api-docs.json`](https://tamm.ultimate-dev2.com/public/docs?api-docs.json)  
**API:** `TAMM Construction API` **v1.0.0** · server base path **`/api/v1`**  
**Count:** **80** path + method combinations (many paths expose multiple verbs).

This file is a **frozen checklist** for backend/frontend alignment. Re-export after each deploy and diff against git.

---

## Routes (method + path)

| Method | Path                                            |
| ------ | ----------------------------------------------- |
| GET    | /admin/permissions                              |
| GET    | /admin/projects/pending                         |
| POST   | /admin/projects/{id}/approve                    |
| POST   | /admin/projects/{id}/assign-supervisor          |
| POST   | /admin/projects/{id}/reject                     |
| GET    | /admin/roles                                    |
| POST   | /admin/roles                                    |
| GET    | /admin/roles/{id}                               |
| PATCH  | /admin/roles/{id}                               |
| DELETE | /admin/roles/{id}                               |
| POST   | /admin/roles/{id}/permissions                   |
| DELETE | /admin/roles/{id}/permissions/{permId}          |
| POST   | /admin/users/{userId}/roles                     |
| DELETE | /admin/users/{userId}/roles/{roleId}            |
| GET    | /admin/withdrawals                              |
| GET    | /admin/withdrawals/pending                      |
| POST   | /admin/withdrawals/{withdrawal}/approve         |
| POST   | /admin/withdrawals/{withdrawal}/mark-completed  |
| POST   | /admin/withdrawals/{withdrawal}/mark-processing |
| POST   | /admin/withdrawals/{withdrawal}/reject          |
| POST   | /admin/withdrawals/{withdrawal}/start-review    |
| GET    | /approvals                                      |
| GET    | /approvals/{approval}                           |
| POST   | /approvals/{approval}/approve                   |
| POST   | /approvals/{approval}/reject                    |
| POST   | /auth/forgot-password                           |
| POST   | /auth/login                                     |
| POST   | /auth/logout                                    |
| GET    | /auth/me                                        |
| POST   | /auth/otp/resend                                |
| POST   | /auth/otp/send                                  |
| POST   | /auth/otp/verify                                |
| POST   | /auth/refresh                                   |
| POST   | /auth/register                                  |
| POST   | /auth/reset-password                            |
| GET    | /contractor/tasks                               |
| GET    | /field-engineer/assignments/active              |
| GET    | /field-engineer/assignments/pending             |
| POST   | /field-engineer/assignments/{assignment}/accept |
| POST   | /field-engineer/assignments/{assignment}/reject |
| GET    | /field-engineer/reports/me                      |
| POST   | /field-reports/{report}/approve                 |
| POST   | /field-reports/{report}/media                   |
| POST   | /field-reports/{report}/reject                  |
| POST   | /field-reports/{report}/request-changes         |
| POST   | /field-reports/{report}/submit                  |
| POST   | /me/avatar                                      |
| GET    | /me/profile                                     |
| PUT    | /me/profile                                     |
| GET    | /milestones                                     |
| POST   | /milestones                                     |
| GET    | /milestones/{milestone}                         |
| PUT    | /milestones/{milestone}                         |
| DELETE | /milestones/{milestone}                         |
| POST   | /milestones/{milestone}/approve                 |
| GET    | /milestones/{milestone}/progress                |
| POST   | /milestones/{milestone}/reject                  |
| POST   | /milestones/{milestone}/submit                  |
| GET    | /milestones/{milestone}/tasks                   |
| POST   | /milestones/{milestone}/tasks                   |
| GET    | /notifications                                  |
| DELETE | /notifications/{id}                             |
| POST   | /notifications/{id}/read                        |
| POST   | /notifications/read-all                         |
| GET    | /notifications/unread-count                     |
| GET    | /payments                                       |
| POST   | /payments                                       |
| GET    | /payments/{payment}                             |
| PATCH  | /payments/{payment}                             |
| GET    | /projects                                       |
| POST   | /projects                                       |
| GET    | /projects/{id}                                  |
| PUT    | /projects/{id}                                  |
| DELETE | /projects/{id}                                  |
| GET    | /projects/{id}/documents                        |
| POST   | /projects/{id}/documents                        |
| DELETE | /projects/{id}/documents/{docId}                |
| GET    | /projects/{id}/status-history                   |
| GET    | /projects/{project}/field-engineer-history      |
| POST   | /projects/{project}/field-engineer/assign       |
| POST   | /projects/{project}/field-engineer/revoke       |
| GET    | /projects/{project}/field-reports               |
| POST   | /projects/{project}/field-reports               |
| GET    | /supervisor/projects/pending-acceptance         |
| POST   | /supervisor/projects/{id}/accept                |
| POST   | /supervisor/projects/{id}/reject                |
| POST   | /tasks/{task}/approve                           |
| POST   | /tasks/{task}/mark-complete                     |
| POST   | /tasks/{task}/reject                            |
| POST   | /tasks/{task}/start                             |
| GET    | /users                                          |
| POST   | /users                                          |
| GET    | /users/{id}                                     |
| PUT    | /users/{id}                                     |
| DELETE | /users/{id}                                     |
| POST   | /withdrawals                                    |
| POST   | /withdrawals/{withdrawal}/cancel                |
| GET    | /withdrawals/me                                 |

---

## Not in this export (frontend expectations / product gaps)

| Topic                                          | Notes                                                                                                |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `GET /admin/projects`                          | Documented in `api-contracts.md` historically; **missing from export** — confirm replacement or add. |
| `POST /admin/projects/{id}/assign-engineers`   | **Missing** — use **`POST /projects/{project}/field-engineer/assign`** (+ revoke/history).           |
| In-app messaging                               | No routes — UI shells only.                                                                          |
| Admin workflow / finance / system flags & logs | No routes — UI shells only.                                                                          |
| `GET /admin/dashboard`                         | Still expected by frontend mock (see `BACKEND_BLOCKERS.md`).                                         |

---

_Generated for handoff to backend team. Regenerate when OpenAPI changes._
