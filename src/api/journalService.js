const BASE_URL = 'http://localhost:8080/api/journal';

/**
 * Common fetch helper to reduce boilerplate.
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Java API Error: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error(`❌ [Java API] Call failed for ${endpoint}:`, error);
    throw error;
  }
}

export const JournalAPI = {
  /**
   * Save or update an entry.
   */
  async saveEntry(userId, dateKey, entryData) {
    const payload = {
      userId,
      dateKey,
      ...entryData,
      timestamp: Date.now(),
    };
    return apiRequest('/entry', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get single entry by date key.
   */
  async getEntry(dateKey) {
    return apiRequest(`/entry/${dateKey}`);
  },

  /**
   * Get all entries (sorted by BST on backend) and filter by month/year.
   */
  async getEntriesByMonth(userId, year, month) {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-01`;

    const rangeEntries = await apiRequest(`/entries/range?start=${startDate}&end=${endDate}`);

    const filteredEntries = {};
    rangeEntries.forEach(entry => {
      // Map correctly if userId matches (though usually backend handles this)
      if (entry.userId === userId) {
        const key = entry.dateKey || entry.id;
        filteredEntries[key] = entry;
      }
    });

    return filteredEntries;
  },

  /**
   * Delete an entry.
   */
  async deleteEntry(userId, dateKey) {
    return apiRequest(`/entry/${dateKey}`, {
      method: 'DELETE',
    });
  },

  /**
   * Search tags using the Java Trie.
   */
  async searchTags(prefix) {
    return apiRequest(`/tags/search?prefix=${encodeURIComponent(prefix)}`);
  }
};
