package com.livre.datastructures;

import java.util.NoSuchElementException;

/**
 * Custom Queue implementation using a singly linked list.
 * 
 * USAGE IN APP: Background tasks — O(1) enqueue/dequeue for processing
 * notifications or data sync in order.
 * WHY CHOSEN: Linked lists provide guaranteed O(1) performance for both
 * ends without the need for resizing logic.
 * 
 * TIME COMPLEXITY:
 * - enqueue(): O(1)
 * - dequeue(): O(1)
 * - peek(): O(1)
 * - size(): O(1)
 */
public class Queue<T> {

    private static class Node<T> {
        private final T data;
        private Node<T> next;

        public Node(T data) {
            this.data = data;
        }
    }

    private Node<T> head; // Remove from here
    private Node<T> tail; // Add here
    private int size = 0;

    /**
     * Adds an item to the end of the queue.
     */
    public void enqueue(T item) {
        Node<T> newNode = new Node<>(item);
        if (tail != null) {
            tail.next = newNode;
        }
        tail = newNode;
        if (head == null) {
            head = tail;
        }
        size++;
    }

    /**
     * Removes and returns the item from the front of the queue.
     */
    public T dequeue() {
        if (isEmpty()) {
            throw new NoSuchElementException();
        }
        T data = head.data;
        head = head.next;
        if (head == null) {
            tail = null;
        }
        size--;
        return data;
    }

    /**
     * Returns the item at the front of the queue without removing it.
     */
    public T peek() {
        if (isEmpty()) {
            throw new NoSuchElementException();
        }
        return head.data;
    }

    /**
     * Checks if the queue is empty.
     */
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * Returns the number of items in the queue.
     */
    public int size() {
        return size;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("[");
        Node<T> current = head;
        while (current != null) {
            sb.append(current.data);
            if (current.next != null)
                sb.append(", ");
            current = current.next;
        }
        sb.append("]");
        return sb.toString();
    }
}
