import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import * as readline from 'readline'

export type SupabaseClient = ReturnType<typeof createClient>

export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`Error: ${name} must be set`)
    process.exit(1)
  }
  return value
}

export function getSupabase(): SupabaseClient {
  const supabaseUrl = requireEnv('PUBLIC_SUPABASE_URL')
  const supabaseKey = requireEnv('PUBLIC_SUPABASE_ANON_KEY')
  return createClient(supabaseUrl, supabaseKey)
}

export function getResend(): Resend {
  const resendKey = requireEnv('RESEND_API_KEY')
  return new Resend(resendKey)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

export async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

export function parseArgs(argv: string[]): { cmd?: string; rest: string[]; flags: Record<string, string | boolean> } {
  const [cmd, ...restArgs] = argv
  const flags: Record<string, string | boolean> = {}
  const rest: string[] = []

  for (let i = 0; i < restArgs.length; i++) {
    const arg = restArgs[i]

    if (!arg.startsWith('--')) {
      rest.push(arg)
      continue
    }

    const eqIndex = arg.indexOf('=')
    if (eqIndex !== -1) {
      const key = arg.slice(2, eqIndex)
      const value = arg.slice(eqIndex + 1)
      flags[key] = value
      continue
    }

    const key = arg.slice(2)
    const next = restArgs[i + 1]

    if (next && !next.startsWith('--')) {
      flags[key] = next
      i++
    } else {
      flags[key] = true
    }
  }

  return { cmd, rest, flags }
}
