import type { Background } from '@/types/character-options'

export const ACOLYTE: Background = {
  id: 'acolyte',
  name: 'Acolyte',
  description: 'You have spent your life in the service of a temple to a specific god or pantheon of gods. You act as an intermediary between the realm of the holy and the mortal world.',
  skillProficiencies: ['Insight', 'Religion'],
  languages: 2,
  feature: {
    name: 'Shelter of the Faithful',
    description: 'As an acolyte, you command the respect of those who share your faith. You and your companions can expect free healing and care at a temple, shrine, or other established presence of your faith. You can also count on the priests there to provide support (but not anything that might be hazardous).',
  },
  suggestedCharacteristics: {
    personalityTraits: [
      'I idolize a particular hero of my faith and constantly refer to that person\'s deeds and example.',
      'I can find common ground between the fiercest enemies, empathizing with them.',
      'I see omens in every event and action. The gods try to speak to us, we just need to listen.',
      'Nothing can shake my optimistic attitude.',
      'I quote sacred texts and proverbs in almost every situation.',
      'I am tolerant of other faiths and respect the worship of other gods.',
      'I\'ve enjoyed fine food, drink, and high society. Rough living grates on me.',
      'I\'ve spent so long in the temple that I have little experience dealing with people outside.',
    ],
    ideals: [
      'Tradition. The ancient traditions of worship and sacrifice must be preserved and upheld.',
      'Charity. I always try to help those in need, no matter what the personal cost.',
      'Change. We must help bring about the changes the gods are constantly working in the world.',
      'Power. I hope to one day rise to the top of my faith\'s religious hierarchy.',
      'Faith. I trust that my deity will guide my actions. I have faith that if I work hard, things will go well.',
      'Aspiration. I seek to prove myself worthy of my god\'s favor by matching my actions against their teachings.',
    ],
    bonds: [
      'I would die to recover an ancient relic of my faith that was lost long ago.',
      'I will someday get revenge on the corrupt temple hierarchy who branded me a heretic.',
      'I owe my life to the priest who took me in when my parents died.',
      'Everything I do is for the common people.',
      'I will do anything to protect the temple where I served.',
      'I seek to preserve a sacred text that my enemies consider heretical and seek to destroy.',
    ],
    flaws: [
      'I judge others harshly, and myself even more severely.',
      'I put too much trust in those who wield power within my temple\'s hierarchy.',
      'My piety sometimes leads me to blindly trust those that profess faith in my god.',
      'I am inflexible in my thinking.',
      'I am suspicious of strangers and expect the worst of them.',
      'Once I pick a goal, I become obsessed with it to the detriment of everything else in my life.',
    ],
  },
  source: 'SRD',
}
