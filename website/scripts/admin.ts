#!/usr/bin/env tsx
/**
 * Admin CLI for Conduit waitlist/invites
 *
 * Examples:
 *   pnpm admin status
 *   pnpm admin list --state waiting --limit 20
 *   pnpm admin list --state invited --limit 20
 *   pnpm admin resend-invite --email user@example.com --dry-run
 *   pnpm admin resend-invite --email user@example.com --send
 *   pnpm admin github-add --username someuser --dry-run
 *
 * Required env (depending on command):
 *   PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY
 *   RESEND_API_KEY (for sending emails)
 *   SITE_URL (optional, defaults to https://getconduit.sh)
 *   GITHUB_PAT (for github-add)
 */

import 'dotenv/config'
import { randomBytes } from 'crypto'
import {
  confirm,
  formatDate,
  getResend,
  getSupabase,
  parseArgs,
  requireEnv,
} from './_admin_lib'

type State = 'waiting' | 'invited' | 'accepted'

function usage(): void {
  console.log(`
Conduit Admin CLI

Usage:
  pnpm admin <command> [options]

Commands:
  status
  list --state waiting|invited|accepted [--limit 20]
  approve [--count 1] [--start 1] [--email <email> | --twitter <handle>] --dry-run|--send
  resend-invite --email <email> [--dry-run | --send]
  github-add --username <github-username> [--dry-run]

Notes:
  - "approve" means: create invite token + email link to /invite/<token>
  - "waiting" = on waitlist, not invited
  - "invited" = invited_at set, accepted_at not set
  - "accepted" = accepted_at set
`)
}

function generateToken(): string {
  return randomBytes(32).toString('hex')
}

