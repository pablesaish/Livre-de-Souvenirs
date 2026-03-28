package com.livre.datastructures;

import java.util.List;

/**
 * Simple test class to verify custom data structures.
 */
public class DataStructureTest {

    public static void main(String[] args) {
        testStack();
        testQueue();
        testDoublyLinkedList();
        testBST();
        testTrie();
        System.out.println("All tests passed!");
    }

    private static void testStack() {
        System.out.println("Testing Stack...");
        Stack<Integer> stack = new Stack<>();
        stack.push(1);
        stack.push(2);
        stack.push(3);
        assert stack.pop() == 3;
        assert stack.peek() == 2;
        assert stack.size() == 2;
        System.out.println("Stack: " + stack);
    }

    private static void testQueue() {
        System.out.println("Testing Queue...");
        Queue<String> queue = new Queue<>();
        queue.enqueue("A");
        queue.enqueue("B");
        queue.enqueue("C");
        assert queue.dequeue().equals("A");
        assert queue.peek().equals("B");
        assert queue.size() == 2;
        System.out.println("Queue: " + queue);
    }

    private static void testDoublyLinkedList() {
        System.out.println("Testing DoublyLinkedList...");
        DoublyLinkedList<String> list = new DoublyLinkedList<>();
        list.addLast("Middle");
        list.addFirst("Front");
        list.addLast("Back");
        assert list.get(0).equals("Front");
        assert list.get(1).equals("Middle");
        assert list.get(2).equals("Back");
        list.remove("Middle");
        assert list.size() == 2;
        System.out.println("DLL: " + list);
    }

    private static void testBST() {
        System.out.println("Testing BST...");
        BST<Integer, String> bst = new BST<>();
        bst.insert(5, "Five");
        bst.insert(3, "Three");
        bst.insert(7, "Seven");
        bst.insert(2, "Two");
        bst.insert(4, "Four");
        bst.insert(6, "Six");
        bst.insert(8, "Eight");
        assert bst.search(5).equals("Five");
        assert bst.search(8).equals("Eight");
        List<String> sorted = bst.inOrder();
        System.out.println("BST (In-order): " + sorted);
        // [Two, Three, Four, Five, Six, Seven, Eight]
    }

    private static void testTrie() {
        System.out.println("Testing Trie...");
        Trie trie = new Trie();
        trie.insert("apple");
        trie.insert("app");
        trie.insert("application");
        assert trie.search("app");
        assert trie.startsWith("appl");
        List<String> suggestions = trie.getSuggestions("app");
        System.out.println("Trie suggestions for 'app': " + suggestions);
        // [app, apple, application]
    }
}
