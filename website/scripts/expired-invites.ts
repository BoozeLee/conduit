#!/usr/bin/env tsx
/**
 * Expired Invites Script - Find and resend invites for expired tokens
 *
 * Usage:
 *   pnpm expired-invites                  # List all expired invites
 *   pnpm expired-invites --send           # Send new invites to all expired
 *   pnpm expired-invites --send --limit 5 # Send to first 5 expired users
 *   pnpm expired-invites --dry-run        # Preview without sending
 *   pnpm expired-invites --pending 14     # Show invites pending for 14+ days
 *   pnpm expired-invites --pending 14 --send  # Send reminders to 14+ day pending
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'
import * as readline from 'readline'

// Parse command line arguments
const args = process.argv.slice(2)
const getArg = (name: string): string | undefined => {
  const index = args.findIndex((a) => a.startsWith(`--${name}`))
  if (index === -1) return undefined
  const arg = args[index]
  if (arg.includes('=')) return arg.split('=')[1]
  return args[index + 1]
}
const hasFlag = (name: string): boolean => args.includes(`--${name}`)

const send = hasFlag('send')
const dryRun = hasFlag('dry-run')
const limit = parseInt(getArg('limit') || '0', 10) // 0 = no limit
const pendingDays = getArg('pending') ? parseInt(getArg('pending')!, 10) : null

// Load environment variables
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY
const resendKey = process.env.RESEND_API_KEY
const siteUrl = process.env.SITE_URL || 'https://getconduit.sh'

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY must be set')
  process.exit(1)
}

if (send && !dryRun && !resendKey) {
  console.error('Error: RESEND_API_KEY must be set to send emails (or use --dry-run)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const resend = resendKey ? new Resend(resendKey) : null

// Helper to ask for confirmation
async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

// Generate invite token
function generateToken(): string {
  return randomBytes(32).toString('hex')
}

// Build reminder email HTML (for pending invites)
function buildReminderEmailHtml(inviteUrl: string): string {
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
      <p style="color: #e0e0e8; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">Your Invite is Waiting!</p>
      <p style="color: #a0a0b0; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
        We noticed you haven't had a chance to accept your Conduit invite yet. Your spot is still reserved — just click below to get started!
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${inviteUrl}" style="background-color: #00ff88; color: #0a0a0f; padding: 14px 32px; border-radius: 6px; font-size: 14px; font-weight: bold; text-decoration: none; display: inline-block;">Accept Invite</a>
      </div>
      <hr style="border-color: #2a2a3a; border-width: 1px; margin: 24px 0;">
      <p style="color: #808090; font-size: 13px; line-height: 1.5; margin: 0 0 12px 0; text-align: center;">
        Click the button above to connect your GitHub account and get access to the private repository.
      </p>

      <!-- Discord Community - PROMINENT -->
      <div style="margin-top: 24px; padding: 20px; background-color: #1a1a24; border-radius: 8px; border: 1px solid #5865f2;">
        <p style="color: #5865f2; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; text-align: center;">💬 Need help? Join our Discord!</p>
        <p style="color: #a0a0b0; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0; text-align: center;">
          If you're having trouble accepting your invite or have questions about getting started, our community is here to help. Get real-time support from the team and other early adopters.
        </p>
        <div style="text-align: center;">
          <a href="https://discord.gg/F9pfRd642H" style="background-color: #5865f2; color: #ffffff; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: bold; text-decoration: none; display: inline-block;">Join Discord Community</a>
        </div>
      </div>

      <p style="color: #ffaa00; font-size: 12px; text-align: center; margin: 24px 0 0 0;">This invite expires in 7 days.</p>

      <p style="color: #606070; font-size: 12px; text-align: center; margin: 16px 0 0 0; line-height: 1.5;">
        No longer interested? Just reply to this email and we'll give your spot to someone on the waitlist.
      </p>
    </div>
    <p style="color: #606070; font-size: 12px; text-align: center; margin-top: 30px;">
      Conduit - Run a team of AI agents in your terminal
    </p>
  </div>
</body>
</html>
`
}

// Build expired invite email HTML (for expired tokens)
function buildExpiredInviteEmailHtml(inviteUrl: string): string {
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
      <p style="color: #e0e0e8; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">Your Invite Has Been Renewed!</p>
      <p style="color: #a0a0b0; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
        We noticed your previous Conduit invite expired before you had a chance to accept it. No worries — we've generated a fresh invite for you!
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${inviteUrl}" style="background-color: #00ff88; color: #0a0a0f; padding: 14px 32px; border-radius: 6px; font-size: 14px; font-weight: bold; text-decoration: none; display: inline-block;">Accept Invite</a>
      </div>
      <hr style="border-color: #2a2a3a; border-width: 1px; margin: 24px 0;">
      <p style="color: #808090; font-size: 13px; line-height: 1.5; margin: 0 0 12px 0; text-align: center;">
        Click the button above to connect your GitHub account and get access to the private repository.
      </p>

      <!-- Discord Community - PROMINENT -->
      <div style="margin-top: 24px; padding: 20px; background-color: #1a1a24; border-radius: 8px; border: 1px solid #5865f2;">
        <p style="color: #5865f2; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; text-align: center;">💬 Having trouble? Join our Discord!</p>
        <p style="color: #a0a0b0; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0; text-align: center;">
          If you're experiencing any issues accepting your invite or getting set up, our community is here to help. Get real-time support and connect with other early adopters.
        </p>
        <div style="text-align: center;">
          <a href="https://discord.gg/F9pfRd642H" style="background-color: #5865f2; color: #ffffff; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: bold; text-decoration: none; display: inline-block;">Join Discord Community</a>
        </div>
      </div>

      <p style="color: #ffaa00; font-size: 12px; text-align: center; margin: 24px 0 0 0;">This new invite expires in 7 days.</p>

      <p style="color: #606070; font-size: 12px; text-align: center; margin: 16px 0 0 0; line-height: 1.5;">
        No longer interested? Just reply to this email and we'll give your spot to someone on the waitlist.
      </p>
    </div>
    <p style="color: #606070; font-size: 12px; text-align: center; margin-top: 30px;">
      Conduit - Run a team of AI agents in your terminal
    </p>
  </div>
</body>
</html>
`
}

interface ExpiredInvite {
  token_id: string
  token: string
  expires_at: string
  waitlist_id: string
  email: string
  twitter_handle: string | null
  invited_at: string
  accepted_at: string | null
}

async function main() {
  const mode = pendingDays !== null ? 'pending' : 'expired'
  console.log(`\n⏰ ${mode === 'pending' ? `Pending Invites (${pendingDays}+ days)` : 'Expired Invites'} Script\n`)

  let invitesToProcess: ExpiredInvite[] = []

  if (mode === 'pending') {
    // Find invites that have been pending for N+ days (invited but not accepted)
    const cutoffDate = new Date(Date.now() - pendingDays! * 24 * 60 * 60 * 1000).toISOString()

    const { data: pendingInvites, error } = await supabase
      .from('waitlist')
      .select(
        `
        id,
        email,
        twitter_handle,
        invited_at,
        accepted_at,
        invite_tokens (
          id,
          token,
          expires_at
        )
      `
      )
      .not('invited_at', 'is', null)
      .is('accepted_at', null)
      .lt('invited_at', cutoffDate)
      .order('invited_at', { ascending: true })

    if (error) {
      console.error('Error fetching pending invites:', error.message)
      process.exit(1)
    }

    invitesToProcess = (pendingInvites || [])
      .filter((w: any) => w.invite_tokens && w.invite_tokens.length > 0)
      .map((w: any) => {
        const token = w.invite_tokens[0]
        return {
          token_id: token.id,
          token: token.token,
          expires_at: token.expires_at,
          waitlist_id: w.id,
          email: w.email,
          twitter_handle: w.twitter_handle,
          invited_at: w.invited_at,
          accepted_at: w.accepted_at,
        }
      })
  } else {
    // Find expired invite tokens with their waitlist info
    // Only include users who haven't accepted (accepted_at is null)
    const { data: expiredTokens, error } = await supabase
      .from('invite_tokens')
      .select(
        `
        id,
        token,
        expires_at,
        waitlist_id,
        waitlist:waitlist_id (
          id,
          email,
          twitter_handle,
          invited_at,
          accepted_at
        )
      `
      )
      .lt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true })

    if (error) {
      console.error('Error fetching expired invites:', error.message)
      process.exit(1)
    }

    // Filter to only include users who haven't accepted yet
    invitesToProcess = (expiredTokens || [])
      .filter((t: any) => t.waitlist && !t.waitlist.accepted_at)
      .map((t: any) => ({
        token_id: t.id,
        token: t.token,
        expires_at: t.expires_at,
        waitlist_id: t.waitlist.id,
        email: t.waitlist.email,
        twitter_handle: t.waitlist.twitter_handle,
        invited_at: t.waitlist.invited_at,
        accepted_at: t.waitlist.accepted_at,
      }))
  }

  if (invitesToProcess.length === 0) {
    console.log(
      mode === 'pending'
        ? `No invites pending for ${pendingDays}+ days found.\n`
        : 'No expired invites found (all invited users have already accepted).\n'
    )
    process.exit(0)
  }

  // Apply limit if specified
  const toProcess = limit > 0 ? invitesToProcess.slice(0, limit) : invitesToProcess

  // Display table
  const totalCount = invitesToProcess.length
  console.log(`Found ${totalCount} ${mode} invite(s)${limit > 0 ? ` (showing ${toProcess.length})` : ''}:\n`)

  const dateHeader = mode === 'pending' ? 'Invited' : 'Expired'
  console.log('┌────────────────────────────────────────────────────────────────────────────────────────────────┐')
  console.log(`│ #   │ Email                          │ Twitter            │ ${dateHeader.padEnd(25)} │ Days │`)
  console.log('├────────────────────────────────────────────────────────────────────────────────────────────────┤')

  toProcess.forEach((invite, i) => {
    const email = invite.email.padEnd(30).slice(0, 30)
    const twitter = (invite.twitter_handle || '-').padEnd(18).slice(0, 18)
    const dateValue = mode === 'pending' ? invite.invited_at : invite.expires_at
    const dateStr = new Date(dateValue).toLocaleString().padEnd(25).slice(0, 25)
    const daysAgo = Math.floor((Date.now() - new Date(dateValue).getTime()) / (24 * 60 * 60 * 1000))
    console.log(`│ ${String(i + 1).padStart(3)} │ ${email} │ ${twitter} │ ${dateStr} │ ${String(daysAgo).padStart(4)} │`)
  })

  console.log('└────────────────────────────────────────────────────────────────────────────────────────────────┘\n')

  if (!send) {
    console.log('To send renewal emails, run with --send flag:')
    if (mode === 'pending') {
      console.log(`  pnpm expired-invites --pending ${pendingDays} --send`)
      console.log(`  pnpm expired-invites --pending ${pendingDays} --send --limit 5`)
    } else {
      console.log('  pnpm expired-invites --send')
      console.log('  pnpm expired-invites --send --limit 5')
    }
    console.log('  Add --dry-run to preview without sending\n')
    process.exit(0)
  }

  if (dryRun) {
    console.log('Dry run mode - no emails will be sent and no tokens will be updated.\n')
    process.exit(0)
  }

  // Confirm before sending
  const confirmed = await confirm(`Send ${toProcess.length} renewal email(s)?`)
  if (!confirmed) {
    console.log('Aborted.\n')
    process.exit(0)
  }

  console.log('\nSending renewal emails...\n')

  let successCount = 0
  let failCount = 0

  for (const invite of toProcess) {
    const newToken = generateToken()
    const inviteUrl = `${siteUrl}/invite/${newToken}`
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    try {
      // Delete old token
      const { error: deleteError } = await supabase
        .from('invite_tokens')
        .delete()
        .eq('id', invite.token_id)

      if (deleteError) {
        console.error(`  ✗ ${invite.email}: Failed to delete old token - ${deleteError.message}`)
        failCount++
        continue
      }

      // Insert new invite token
      const { error: tokenError } = await supabase.from('invite_tokens').insert({
        token: newToken,
        waitlist_id: invite.waitlist_id,
        expires_at: expiresAt,
      })

      if (tokenError) {
        console.error(`  ✗ ${invite.email}: Failed to create new token - ${tokenError.message}`)
        failCount++
        continue
      }

      // Update waitlist invited_at to reflect the new invite
      const { error: updateError } = await supabase
        .from('waitlist')
        .update({ invited_at: new Date().toISOString() })
        .eq('id', invite.waitlist_id)

      if (updateError) {
        console.error(`  ✗ ${invite.email}: Failed to update waitlist - ${updateError.message}`)
        failCount++
        continue
      }

      // Send email (use appropriate template based on mode)
      if (resend) {
        const emailSubject = mode === 'pending'
          ? "Your Conduit invite is waiting for you"
          : "Your Conduit invite has been renewed"
        const emailHtml = mode === 'pending'
          ? buildReminderEmailHtml(inviteUrl)
          : buildExpiredInviteEmailHtml(inviteUrl)

        const { error: emailError } = await resend.emails.send({
          from: 'Felipe Coury <felipe@getconduit.sh>',
          to: invite.email,
          subject: emailSubject,
          html: emailHtml,
        })

        if (emailError) {
          console.error(`  ✗ ${invite.email}: Failed to send email - ${emailError.message}`)
          failCount++
          continue
        }
      }

      console.log(`  ✓ ${invite.email}`)
      successCount++
    } catch (err) {
      console.error(`  ✗ ${invite.email}: ${err}`)
      failCount++
    }
  }

  console.log('\n────────────────────────────────────────')
  console.log(`Summary: ${successCount} sent, ${failCount} failed`)
  console.log('────────────────────────────────────────\n')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
