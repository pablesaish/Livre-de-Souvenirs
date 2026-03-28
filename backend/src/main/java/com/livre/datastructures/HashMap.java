package com.livre.datastructures;

/**
 * Custom HashMap implementation using separate chaining.
 * 
 * USAGE IN APP: Calendar date storage — O(1) lookup of journal entries by date
 * key (YYYY-MM-DD).
 * WHY CHOSEN: Provides constant-time average-case performance for insert, get,
 * and delete.
 * Better than arrays (O(n) search) or BSTs (O(log n)) for direct key-value
 * lookups.
 * 
 * TIME COMPLEXITY:
 * - put(): O(1) average, O(n) worst case
 * - get(): O(1) average, O(n) worst case
 * - remove(): O(1) average, O(n) worst case
 * - resize(): O(n)
 */
public class HashMap<K, V> {

    /**
     * Node in the linked list chain for handling collisions.
     */
    private static class Entry<K, V> {
        K key;
        V value;
        Entry<K, V> next;

        Entry(K key, V value) {
            this.key = key;
            this.value = value;
            this.next = null;
        }
    }

    private static final int DEFAULT_CAPACITY = 16;
    private static final float LOAD_FACTOR = 0.75f;

    private Entry<K, V>[] buckets;
    private int size;

    @SuppressWarnings("unchecked")
    public HashMap() {
        buckets = new Entry[DEFAULT_CAPACITY];
        size = 0;
    }

    @SuppressWarnings("unchecked")
    public HashMap(int capacity) {
        buckets = new Entry[capacity];
        size = 0;
    }

    /**
     * Computes the bucket index for a given key.
     */
    private int getBucketIndex(K key) {
        int hash = key.hashCode();
        return Math.abs(hash) % buckets.length;
    }

    /**
     * Inserts or updates a key-value pair.
     * O(1) average time.
     */
    public void put(K key, V value) {
        if (key == null)
            throw new IllegalArgumentException("Key cannot be null");

        int index = getBucketIndex(key);
        Entry<K, V> current = buckets[index];

        // Check if key already exists — update value
        while (current != null) {
            if (current.key.equals(key)) {
                current.value = value;
                return;
            }
            current = current.next;
        }

        // Insert new entry at head of chain
        Entry<K, V> newEntry = new Entry<>(key, value);
        newEntry.next = buckets[index];
        buckets[index] = newEntry;
        size++;

        // Resize if load factor exceeded
        if ((float) size / buckets.length > LOAD_FACTOR) {
            resize();
        }
    }

    /**
     * Retrieves the value for a given key.
     * O(1) average time.
     * 
     * @return value or null if not found
     */
    public V get(K key) {
        if (key == null)
            return null;

        int index = getBucketIndex(key);
        Entry<K, V> current = buckets[index];

        while (current != null) {
            if (current.key.equals(key)) {
                return current.value;
            }
            current = current.next;
        }
        return null;
    }

    /**
     * Removes a key-value pair.
     * O(1) average time.
     * 
     * @return true if key was found and removed
     */
    public boolean remove(K key) {
        if (key == null)
            return false;

        int index = getBucketIndex(key);
        Entry<K, V> current = buckets[index];
        Entry<K, V> prev = null;

        while (current != null) {
            if (current.key.equals(key)) {
                if (prev == null) {
                    buckets[index] = current.next;
                } else {
                    prev.next = current.next;
                }
                size--;
                return true;
            }
            prev = current;
            current = current.next;
        }
        return false;
    }

    /**
     * Checks if the map contains a key.
     */
    public boolean containsKey(K key) {
        return get(key) != null;
    }

    /**
     * Returns the number of key-value pairs.
     */
    public int size() {
        return size;
    }

    /**
     * Checks if the map is empty.
     */
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * Resizes the bucket array when load factor is exceeded.
     * O(n) time — rehashes all entries.
     */
    @SuppressWarnings("unchecked")
    private void resize() {
        Entry<K, V>[] oldBuckets = buckets;
        buckets = new Entry[oldBuckets.length * 2];
        size = 0;

        for (Entry<K, V> head : oldBuckets) {
            Entry<K, V> current = head;
            while (current != null) {
                put(current.key, current.value);
                current = current.next;
            }
        }
    }

    /**
     * Returns a string representation of all entries.
     */
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("{ ");
        boolean first = true;
        for (Entry<K, V> head : buckets) {
            Entry<K, V> current = head;
            while (current != null) {
                if (!first)
                    sb.append(", ");
                sb.append(current.key).append(": ").append(current.value);
                first = false;
                current = current.next;
            }
        }
        sb.append(" }");
        return sb.toString();
    }
}
