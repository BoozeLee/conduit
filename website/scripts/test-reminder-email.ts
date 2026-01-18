#!/usr/bin/env tsx
/**
 * Test Reminder/Expired Email - Send a test email
 *
 * Usage:
 *   pnpm test-reminder-email --to user@example.com                    # Send reminder email
 *   pnpm test-reminder-email --to user@example.com --type expired     # Send expired invite email
 */

import 'dotenv/config'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import InviteReminderEmail from '../src/emails/InviteReminderEmail'
import ExpiredInviteEmail from '../src/emails/ExpiredInviteEmail'

// Parse command line arguments
const args = process.argv.slice(2)
const getArg = (name: string): string | undefined => {
  const index = args.findIndex((a) => a.startsWith(`--${name}`))
  if (index === -1) return undefined
  const arg = args[index]
  if (arg.includes('=')) return arg.split('=')[1]
  return args[index + 1]
}

const to = getArg('to')
const type = getArg('type') || 'reminder' // 'reminder' or 'expired'

if (!to) {
  console.error('Usage: pnpm test-reminder-email --to <email> [--type reminder|expired]')
  process.exit(1)
}

if (type !== 'reminder' && type !== 'expired') {
  console.error('Error: --type must be "reminder" or "expired"')
  process.exit(1)
}

const resendKey = process.env.RESEND_API_KEY

if (!resendKey) {
  console.error('Error: RESEND_API_KEY must be set in .env')
  process.exit(1)
}

const resend = new Resend(resendKey)

async function main() {
  const testInviteUrl = 'https://getconduit.sh/invite/test-token-12345'

  console.log(`\n📧 Sending test ${type} email...\n`)
  console.log(`  To: ${to}`)
  console.log(`  Type: ${type}`)
  console.log(`  Test URL: ${testInviteUrl}\n`)

  try {
    const EmailComponent = type === 'reminder' ? InviteReminderEmail : ExpiredInviteEmail
    const subject =
      type === 'reminder'
        ? 'Your Conduit invite is waiting for you'
        : 'Your Conduit invite has been renewed'

    const html = await render(EmailComponent({ inviteUrl: testInviteUrl }))

    const { data, error } = await resend.emails.send({
      from: 'Felipe Coury <felipe@getconduit.sh>',
      to: to!,
      subject,
      html,
    })

    if (error) {
      console.error('✗ Failed to send email:', error.message)
      process.exit(1)
    }

    console.log('✓ Email sent successfully!')
    console.log(`  Message ID: ${data?.id}\n`)
  } catch (err) {
    console.error('✗ Error:', err)
    process.exit(1)
  }
}

main()
