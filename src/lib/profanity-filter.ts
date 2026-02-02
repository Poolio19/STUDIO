/**
 * @fileOverview A utility to swap profanity for amusing alternatives.
 */

const profanityMap: Record<string, string> = {
  fuck: 'flump',
  fucked: 'forked',
  fucking: 'flipping',
  fucks: 'flaps',
  fucker: 'funster',
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
  gay: 'fab',
  fag: 'fab',
  bummer: 'legend',
  wank: 'wiggle',
};

/**
 * Escapes special characters for use in a regular expression.
 */
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replaces swear words in a string with funny alternatives while attempting to preserve case.
 */
export function filterProfanity(text: string): string {
  if (!text) return text;
  
  let cleaned = text;

  // Sort keys by length descending to match longer phrases first
  const sortedWords = Object.keys(profanityMap).sort((a, b) => b.length - a.length);

  sortedWords.forEach((word) => {
    try {
      const escapedWord = escapeRegExp(word);
      const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
      cleaned = cleaned.replace(regex, (match) => {
        const replacement = profanityMap[word.toLowerCase()];
        
        // All caps
        if (match === match.toUpperCase()) return replacement.toUpperCase();
        // Capitalized
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        // Lowercase
        return replacement;
      });
    } catch (e) {
      console.error(`Error filtering word "${word}":`, e);
    }
  });

  return cleaned;
}
