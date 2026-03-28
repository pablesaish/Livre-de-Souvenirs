package com.livre.service;

import com.livre.datastructures.BST;
import com.livre.datastructures.HashMap;
import com.livre.datastructures.Trie;
import com.livre.model.JournalEntry;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service to manage journal entries using custom data structures.
 */
@Service
public class JournalManager {

    private final HashMap<String, JournalEntry> entryMap; // dateKey -> Entry
    private final BST<String, JournalEntry> searchTree;    // Sorted by dateKey (YYYY-MM-DD)
    private final Trie autocompleteTrie;                    // For tags and titles

    public JournalManager() {
        this.entryMap = new HashMap<>(100);
        this.searchTree = new BST<>();
        this.autocompleteTrie = new Trie();
    }

    /**
     * Adds or updates an entry in the custom structures.
     */
    public void saveEntry(JournalEntry entry) {
        // Prioritize dateKey (YYYY-MM-DD) for storage and lookup
        String key = (entry.getDateKey() != null) ? entry.getDateKey() : entry.getId();
        if (key == null) return;

        // 1. Store in HashMap for O(1) lookup
        entryMap.put(key, entry);

        // 2. Insert into BST for O(log n) sorting
        searchTree.insert(key, entry);

        // 3. Index tags/title in Trie for autocomplete
        if (entry.getTitle() != null) autocompleteTrie.insert(entry.getTitle());
        if (entry.getTags() != null) {
            for (String tag : entry.getTags()) {
                autocompleteTrie.insert(tag);
            }
        }
    }

    /**
     * Retrieves an entry by its dateKey.
     */
    public JournalEntry getEntry(String dateKey) {
        return entryMap.get(dateKey);
    }

    /**
     * Retrieves all entries within a specific date range [start, end].
     */
    public List<JournalEntry> getEntriesInRange(String start, String end) {
        return searchTree.getRange(start, end);
    }

    /**
     * Retrieves all entries, sorted chronologically using the BST.
     */
    public List<JournalEntry> getAllEntries() {
        return searchTree.inOrder();
    }

    /**
     * Removes an entry from both the map and the search tree.
     */
    public boolean deleteEntry(String dateKey) {
        if (dateKey == null) return false;
        
        // Remove from BST (used for sorted timeline)
        searchTree.delete(dateKey);
        
        // Remove from HashMap (used for direct lookup)
        return entryMap.remove(dateKey);
    }

    /**
     * Searches for completions using the logic in our Trie.
     */
    public List<String> searchTags(String prefix) {
        return autocompleteTrie.getSuggestions(prefix);
    }
}
