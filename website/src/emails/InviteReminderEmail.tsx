/**
 * Invite Reminder Email Template
 * Sent when a user hasn't accepted their invite after N days
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

interface InviteReminderEmailProps {
  inviteUrl: string
  expiresInDays?: number
}

export default function InviteReminderEmail({
  inviteUrl,
  expiresInDays = 7,
}: InviteReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Conduit invite is waiting for you</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Logo/Header */}
          <Text style={styles.logo}>CONDUIT</Text>

          {/* Main content */}
          <Section style={styles.card}>
            <Text style={styles.heading}>Your Invite is Waiting!</Text>

            <Text style={styles.description}>
              We noticed you haven't had a chance to accept your Conduit invite
              yet. Your spot is still reserved — just click below to get
              started!
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

            {/* Discord Community - PROMINENT */}
            <Section style={styles.discordSection}>
              <Text style={styles.discordHeading}>
                💬 Need help? Join our Discord!
              </Text>
              <Text style={styles.discordText}>
                If you're having trouble accepting your invite or have questions
                about getting started, our community is here to help. Get
                real-time support from the team and other early adopters.
              </Text>
              <Section style={styles.discordButtonContainer}>
                <Button
                  href="https://discord.gg/F9pfRd642H"
                  style={styles.discordButton}
                >
                  Join Discord Community
                </Button>
              </Section>
            </Section>

            <Text style={styles.expiry}>
              This invite expires in {expiresInDays} days.
            </Text>

            <Text style={styles.relinquish}>
              No longer interested? Just reply to this email and we'll give your
              spot to someone on the waitlist.
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
  relinquish: {
    color: '#606070',
    fontSize: '12px',
    textAlign: 'center' as const,
    lineHeight: '1.5',
    marginTop: '16px',
  },
  discordSection: {
    marginTop: '24px',
    padding: '20px',
    backgroundColor: '#1a1a24',
    borderRadius: '8px',
    border: '1px solid #5865f2',
  },
  discordHeading: {
    color: '#5865f2',
    fontSize: '16px',
    fontWeight: '600' as const,
    margin: '0 0 12px 0',
    textAlign: 'center' as const,
  },
  discordText: {
    color: '#a0a0b0',
    fontSize: '13px',
    lineHeight: '1.5',
    margin: '0 0 16px 0',
    textAlign: 'center' as const,
  },
  discordButtonContainer: {
    textAlign: 'center' as const,
    marginBottom: '8px',
  },
  discordButton: {
    backgroundColor: '#5865f2',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
    display: 'inline-block',
  },
  footer: {
    color: '#606070',
    fontSize: '12px',
    textAlign: 'center' as const,
    marginTop: '30px',
  },
}
