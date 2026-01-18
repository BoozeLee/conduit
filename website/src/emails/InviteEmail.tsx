/**
 * Invite Email Template
 * Sent when a waitlist user is invited to access Conduit
 */
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Link,
  Preview,
  Section,
  Hr,
  Button,
} from '@react-email/components'

interface InviteEmailProps {
  inviteUrl: string
  expiresInDays?: number
}

export default function InviteEmail({
  inviteUrl,
  expiresInDays = 7,
}: InviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You're invited to access Conduit</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Logo/Header */}
          <Text style={styles.logo}>CONDUIT</Text>

          {/* Main content */}
          <Section style={styles.card}>
            <Text style={styles.heading}>You're Invited!</Text>

            <Text style={styles.description}>
              Your spot on the Conduit waitlist has come up. You now have early
              access to run a team of AI agents in your terminal.
            </Text>

            <Section style={styles.buttonContainer}>
              <Button href={inviteUrl} style={styles.button}>
                Accept Invite
              </Button>
            </Section>

            <Hr style={styles.divider} />

            <Text style={styles.instructions}>
              Click the button above to connect your GitHub account and get
              access to the private repository.
            </Text>

            {/* Discord Community */}
            <Section style={styles.discordSection}>
              <Text style={styles.discordHeading}>💬 Join our Discord community</Text>
              <Text style={styles.discordText}>
                Have questions? Get help and connect with other early adopters.{' '}
                <Link href="https://discord.gg/F9pfRd642H" style={styles.discordLink}>
                  Join Discord
                </Link>
              </Text>
            </Section>

            <Text style={styles.expiry}>
              This invite expires in {expiresInDays} days.
            </Text>
          </Section>

          {/* Footer */}
          <Text style={styles.footer}>
            Conduit - Run a team of AI agents in your terminal
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#0a0a0f',
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    margin: 0,
    padding: 0,
  },
  container: {
    padding: '40px 20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  logo: {
    color: '#00ff88',
    fontSize: '24px',
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    margin: '0 0 30px 0',
    letterSpacing: '4px',
  },
  card: {
    backgroundColor: '#111118',
    padding: '30px',
    borderRadius: '8px',
    border: '1px solid #2a2a3a',
  },
  heading: {
    color: '#e0e0e8',
    fontSize: '24px',
    fontWeight: '600' as const,
    margin: '0 0 20px 0',
    textAlign: 'center' as const,
  },
  description: {
    color: '#a0a0b0',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 24px 0',
    textAlign: 'center' as const,
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '24px 0',
  },
  button: {
    backgroundColor: '#00ff88',
    color: '#0a0a0f',
    padding: '14px 32px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
    display: 'inline-block',
  },
  divider: {
    borderColor: '#2a2a3a',
    borderWidth: '1px',
    margin: '24px 0',
  },
  instructions: {
    color: '#808090',
    fontSize: '13px',
    lineHeight: '1.5',
    margin: '0 0 12px 0',
    textAlign: 'center' as const,
  },
  expiry: {
    color: '#ffaa00',
    fontSize: '12px',
    textAlign: 'center' as const,
    margin: 0,
  },
  discordSection: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #2a2a3a',
  },
  discordHeading: {
    color: '#a0a0b0',
    fontSize: '14px',
    fontWeight: '600' as const,
    margin: '0 0 8px 0',
    textAlign: 'center' as const,
  },
  discordText: {
    color: '#808090',
    fontSize: '13px',
    lineHeight: '1.5',
    margin: 0,
    textAlign: 'center' as const,
  },
  discordLink: {
    color: '#00d4ff',
    textDecoration: 'none',
  },
  footer: {
    color: '#606070',
    fontSize: '12px',
    textAlign: 'center' as const,
    marginTop: '30px',
  },
}
