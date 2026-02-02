/**
 * @fileOverview A utility to swap profanity for amusing alternatives.
 */

const profanityMap: Record<string, string> = {
  fuck: 'fiddlesticks',
  fucking: 'flipping',
  fucks: 'fiddlesticks',
  shit: 'shenanigans',
  shite: 'sugar-coating',
  shits: 'shenanigans',
  bitch: 'biscuit',
  bastard: 'banana-skin',
  arse: 'asparagus',
  arses: 'asparaguses',
  ass: 'bottom',
  cunt: 'cupcake',
  wanker: 'waffler',
  prick: 'pretzel',
  piss: 'puddle',
  bloody: 'blooming',
  dick: 'duckling',
  cock: 'cockerel',
  bollocks: 'balderdash',
  bugger: 'badger',
  slut: 'strawberry',
  whore: 'whistle',
  twat: 'twizzler',
  shat: 'shuffled',
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
