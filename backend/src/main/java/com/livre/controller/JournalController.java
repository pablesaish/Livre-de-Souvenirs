package com.livre.controller;

import com.livre.model.JournalEntry;
import com.livre.service.JournalManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller to handle journal entry API requests.
 */
@RestController
@RequestMapping("/api/journal")
public class JournalController {

    private final JournalManager journalManager;

    @Autowired
    public JournalController(JournalManager journalManager) {
        this.journalManager = journalManager;
    }

    @GetMapping("/health")
    public Map<String, String> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Lumière Backend is running!");
        return response;
    }

    /**
     * POST /api/journal/entry
     * Saves or updates a journal entry.
     */
    @PostMapping("/entry")
    public ResponseEntity<Void> saveEntry(@RequestBody JournalEntry entry) {
        journalManager.saveEntry(entry);
        return ResponseEntity.ok().build();
    }

    /**
     * GET /api/journal/entry/{dateKey}
     * Retrieves a single entry by its date key.
     */
    @GetMapping("/entry/{dateKey}")
    public ResponseEntity<JournalEntry> getEntry(@PathVariable String dateKey) {
        JournalEntry entry = journalManager.getEntry(dateKey);
        if (entry != null) {
            return ResponseEntity.ok(entry);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * GET /api/journal/entries/range?start=...&end=...
     * Retrieves all journal entries within a specific date range.
     */
    @GetMapping("/entries/range")
    public List<JournalEntry> getEntriesInRange(@RequestParam String start, @RequestParam String end) {
        return journalManager.getEntriesInRange(start, end);
    }

    /**
     * GET /api/journal/entries
     * Retrieves all journal entries, sorted chronologically using the BST.
     */
    @GetMapping("/entries")
    public List<JournalEntry> getAllEntries() {
        return journalManager.getAllEntries();
    }

    /**
     * DELETE /api/journal/entry/{dateKey}
     * Deletes an entry.
     */
    @DeleteMapping("/entry/{dateKey}")
    public ResponseEntity<Boolean> deleteEntry(@PathVariable String dateKey) {
        boolean removed = journalManager.deleteEntry(dateKey);
        return ResponseEntity.ok(removed);
    }

    /**
     * GET /api/journal/tags/search?prefix=...
     * Searches for tag or title completions using the Trie.
     */
    @GetMapping("/tags/search")
    public List<String> searchTags(@RequestParam String prefix) {
        return journalManager.searchTags(prefix);
    }
}
