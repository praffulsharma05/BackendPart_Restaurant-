import { SPICE_LEVELS, SPICE_KEYWORDS, PRICE_RANGES, SORT_BY_KEYS } from '../../constants';

export function applyBackendMenuFilters(
  items: any[],
  filters?: { minRating?: number; priceRange?: string; spiceLevel?: string; sortBy?: string }
) {
  if (!filters) return items;
  let filtered = items;

  if (filters.minRating && filters.minRating > 0) {
    filtered = filtered.filter((item) => item.rating >= filters.minRating!);
  }

  if (filters.priceRange) {
    if (filters.priceRange === PRICE_RANGES.UNDER100) {
      filtered = filtered.filter((item) => item.price < 100);
    } else if (filters.priceRange === PRICE_RANGES.RANGE_100_300) {
      filtered = filtered.filter((item) => item.price >= 100 && item.price <= 300);
    } else if (filters.priceRange === PRICE_RANGES.ABOVE300) {
      filtered = filtered.filter((item) => item.price > 300);
    }
  }

  if (filters.spiceLevel) {
    const level = filters.spiceLevel.toLowerCase().replace('_', '-');
    filtered = filtered.filter((item) => {
      if (item.spiceLevel) {
        return item.spiceLevel.toLowerCase().replace('_', '-') === level;
      }

      const nameLower = item.name.toLowerCase();
      const descLower = item.description ? item.description.toLowerCase() : '';
      
      const isSpicy =
        SPICE_KEYWORDS.SPICY.some((kw) => nameLower.includes(kw)) ||
        descLower.includes('spicy') ||
        descLower.includes('chilli') ||
        SPICE_KEYWORDS.VERY_SPICY.some((kw) => nameLower.includes(kw)) ||
        SPICE_KEYWORDS.VERY_SPICY.some((kw) => descLower.includes(kw));

      if (level === SPICE_LEVELS.SPICY) {
        return isSpicy;
      } else if (level === SPICE_LEVELS.NONE) {
        return !isSpicy;
      } else if (level === SPICE_LEVELS.MILD) {
        return (
          SPICE_KEYWORDS.MILD.some((kw) => nameLower.includes(kw)) ||
          (!nameLower.includes('masala') && !nameLower.includes('chilli') && !nameLower.includes('spicy') && !nameLower.includes('tadka') && !nameLower.includes('kadai'))
        );
      } else if (level === SPICE_LEVELS.MEDIUM) {
        return (
          SPICE_KEYWORDS.MEDIUM.some((kw) => nameLower.includes(kw))
        );
      } else if (level === SPICE_LEVELS.EXTRA_SPICY) {
        return (
          SPICE_KEYWORDS.EXTRA_SPICY.some((kw) => nameLower.includes(kw)) ||
          SPICE_KEYWORDS.VERY_SPICY.some((kw) => descLower.includes(kw))
        );
      }
      return true;
    });
  }

  if (filters.sortBy) {
    if (filters.sortBy === SORT_BY_KEYS.RATING_HIGH) {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === SORT_BY_KEYS.PRICE_LOW) {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === SORT_BY_KEYS.PRICE_HIGH) {
      filtered.sort((a, b) => b.price - a.price);
    }
  }

  return filtered;
}
