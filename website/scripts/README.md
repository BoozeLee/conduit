# Admin Scripts

These scripts help you administer the Conduit waitlist/invite system.

## Setup

From `website/`:

- Install deps: `pnpm install`
- Create `.env` from `.env.example` and fill:
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
  - `RESEND_API_KEY` (only needed when sending emails)
  - `SITE_URL` (optional)
  - `GITHUB_PAT` (only needed for GitHub collaborator actions)

## Existing scripts

- `pnpm invite ...` — send invites to waitlist entries (batch or by email/twitter)
- `pnpm reset-invite ...` — reset invite status for testing, optionally resend
- `pnpm tail` — poll and print signups/invites/acceptances
- `pnpm tail-invites` — poll and print acceptances only
- `pnpm test-welcome-email ...` — send a test welcome email via Resend
- `pnpm resend-correction ...` — send a follow-up correction email to recipients

## Admin CLI (new)

- `pnpm admin status` — counts + invite-token health
- `pnpm admin list --state waiting --limit 20`
- `pnpm admin list --state invited --limit 20`
- `pnpm admin list --state accepted --limit 20`
- `pnpm admin approve --count 5 --start 1 --dry-run`
- `pnpm admin approve --count 5 --start 1 --send`
- `pnpm admin approve --email user@example.com --dry-run|--send`
- `pnpm admin approve --twitter somehandle --dry-run|--send`
- `pnpm admin resend-invite --email user@example.com --dry-run`
- `pnpm admin resend-invite --email user@example.com --send`
- `pnpm admin github-add --username someuser --dry-run`

The `--send` operations prompt for confirmation.
