package com.livre.datastructures;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom Binary Search Tree (BST) implementation.
 * 
 * USAGE IN APP: Sorted searching — O(log n) average time to find journal
 * entries
 * by date or sentiment score.
 * WHY CHOSEN: Maintains sorted order automatically, allowing for efficient
 * range queries and in-order traversals.
 * 
 * TIME COMPLEXITY:
 * - insert(): O(log n) average, O(n) worst case
 * - search(): O(log n) average, O(n) worst case
 * - delete(): O(log n) average, O(n) worst case
 */
public class BST<K extends Comparable<K>, V> {

    private class Node {
        K key;
        V value;
        Node left, right;

        Node(K key, V value) {
            this.key = key;
            this.value = value;
        }
    }

    private Node root;
    private int size = 0;

    /**
     * Inserts a key-value pair into the BST.
     */
    public void insert(K key, V value) {
        root = insertRec(root, key, value);
    }

    private Node insertRec(Node root, K key, V value) {
        if (root == null) {
            size++;
            return new Node(key, value);
        }

        int cmp = key.compareTo(root.key);
        if (cmp < 0) {
            root.left = insertRec(root.left, key, value);
        } else if (cmp > 0) {
            root.right = insertRec(root.right, key, value);
        } else {
            root.value = value; // Update value if key exists
        }
        return root;
    }

    /**
     * Searches for a value by its key.
     */
    public V search(K key) {
        Node node = searchRec(root, key);
        return node == null ? null : node.value;
    }

    private Node searchRec(Node root, K key) {
        if (root == null || root.key.equals(key)) {
            return root;
        }

        if (key.compareTo(root.key) < 0) {
            return searchRec(root.left, key);
        }
        return searchRec(root.right, key);
    }

    /**
     * Returns all values in sorted order of their keys.
     */
    public List<V> inOrder() {
        List<V> result = new ArrayList<>();
        inOrderRec(root, result);
        return result;
    }

    private void inOrderRec(Node root, List<V> result) {
        if (root != null) {
            inOrderRec(root.left, result);
            result.add(root.value);
            inOrderRec(root.right, result);
        }
    }

    /**
     * Deletes a key-value pair from the BST.
     */
    public void delete(K key) {
        root = deleteRec(root, key);
    }

    private Node deleteRec(Node node, K key) {
        if (node == null)
            return null;

        int cmp = key.compareTo(node.key);
        if (cmp < 0) {
            node.left = deleteRec(node.left, key);
        } else if (cmp > 0) {
            node.right = deleteRec(node.right, key);
        } else {
            // Found the node to delete
            size--;

            // Case 1 & 2: No child or only one child
            if (node.left == null)
                return node.right;
            if (node.right == null)
                return node.left;

            // Case 3: Two children - find in-order successor (smallest in right subtree)
            Node successor = findMin(node.right);
            node.key = successor.key;
            node.value = successor.value;
            node.right = deleteRec(node.right, successor.key);

            // Increment size back because the recursive call just decremented it for the
            // move
            size++;
        }
        return node;
    }

    private Node findMin(Node node) {
        while (node.left != null)
            node = node.left;
        return node;
    }

    /**
     * Finds all values in the given key range [start, end].
     */
    public List<V> getRange(K start, K end) {
        List<V> results = new ArrayList<>();
        getRangeRec(root, start, end, results);
        return results;
    }

    private void getRangeRec(Node node, K start, K end, List<V> results) {
        if (node == null)
            return;

        int cmpStart = start.compareTo(node.key);
        int cmpEnd = end.compareTo(node.key);

        // If current node's key is after start, there might be range nodes in the left
        // child
        if (cmpStart < 0) {
            getRangeRec(node.left, start, end, results);
        }

        // If current node is within range, add its value
        if (cmpStart <= 0 && cmpEnd >= 0) {
            results.add(node.value);
        }

        // If current node's key is before end, there might be range nodes in the right
        // child
        if (cmpEnd > 0) {
            getRangeRec(node.right, start, end, results);
        }
    }

    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    @Override
    public String toString() {
        return inOrder().toString();
    }
}
