// Local mock data for the six sample Mosaic members, plus the option pools used
// by the profile form and the Discover filters. Photos are plain Unsplash URLs.

export interface Member {
  id: string
  firstName: string
  age: number
  city: string
  country: string
  originallyFrom: string
  intent: string
  values: string[]
  connectionStyle: string
  prompt: { question: string; answer: string }
  lens: string
  photo: string
}

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`

export const members: Member[] = [
  {
    id: 'amara',
    firstName: 'Amara',
    age: 31,
    city: 'Lisbon',
    country: 'Portugal',
    originallyFrom: 'Cape Verde',
    intent: 'Long-term, friendship first',
    values: ['Curiosity', 'Kindness', 'Emotional honesty'],
    connectionStyle: 'Slow and steady',
    prompt: {
      question: 'A friendship becomes something more when…',
      answer:
        'we can be quiet together and still feel completely at ease — no performance, just presence.',
    },
    lens: 'Possible shared values: curiosity, kindness, and emotional honesty.',
    photo: img('1759854881701-2aa0dc64fc7d'),
  },
  {
    id: 'diego',
    firstName: 'Diego',
    age: 34,
    city: 'Toronto',
    country: 'Canada',
    originallyFrom: 'Brazil',
    intent: 'Open to romance, no rush',
    values: ['Playfulness', 'Loyalty', 'Growth'],
    connectionStyle: 'Warm and open',
    prompt: {
      question: 'The best kind of Sunday is…',
      answer: 'a long walk, an unhurried coffee, and a conversation that loses track of time.',
    },
    lens: 'Possible shared values: warmth, loyalty, and a love of unhurried time.',
    photo: img('1779497056298-51a5453cbb7a'),
  },
  {
    id: 'naomi',
    firstName: 'Naomi',
    age: 29,
    city: 'Chicago',
    country: 'United States',
    originallyFrom: 'United States',
    intent: 'Building deep friendship',
    values: ['Creativity', 'Emotional honesty', 'Calm'],
    connectionStyle: 'Thoughtful and reserved',
    prompt: {
      question: 'I feel most myself when…',
      answer:
        "I'm making something with my hands and someone I trust is nearby, doing their own thing.",
    },
    lens: 'Possible shared values: creativity, honesty, and a calm, steady pace.',
    photo: img('1770853800316-911f5a248785'),
  },
  {
    id: 'jeanluc',
    firstName: 'Jean-Luc',
    age: 37,
    city: 'Paris',
    country: 'France',
    originallyFrom: 'Haiti',
    intent: 'Long-term, friendship first',
    values: ['Loyalty', 'Generosity', 'Curiosity'],
    connectionStyle: 'Warm and open',
    prompt: {
      question: 'Something small that means a lot to me…',
      answer:
        "cooking for the people I love. It's how I say the things I don't have words for.",
    },
    lens: 'Possible shared values: generosity, loyalty, and quiet devotion.',
    photo: img('1779497055853-478ac423fee7'),
  },
  {
    id: 'chloe',
    firstName: 'Chloé',
    age: 32,
    city: 'Montréal',
    country: 'Canada',
    originallyFrom: 'France',
    intent: 'Open to romance, no rush',
    values: ['Adventure', 'Kindness', 'Growth'],
    connectionStyle: 'Playful and light',
    prompt: {
      question: "I'm hoping to find someone who…",
      answer: 'is curious about the world and gentle with people — including themselves.',
    },
    lens: 'Possible shared values: adventure, kindness, and room to grow.',
    photo: img('1761046543296-5c3c6abe0db1'),
  },
  {
    id: 'kwame',
    firstName: 'Kwame',
    age: 35,
    city: 'Boston',
    country: 'United States',
    originallyFrom: 'South Africa',
    intent: 'Building deep friendship',
    values: ['Emotional honesty', 'Calm', 'Trust'],
    connectionStyle: 'Thoughtful and reserved',
    prompt: {
      question: 'A friendship becomes something more when…',
      answer: "there's enough trust to be unsure out loud, and still feel held.",
    },
    lens: 'Possible shared values: honesty, calm, and trustworthy steadiness.',
    photo: img('1779497056303-cd127f31df94'),
  },
]

// Option pools for the profile form and filters.
export const COUNTRIES = [
  'Australia', 'Brazil', 'Canada', 'Cape Verde', 'Costa Rica', 'Egypt', 'France',
  'Greece', 'Haiti', 'Japan', 'Mauritius', 'Morocco', 'New Zealand', 'Portugal',
  'Singapore', 'South Africa', 'Switzerland', 'United States',
]

export const INTENTS = [
  'Long-term, friendship first',
  'Open to romance, no rush',
  'Building deep friendship',
]

export const CONNECTION_STYLES = [
  'Slow and steady',
  'Warm and open',
  'Thoughtful and reserved',
  'Playful and light',
]

export const VALUE_OPTIONS = [
  'Curiosity', 'Kindness', 'Emotional honesty', 'Growth', 'Loyalty', 'Creativity',
  'Calm', 'Adventure', 'Generosity', 'Commitment', 'Appreciation', 'Open communication',
  'Healthy conflict repair', 'Deep friendship', 'Shared life goals', 'Trust',
  'Emotional safety', 'Mutual support', 'Playfulness',
]
