package com.livre.datastructures;

import java.util.Iterator;
import java.util.NoSuchElementException;

/**
 * Custom DoublyLinkedList implementation.
 * 
 * USAGE IN APP: Timeline management — O(1) insertion at ends for chronological
 * journal logs.
 * WHY CHOSEN: Allows bidirectional traversal and O(1) removal of nodes if
 * reference is held.
 * 
 * TIME COMPLEXITY:
 * - addFirst/addLast: O(1)
 * - remove(): O(1) if node known, O(n) by value
 * - get(index): O(n)
 * - size(): O(1)
 */
public class DoublyLinkedList<T> implements Iterable<T> {

    private static class Node<T> {
        T data;
        Node<T> next;
        Node<T> prev;

        Node(T data) {
            this.data = data;
        }
    }

    private Node<T> head;
    private Node<T> tail;
    private int size = 0;

    /**
     * Adds an item to the beginning of the list.
     */
    public void addFirst(T item) {
        Node<T> newNode = new Node<>(item);
        if (isEmpty()) {
            head = tail = newNode;
        } else {
            newNode.next = head;
            head.prev = newNode;
            head = newNode;
        }
        size++;
    }

    /**
     * Adds an item to the end of the list.
     */
    public void addLast(T item) {
        Node<T> newNode = new Node<>(item);
        if (isEmpty()) {
            head = tail = newNode;
        } else {
            newNode.prev = tail;
            tail.next = newNode;
            tail = newNode;
        }
        size++;
    }

    /**
     * Removes the first occurrence of the specified item.
     */
    public boolean remove(T item) {
        Node<T> current = head;
        while (current != null) {
            if (current.data.equals(item)) {
                if (current == head) {
                    head = head.next;
                    if (head != null)
                        head.prev = null;
                } else if (current == tail) {
                    tail = tail.prev;
                    if (tail != null)
                        tail.next = null;
                } else {
                    current.prev.next = current.next;
                    current.next.prev = current.prev;
                }
                size--;
                return true;
            }
            current = current.next;
        }
        return false;
    }

    /**
     * Returns the item at the specified index.
     */
    public T get(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException();
        }
        Node<T> current;
        if (index < size / 2) {
            current = head;
            for (int i = 0; i < index; i++)
                current = current.next;
        } else {
            current = tail;
            for (int i = size - 1; i > index; i--)
                current = current.prev;
        }
        return current.data;
    }

    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    @Override
    public Iterator<T> iterator() {
        return new Iterator<T>() {
            private Node<T> current = head;

            @Override
            public boolean hasNext() {
                return current != null;
            }

            @Override
            public T next() {
                if (!hasNext())
                    throw new NoSuchElementException();
                T data = current.data;
                current = current.next;
                return data;
            }
        };
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("[");
        Node<T> current = head;
        while (current != null) {
            sb.append(current.data);
            if (current.next != null)
                sb.append(" <-> ");
            current = current.next;
        }
        sb.append("]");
        return sb.toString();
    }
}
