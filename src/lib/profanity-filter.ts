/**
 * @fileOverview A utility to swap profanity for amusing alternatives.
 */

const profanityMap: Record<string, string> = {
  fuck: 'flump',
  fucked: 'forked',
  fucking: 'flipping',
  fucks: 'flaps',
  shit: 'rare cheese',
  shite: 'shergar',
  shits: 'shirts',
  bitch: 'biscuit',
  bastard: 'burp monkey',
  arse: 'jacksy',
  arses: 'arsenals',
  arsehole: 'rissole',
  ass: 'bum',
  cunt: 'berk',
  wanker: 'wazzock',
  prick: 'plonker',
  piss: 'plimpsoll',
  bloody: 'blooming',
  dick: 'weiner',
  cock: 'cronk',
  bollocks: 'balderdash',
  bugger: 'badger',
  slut: 'trollop',
  whore: 'whistle',
  twat: 'twonk',
  shat: 'plopped',
  pissed: 'pickled',
};

/**
 * Replaces swear words in a string with funny alternatives while attempting to preserve case.
 */
export function filterProfanity(text: string): string {
  let cleaned = text;

  Object.keys(profanityMap).forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(regex, (match) => {
      const replacement = profanityMap[word.toLowerCase()];
      
      // Match the case of the original word
      if (match === match.toUpperCase()) return replacement.toUpperCase();
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  });

  return cleaned;
}
