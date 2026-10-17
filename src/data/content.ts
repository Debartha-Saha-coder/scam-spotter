export const sampleMessages = [
  {
    label: 'Bank alert',
    kind: 'High risk',
    text: 'BANK ALERT: Your account will be blocked today. Verify now at http://secure-bank-check.xyz and share your OTP to avoid suspension.',
  },
  {
    label: 'Delivery fee',
    kind: 'Review carefully',
    text: 'Your parcel is waiting. Pay a small delivery fee using this unfamiliar link: https://bit.ly/parcel-fee',
  },
  {
    label: 'Appointment',
    kind: 'Looks routine',
    text: 'Reminder: your appointment is confirmed for today at 3 PM. We look forward to seeing you.',
  },
]

export const quizQuestions = [
  {
    question: 'A message says your account will close in 10 minutes unless you share an OTP. What should you do?',
    options: ['Share it quickly', 'Stop and verify with the official service', 'Reply asking who they are'],
    answer: 1,
    explanation: 'Never share one-time codes. Contact the service using a trusted route.',
  },
  {
    question: 'A delivery text asks you to pay a small fee using an unexpected link. What is safest?',
    options: ['Open the link to inspect it', 'Pay if the logo looks familiar', 'Check delivery status in the official app'],
    answer: 2,
    explanation: 'Unexpected fees and links should be checked independently.',
  },
  {
    question: 'Does a low Scam Spotter score prove that a message is safe?',
    options: ['Yes, always', 'No, the rules may miss warning signs', 'Only if there is no link'],
    answer: 1,
    explanation: 'The score is a heuristic. A low score cannot guarantee a message is safe.',
  },
  {
    question: 'You win a prize, but must pay a fee to unlock it. What is a warning sign?',
    options: ['The demand for an advance fee', 'The prize has a deadline', 'Both can be warning signs'],
    answer: 2,
    explanation: 'Unexpected prizes combined with urgency or advance fees are common scam patterns.',
  },
  {
    question: 'A message claims to be from your bank. Can this app confirm the real sender?',
    options: ['Yes, based on the wording', 'No, message text cannot authenticate the sender', 'Only if it mentions KYC'],
    answer: 1,
    explanation: 'Sender identity cannot be confirmed from message text alone. Use independently sourced contact details.',
  },
]

export const learnTopics = [
  {
    title: 'Impersonation',
    description: 'A message borrows the name of a bank, government office, courier, or familiar service to seem trustworthy.',
    example: '“Your bank account will be blocked. Verify now using this link.”',
  },
  {
    title: 'Credential theft',
    description: 'A request for an OTP, password, PIN, or card information can let someone access your account or approve a payment.',
    example: '“Reply with the verification code we just sent you.”',
  },
  {
    title: 'Advance-fee and prize scams',
    description: 'Unexpected rewards that require payment or personal information upfront deserve careful verification.',
    example: '“You have won a prize. Pay a release fee to claim it today.”',
  },
  {
    title: 'Malicious links',
    description: 'Shortened, lookalike, or unexpected links can conceal a destination. A link alone is not proof of wrongdoing.',
    example: '“Your parcel is waiting—pay a small fee at this unfamiliar link.”',
  },
]
