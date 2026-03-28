package com.livre.datastructures;

import java.util.EmptyStackException;

/**
 * Custom Stack implementation using a dynamic array.
 * 
 * USAGE IN APP: History management — O(1) push/pop for Undo/Redo operations.
 * WHY CHOSEN: Arrays provide better cache locality than linked nodes.
 * Amortized O(1) performance for insertions.
 * 
 * TIME COMPLEXITY:
 * - push(): O(1) amortized
 * - pop(): O(1)
 * - peek(): O(1)
 * - size(): O(1)
 */
public class Stack<T> {

    private Object[] elements;
    private int size = 0;
    private static final int DEFAULT_CAPACITY = 10;

    public Stack() {
        elements = new Object[DEFAULT_CAPACITY];
    }

    /**
     * Pushes an item onto the top of this stack.
     */
    public void push(T item) {
        if (size == elements.length) {
            ensureCapacity();
        }
        elements[size++] = item;
    }

    /**
     * Removes the object at the top of this stack and returns it.
     */
    @SuppressWarnings("unchecked")
    public T pop() {
        if (isEmpty()) {
            throw new EmptyStackException();
        }
        T item = (T) elements[--size];
        elements[size] = null; // Prevent memory leak
        return item;
    }

    /**
     * Looks at the object at the top of this stack without removing it.
     */
    @SuppressWarnings("unchecked")
    public T peek() {
        if (isEmpty()) {
            throw new EmptyStackException();
        }
        return (T) elements[size - 1];
    }

    /**
     * Checks if the stack is empty.
     */
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * Returns the number of items in the stack.
     */
    public int size() {
        return size;
    }

    /**
     * Resizes the array when full.
     */
    private void ensureCapacity() {
        int newSize = elements.length * 2;
        Object[] newElements = new Object[newSize];
        System.arraycopy(elements, 0, newElements, 0, elements.length);
        elements = newElements;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < size; i++) {
            sb.append(elements[i]);
            if (i < size - 1)
                sb.append(", ");
        }
        sb.append("]");
        return sb.toString();
    }
}
