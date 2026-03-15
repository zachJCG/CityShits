export const HumorNarrations = {
  map: [
    'Scanning for porcelain palaces in your vicinity...',
    'Deploying throne-detection satellites...',
    'Your colon called. It wants options.',
  ],
  detail_good: [
    "Congratulations, you've found a five-star shitter. Proceed to drop the kids off at the pool.",
    'This throne has been blessed by the restroom gods.',
    'If toilets had Michelin stars, this one would have three.',
  ],
  detail_bad: [
    'Brave soul. May your colon forgive you.',
    'Enter at your own risk. We are not liable for trauma.',
    "This is the restroom equivalent of 'hold my beer.'",
  ],
  detail_mid: [
    "It's not great, it's not terrible. It's a 3.6 roentgen of bathrooms.",
    'Mediocrity has a throne, and this is it.',
  ],
  add: [
    "You're about to make history. Or at least, log it.",
    'A new throne for the database of destiny!',
    "Future poopers will sing songs of your contribution.",
  ],
  panic: [
    'CODE BROWN DETECTED. INITIATING EMERGENCY PROTOCOLS.',
    'DEFCON 💩. This is not a drill.',
    'Your bowels have declared a state of emergency.',
  ],
  review_submitted: [
    'Your contribution to science has been noted.',
    'The throne gods smile upon your offering.',
    "You've earned your place in the Hall of Flushes.",
  ],
  profile: [
    'Behold, your legacy of porcelain adventures.',
    'Every great explorer has a logbook. This is yours.',
  ],
} as const;

export function getRandomNarration(key: keyof typeof HumorNarrations): string {
  const options = HumorNarrations[key];
  return options[Math.floor(Math.random() * options.length)];
}
