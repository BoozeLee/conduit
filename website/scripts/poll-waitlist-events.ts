#!/usr/bin/env tsx
/**
 * Poll waitlist activity and emit only new events since the last run.
 *
 * Intended use: called periodically (e.g., every 5 minutes). It stores a small
 * cursor file (timestamps) so it can send incremental notifications.
 *
 * Usage:
 *   pnpm poll-waitlist-events --state-file /path/to/state.json
 *
 * Env:
 *   PUBLIC_SUPABASE_URL
 *   PUBLIC_SUPABASE_ANON_KEY
 */

import 'dotenv/config'
import { readFile, writeFile } from 'fs/promises'
import { createClient } from '@supabase/supabase-js'

type State = {
  lastSignupAt?: string | null
  lastInvitedAt?: string | null
  lastAcceptedAt?: string | null
}

type WaitlistRow = {
  id: string
  email: string
  twitter_handle: string | null
  github_username: string | null
  created_at: string
  invited_at: string | null
  accepted_at: string | null
}

function getArg(name: string): string | undefined {
  const args = process.argv.slice(2)
  const index = args.findIndex((a) => a.startsWith(`--${name}`))
  if (index === -1) return undefined
  const arg = args[index]
  if (arg.includes('=')) return arg.split('=')[1]
  return args[index + 1]
}

async function readState(stateFile: string): Promise<State> {
  try {
    const raw = await readFile(stateFile, 'utf8')
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    return parsed
  } catch {
    return {}
  }
}

async function writeState(stateFile: string, state: State): Promise<void> {
  await writeFile(stateFile, JSON.stringify(state, null, 2) + '\n', 'utf8')
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString()
}

async function main() {
  const stateFile = getArg('state-file')

  if (!stateFile) {
    console.error('Usage: pnpm poll-waitlist-events --state-file <path>')
    process.exit(1)
  }

  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY must be set')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const state = await readState(stateFile)

  const newSignups: WaitlistRow[] = []
  const newInvites: WaitlistRow[] = []
  const newAcceptances: WaitlistRow[] = []

  // Signups
  {
    let query = supabase
      .from('waitlist')
      .select('id, email, twitter_handle, github_username, created_at, invited_at, accepted_at')
      .order('created_at', { ascending: true })
      .limit(100)

    if (state.lastSignupAt) {
      query = query.gt('created_at', state.lastSignupAt)
    }

    const { data, error } = await query
    if (error) {
      console.error('Error querying signups:', error.message)
      process.exit(1)
    }

    newSignups.push(...(data || []))
  }

  // Invites
  {
    let query = supabase
      .from('waitlist')
      .select('id, email, twitter_handle, github_username, created_at, invited_at, accepted_at')
      .not('invited_at', 'is', null)
      .order('invited_at', { ascending: true })
      .limit(100)

    if (state.lastInvitedAt) {
      query = query.gt('invited_at', state.lastInvitedAt)
    }

    const { data, error } = await query
    if (error) {
      console.error('Error querying invites:', error.message)
      process.exit(1)
    }

    newInvites.push(...(data || []))
  }

  // Acceptances
  {
    let query = supabase
      .from('waitlist')
      .select('id, email, twitter_handle, github_username, created_at, invited_at, accepted_at')
      .not('accepted_at', 'is', null)
      .order('accepted_at', { ascending: true })
      .limit(100)

    if (state.lastAcceptedAt) {
      query = query.gt('accepted_at', state.lastAcceptedAt)
    }

    const { data, error } = await query
    if (error) {
      console.error('Error querying acceptances:', error.message)
      process.exit(1)
    }

    newAcceptances.push(...(data || []))
  }

  const hasAny = newSignups.length > 0 || newInvites.length > 0 || newAcceptances.length > 0

  if (!hasAny) {
    console.log(JSON.stringify({ ok: true, events: [] }))
    return
  }

  const events: Array<{ kind: 'signup' | 'invite' | 'accept'; at: string; message: string }> = []

  for (const row of newSignups) {
    events.push({
      kind: 'signup',
      at: row.created_at,
      message: `📝 Signup: ${row.email}${row.twitter_handle ? ` (@${row.twitter_handle})` : ''} (${formatTime(row.created_at)})`,
    })
  }

  for (const row of newInvites) {
    if (!row.invited_at) continue
    events.push({
      kind: 'invite',
      at: row.invited_at,
      message: `📧 Invited: ${row.email} (${formatTime(row.invited_at)})`,
    })
  }

  for (const row of newAcceptances) {
    if (!row.accepted_at) continue
    events.push({
      kind: 'accept',
      at: row.accepted_at,
      message: `✅ Accepted: ${row.github_username || '(no username)'} (${row.email}) (${formatTime(row.accepted_at)})`,
    })
  }

  events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())

  // Update cursors to the max processed timestamps.
  const nextState: State = {
    lastSignupAt: newSignups.length ? newSignups[newSignups.length - 1].created_at : state.lastSignupAt || null,
    lastInvitedAt: newInvites.length ? (newInvites[newInvites.length - 1].invited_at as string) : state.lastInvitedAt || null,
    lastAcceptedAt: newAcceptances.length ? (newAcceptances[newAcceptances.length - 1].accepted_at as string) : state.lastAcceptedAt || null,
  }

  await writeState(stateFile, nextState)

  console.log(JSON.stringify({ ok: true, events }))
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
