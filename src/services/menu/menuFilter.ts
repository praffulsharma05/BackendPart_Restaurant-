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
    if (filters.priceRange === 'under100') {
      filtered = filtered.filter((item) => item.price < 100);
    } else if (filters.priceRange === '100_300') {
      filtered = filtered.filter((item) => item.price >= 100 && item.price <= 300);
    } else if (filters.priceRange === 'above300') {
      filtered = filtered.filter((item) => item.price > 300);
    }
  }

  if (filters.spiceLevel) {
    const level = filters.spiceLevel.toLowerCase();
    filtered = filtered.filter((item) => {
      const nameLower = item.name.toLowerCase();
      const descLower = item.description ? item.description.toLowerCase() : '';
      
      if (level === 'mild') {
        return (
          nameLower.includes('mild') || 
          nameLower.includes('sweet') || 
          nameLower.includes('butter') || 
          nameLower.includes('cream') || 
          nameLower.includes('naan') || 
          nameLower.includes('roti') || 
          nameLower.includes('paratha') ||
          (!nameLower.includes('masala') && !nameLower.includes('chilli') && !nameLower.includes('spicy') && !nameLower.includes('tadka') && !nameLower.includes('kadai'))
        );
      } else if (level === 'medium') {
        return (
          nameLower.includes('medium') || 
          nameLower.includes('dal') || 
          nameLower.includes('paneer') || 
          nameLower.includes('rice') || 
          nameLower.includes('jeera')
        );
      } else if (level === 'spicy') {
        return (
          nameLower.includes('spicy') || 
          nameLower.includes('masala') || 
          nameLower.includes('chilli') || 
          nameLower.includes('pepper') || 
          nameLower.includes('tadka') || 
          nameLower.includes('kadai') || 
          descLower.includes('spicy') || 
          descLower.includes('chilli')
        );
      } else if (level === 'extra_spicy') {
        return (
          nameLower.includes('extra spicy') || 
          nameLower.includes('kolhapuri') || 
          nameLower.includes('vindaloo') || 
          nameLower.includes('peri') || 
          descLower.includes('extra spicy') || 
          descLower.includes('very spicy')
        );
      }
      return true;
    });
  }

  if (filters.sortBy) {
    if (filters.sortBy === 'rating_high') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'price_low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price_high') {
      filtered.sort((a, b) => b.price - a.price);
    }
  }

  return filtered;
}