function buildInviteEmailHtml(inviteUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="background-color: #0a0a0f; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace; margin: 0; padding: 0;">
  <div style="padding: 40px 20px; max-width: 600px; margin: 0 auto;">
    <p style="color: #00ff88; font-size: 24px; font-weight: bold; text-align: center; margin: 0 0 30px 0; letter-spacing: 4px;">CONDUIT</p>
    <div style="background-color: #111118; padding: 30px; border-radius: 8px; border: 1px solid #2a2a3a;">
      <p style="color: #e0e0e8; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">You're Invited!</p>
      <p style="color: #a0a0b0; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
        Your spot on the Conduit waitlist has come up. You now have early access to run a team of AI agents in your terminal.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${inviteUrl}" style="background-color: #00ff88; color: #0a0a0f; padding: 14px 32px; border-radius: 6px; font-size: 14px; font-weight: bold; text-decoration: none; display: inline-block;">Accept Invite</a>
      </div>
      <hr style="border-color: #2a2a3a; border-width: 1px; margin: 24px 0;">
      <p style="color: #808090; font-size: 13px; line-height: 1.5; margin: 0 0 12px 0; text-align: center;">
        Click the button above to connect your GitHub account and get access to the private repository.
      </p>
      <p style="color: #ffaa00; font-size: 12px; text-align: center; margin: 0;">This invite expires in 7 days.</p>
    </div>
    <p style="color: #606070; font-size: 12px; text-align: center; margin-top: 30px;">
      Conduit - Run a team of AI agents in your terminal
    </p>
  </div>
</body>
</html>
`
}

async function cmdStatus(): Promise<void> {
  const supabase = getSupabase()

  const { count: totalWaitlist, error: totalErr } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })

  if (totalErr) {
    console.error('Error fetching waitlist count:', totalErr.message)
    process.exit(1)
  }

  const { count: totalInvited, error: invitedErr } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .not('invited_at', 'is', null)

  if (invitedErr) {
    console.error('Error fetching invited count:', invitedErr.message)
    process.exit(1)
  }

  const { count: totalAccepted, error: acceptedErr } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .not('accepted_at', 'is', null)

  if (acceptedErr) {
    console.error('Error fetching accepted count:', acceptedErr.message)
    process.exit(1)
  }

  const waitingForInvite = (totalWaitlist || 0) - (totalInvited || 0)
  const pendingAccept = (totalInvited || 0) - (totalAccepted || 0)

  console.log('\n📊 Waitlist Status')
  console.log(`   Total signups:       ${totalWaitlist}`)
  console.log(`   Waiting for invite:  ${waitingForInvite}`)
  console.log(`   Invites sent:        ${totalInvited}`)
  console.log(`   Accepted:            ${totalAccepted}`)
  console.log(`   Pending acceptance:  ${pendingAccept}`)

  // Invite token stats
  const nowIso = new Date().toISOString()
  const { count: expiredUnused, error: expiredErr } = await supabase
    .from('invite_tokens')
    .select('*', { count: 'exact', head: true })
    .is('used_at', null)
    .lt('expires_at', nowIso)

  if (expiredErr) {
    console.error('Error fetching expired tokens:', expiredErr.message)
    process.exit(1)
  }

  const { count: usedTokens, error: usedErr } = await supabase
    .from('invite_tokens')
    .select('*', { count: 'exact', head: true })
    .not('used_at', 'is', null)

  if (usedErr) {
    console.error('Error fetching used tokens:', usedErr.message)
    process.exit(1)
  }

  console.log('\n🔑 Invite Tokens')
  console.log(`   Expired (unused):    ${expiredUnused}`)
  console.log(`   Used:                ${usedTokens}`)
}

async function cmdList(state: State, limit: number): Promise<void> {
  const supabase = getSupabase()

  if (state === 'waiting') {
    const { data, error } = await supabase
      .from('waitlist')
      .select('id, email, twitter_handle, created_at')
      .is('invited_at', null)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error listing waiting users:', error.message)
      process.exit(1)
    }

    console.log(`\n🕒 Waiting for invite (showing ${data?.length || 0})\n`)
    for (const entry of data || []) {
      console.log(`- ${entry.email}${entry.twitter_handle ? ` (@${entry.twitter_handle})` : ''}`)
      console.log(`  Joined: ${formatDate(entry.created_at)}`)
    }
    return
  }

  if (state === 'invited') {
    const { data, error } = await supabase
      .from('waitlist')
      .select('id, email, twitter_handle, invited_at')
      .not('invited_at', 'is', null)
      .is('accepted_at', null)
      .order('invited_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error listing invited users:', error.message)
      process.exit(1)
    }

    console.log(`\n📧 Invited (pending acceptance) (showing ${data?.length || 0})\n`)
    for (const entry of data || []) {
      console.log(`- ${entry.email}${entry.twitter_handle ? ` (@${entry.twitter_handle})` : ''}`)
      console.log(`  Invited: ${formatDate(entry.invited_at)}`)
    }
    return
  }

  const { data, error } = await supabase
    .from('waitlist')
    .select('id, email, github_username, accepted_at')
    .not('accepted_at', 'is', null)
    .order('accepted_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error listing accepted users:', error.message)
    process.exit(1)
  }

  console.log(`\n✅ Accepted (showing ${data?.length || 0})\n`)
  for (const entry of data || []) {
    console.log(`- ${entry.github_username || '-'} (${entry.email})`)
    console.log(`  Accepted: ${formatDate(entry.accepted_at)}`)
  }
}

type WaitlistRow = {
  id: string
  email: string
  twitter_handle: string | null
  created_at: string
  invited_at: string | null
  accepted_at: string | null
  github_username: string | null
}

async function createAndSendInvite(waitlistId: string, email: string): Promise<{ inviteUrl: string }> {
  const supabase = getSupabase()
  const resend = getResend()
  const siteUrl = process.env.SITE_URL || 'https://getconduit.sh'

  const token = generateToken()
  const inviteUrl = `${siteUrl}/invite/${token}`
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error: tokenError } = await supabase.from('invite_tokens').insert({
    token,
    waitlist_id: waitlistId,
    expires_at: expiresAt,
  })

  if (tokenError) {
    console.error('✗ Failed to create invite token:', tokenError.message)
    process.exit(1)
  }

  const { error: invitedAtError } = await supabase
    .from('waitlist')
    .update({ invited_at: new Date().toISOString() })
    .eq('id', waitlistId)

  if (invitedAtError) {
    console.error('✗ Failed to update invited_at:', invitedAtError.message)
    process.exit(1)
  }

  const { error: emailError } = await resend.emails.send({
    from: 'Felipe Coury <felipe@getconduit.sh>',
    to: email,
    subject: "You're invited to access Conduit",
    html: buildInviteEmailHtml(inviteUrl),
  })

  if (emailError) {
    console.error('✗ Failed to send invite email:', emailError.message)
    process.exit(1)
  }

  return { inviteUrl }
}

async function cmdApprove(options: {
  count: number
  start: number
  dryRun: boolean
  send: boolean
  email?: string
  twitter?: string
}): Promise<void> {
  const supabase = getSupabase()

  if (options.send && options.dryRun) {
    console.error('Error: choose either --send or --dry-run')
    process.exit(1)
  }

  if (!options.send && !options.dryRun) {
    console.error('Error: approve requires --dry-run or --send')
    process.exit(1)
  }

  let entries: WaitlistRow[] = []

  if (options.email || options.twitter) {
    const searchField = options.email ? 'email' : 'twitter_handle'
    const searchValue = options.email || options.twitter

    const { data, error } = await supabase
      .from('waitlist')
      .select('id, email, twitter_handle, created_at, invited_at, accepted_at, github_username')
      .ilike(searchField, searchValue!)
      .limit(1)
      .single()

    if (error || !data) {
      console.error(`User not found with ${searchField} = ${searchValue}`)
      process.exit(1)
    }

    if (data.accepted_at) {
      console.error(`✗ User already accepted on ${formatDate(data.accepted_at)} (${data.github_username || 'unknown'})`)
      process.exit(1)
    }

    if (data.invited_at) {
      console.error(`✗ User already invited on ${formatDate(data.invited_at)}; use resend-invite instead`) 
      process.exit(1)
    }

    entries = [data]
  } else {
    const { data, error } = await supabase
      .from('waitlist')
      .select('id, email, twitter_handle, created_at, invited_at, accepted_at, github_username')
      .is('invited_at', null)
      .order('created_at', { ascending: true })
      .range(options.start - 1, options.start - 1 + options.count - 1)

    if (error) {
      console.error('Error fetching waitlist:', error.message)
      process.exit(1)
    }

    entries = data || []
  }

  if (entries.length === 0) {
    console.log('No users found to approve.')
    return
  }

  console.log(`\n✅ Approve (send invites)`) 
  console.log(`  Users: ${entries.length}`)
  if (!options.email && !options.twitter) {
    console.log(`  Start: ${options.start}`)
  }
  console.log(`  Mode:  ${options.dryRun ? 'dry-run' : 'send'}`)

  console.log('\nTargets:')
  for (const entry of entries) {
    console.log(`- ${entry.email}${entry.twitter_handle ? ` (@${entry.twitter_handle})` : ''} (joined ${formatDate(entry.created_at)})`)
  }

  if (options.dryRun) {
    console.log('\n(dry-run) No invites sent.')
    return
  }

  const confirmed = await confirm(`Send ${entries.length} invite(s)?`)
  if (!confirmed) {
    console.log('Aborted.')
    return
  }

  console.log('\nSending...\n')
  let ok = 0
  let failed = 0

  for (const entry of entries) {
    try {
      const { inviteUrl } = await createAndSendInvite(entry.id, entry.email)
      console.log(`✓ ${entry.email} -> ${inviteUrl}`)
      ok++
    } catch (err) {
      console.error(`✗ ${entry.email}: ${err}`)
      failed++
    }
  }

  console.log(`\nSummary: ${ok} sent, ${failed} failed\n`)
}

async function cmdResendInvite(email: string, send: boolean): Promise<void> {
  const supabase = getSupabase()
  const siteUrl = process.env.SITE_URL || 'https://getconduit.sh'

  const { data: waitlist, error: findError } = await supabase
    .from('waitlist')
    .select('id, email, invited_at, accepted_at, github_username')
    .eq('email', email)
    .single()

  if (findError || !waitlist) {
    console.error('✗ User not found:', findError?.message || 'No matching email')
    process.exit(1)
  }

  if (waitlist.accepted_at) {
    console.error(`✗ User already accepted on ${formatDate(waitlist.accepted_at)} (${waitlist.github_username || 'unknown'})`)
    process.exit(1)
  }

  const token = generateToken()
  const inviteUrl = `${siteUrl}/invite/${token}`
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  console.log(`\n📨 Resend invite\n`)
  console.log(`  Email:      ${waitlist.email}`)
  console.log(`  Invited at: ${formatDate(waitlist.invited_at)}`)
  console.log(`  New link:   ${inviteUrl}`)
  console.log(`  Expires:    ${formatDate(expiresAt)}`)

  if (!send) {
    console.log('\n(dry-run) No changes made. Use --send to actually send and persist.')
    return
  }

  const confirmed = await confirm(`Create a new invite token and email ${waitlist.email}?`)
  if (!confirmed) {
    console.log('Aborted.')
    return
  }

  await createAndSendInvite(waitlist.id, waitlist.email)
  console.log('\n✓ Invite resent')
}

async function cmdGithubAdd(username: string, dryRun: boolean): Promise<void> {
  const githubPat = requireEnv('GITHUB_PAT')

  console.log(`\n🐙 GitHub: add collaborator\n`)
  console.log(`  Repo:     conduit-cli/conduit`)
  console.log(`  Username: ${username}`)

  if (dryRun) {
    console.log('\n(dry-run) No changes made.')
    return
  }

  const confirmed = await confirm(`Add ${username} as a collaborator (pull access)?`)
  if (!confirmed) {
    console.log('Aborted.')
    return
  }

  const repoResponse = await fetch(
    `https://api.github.com/repos/conduit-cli/conduit/collaborators/${encodeURIComponent(username)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${githubPat}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Conduit-Admin',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ permission: 'pull' }),
    }
  )

  if (!repoResponse.ok && repoResponse.status !== 201 && repoResponse.status !== 204) {
    const errorText = await repoResponse.text()
    console.error('✗ Failed to add collaborator:', repoResponse.status, errorText)
    process.exit(1)
  }

  console.log(`✓ Added ${username} as collaborator`)
}

