import { BlogPost } from './blogs';
import { locations } from './locations';

/**
 * Which location pages a blog post belongs to.
 *
 * Posts can carry an explicit `cities` array, but the publishing pipeline does
 * not write one — it only knows the fields listed in its own `order` array. If
 * pairing depended solely on that field, every post published from now on would
 * be invisible to the location pages, and the feature would rot one post at a
 * time without anything failing loudly.
 *
 * So the explicit tag is an override, not a requirement. When it is absent we
 * derive the cities from the slug, which works because the pipeline generates
 * keyword-aware slugs that lead with the town: "chico-ca-best-time-replace-
 * siding-fall", "multifamily-siding-replacement-oroville".
 *
 * The tag still matters for the cases a slug cannot express:
 *  - a post about a town with no page of its own (the Anderson defensible-space
 *    post is tagged to Redding — same county, same CAL FIRE unit)
 *  - a post covering more than one town (Magalia vents, tagged to Paradise too)
 *  - a post naming a town it is not really about
 */

/**
 * Location slug plus the stem to look for in a post slug. Stripping the trailing
 * "-ca" is what lets "redding-ca" match "redding-zone-0-defensible-space...".
 */
const MATCHERS = locations.map(loc => ({
  slug: loc.slug,
  stem: loc.slug.replace(/-ca$/, ''),
}));

/**
 * Match on hyphen-delimited boundaries so a stem cannot match inside a longer
 * word. Without it "red-bluff" would be a substring hazard, and any future
 * one-syllable town name would silently match half the archive.
 */
const mentions = (postSlug: string, stem: string): boolean =>
  new RegExp(`(^|-)${stem}(-|$)`).test(postSlug);

/** The location slugs a post should appear under. Explicit tag wins. */
export const getPostCities = (post: BlogPost): string[] => {
  if (post.cities?.length) return post.cities;
  return MATCHERS.filter(m => mentions(post.slug, m.stem)).map(m => m.slug);
};

/** Whether a post belongs on a given location page. */
export const postCoversCity = (post: BlogPost, citySlug: string): boolean =>
  getPostCities(post).includes(citySlug);
