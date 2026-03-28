package com.livre.datastructures;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Custom Trie (Prefix Tree) implementation.
 * 
 * USAGE IN APP: Search autocomplete — O(k) prefix lookups in the sidebar search
 * bar.
 * WHY CHOSEN: Highly efficient for prefix-based searches compared to O(n)
 * string scanning.
 * 
 * TIME COMPLEXITY:
 * - insert(): O(k) where k is the length of the word
 * - search(): O(k)
 * - startsWith(): O(k)
 * - getSuggestions(): O(k + m) where m is the number of results
 */
public class Trie {

    private static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        boolean isEndOfWord = false;
    }

    private final TrieNode root;

    public Trie() {
        root = new TrieNode();
    }

    /**
     * Inserts a word into the trie.
     */
    public void insert(String word) {
        TrieNode current = root;
        for (char ch : word.toCharArray()) {
            current.children.putIfAbsent(ch, new TrieNode());
            current = current.children.get(ch);
        }
        current.isEndOfWord = true;
    }

    /**
     * Returns true if the word is in the trie.
     */
    public boolean search(String word) {
        TrieNode node = getNode(word);
        return node != null && node.isEndOfWord;
    }

    /**
     * Returns true if there is any word in the trie that starts with the given
     * prefix.
     */
    public boolean startsWith(String prefix) {
        return getNode(prefix) != null;
    }

    /**
     * Returns a list of all words in the trie that start with the given prefix.
     */
    public List<String> getSuggestions(String prefix) {
        List<String> results = new ArrayList<>();
        TrieNode node = getNode(prefix);
        if (node != null) {
            collectAllWords(node, prefix, results, new StringBuilder(prefix));
        }
        return results;
    }

    private TrieNode getNode(String str) {
        TrieNode current = root;
        for (char ch : str.toCharArray()) {
            current = current.children.get(ch);
            if (current == null)
                return null;
        }
        return current;
    }

    private void collectAllWords(TrieNode node, String prefix, List<String> results, StringBuilder currentWord) {
        if (node.isEndOfWord) {
            results.add(currentWord.toString());
        }
        for (Map.Entry<Character, TrieNode> entry : node.children.entrySet()) {
            currentWord.append(entry.getKey());
            collectAllWords(entry.getValue(), prefix, results, currentWord);
            currentWord.setLength(currentWord.length() - 1);
        }
    }
}