async function main() {
  const { cmd, flags } = parseArgs(process.argv.slice(2))

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    usage()
    return
  }

  if (cmd === 'status') {
    await cmdStatus()
    return
  }

  if (cmd === 'list') {
    const state = String(flags.state || '') as State
    const limit = parseInt(String(flags.limit || '20'), 10)

    if (!state || !['waiting', 'invited', 'accepted'].includes(state)) {
      console.error('Error: list requires --state waiting|invited|accepted')
      process.exit(1)
    }

    await cmdList(state, limit)
    return
  }

  if (cmd === 'approve') {
    const count = parseInt(String(flags.count || '1'), 10)
    const start = parseInt(String(flags.start || '1'), 10)
    const email = flags.email ? String(flags.email) : undefined
    const twitter = flags.twitter ? String(flags.twitter).replace(/^@/, '') : undefined
    const dryRun = Boolean(flags['dry-run'])
    const send = Boolean(flags.send)

    await cmdApprove({ count, start, email, twitter, dryRun, send })
    return
  }

  if (cmd === 'resend-invite') {
    const email = String(flags.email || '')
    const send = Boolean(flags.send)
    const dryRun = Boolean(flags['dry-run'])

    if (!email) {
      console.error('Error: resend-invite requires --email <email>')
      process.exit(1)
    }

    if (send && dryRun) {
      console.error('Error: choose either --send or --dry-run')
      process.exit(1)
    }

    await cmdResendInvite(email, send)
    return
  }

  if (cmd === 'github-add') {
    const username = String(flags.username || '')
    const dryRun = Boolean(flags['dry-run'])

    if (!username) {
      console.error('Error: github-add requires --username <github-username>')
      process.exit(1)
    }

    await cmdGithubAdd(username, dryRun)
    return
  }

  console.error(`Unknown command: ${cmd}`)
  usage()
  process.exit(1)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
