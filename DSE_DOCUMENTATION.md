# Queen Journal — DSE Documentation

## Data Structures & Algorithms Report

---

## 1. HashMap — Calendar Date Storage

### Where Used
The calendar view stores journal entries keyed by date string (`YYYY-MM-DD`). When a user navigates to a month, all entries are loaded into a HashMap for instant lookup when rendering each date cell.

### Why Chosen
- **O(1) average-case** lookup by date key — critical for rendering 42 calendar cells without delay
- Alternatives considered:
  - **Array**: Would require O(n) linear scan to find entries
  - **BST**: O(log n) is good but unnecessary overhead for simple key lookups
  - **Sorted Array + Binary Search**: O(log n) search but O(n) insertion

### Time Complexity
| Operation | Average | Worst |
|-----------|---------|-------|
| `put()`   | O(1)    | O(n)  |
| `get()`   | O(1)    | O(n)  |
| `remove()`| O(1)    | O(n)  |
| `resize()`| O(n)    | O(n)  |

### Implementation
Uses **separate chaining** with linked list buckets. Load factor of 0.75 triggers automatic resize (doubles capacity). Keys are hashed using Java's built-in `hashCode()` modulo bucket count.

---

## 2. Stack — Undo/Redo in Crop Editor

### Where Used
The Frame Cutter editor maintains two stacks: `undoStack` and `redoStack`. Each time the user moves or resizes the crop frame, the previous position is pushed onto the undo stack. Pressing undo pops from undo and pushes to redo, and vice versa.

### Why Chosen
- **LIFO ordering** naturally models undo/redo: the most recent action is undone first
- Alternatives considered:
  - **Queue**: FIFO ordering — wrong semantics for undo
  - **ArrayList**: Would work but Stack provides cleaner API with O(1) push/pop
  - **LinkedList**: Unnecessary overhead for tail-only operations

### Time Complexity
| Operation | Time |
|-----------|------|
| `push()`  | O(1) amortized |
| `pop()`   | O(1) |
| `peek()`  | O(1) |
| `size()`  | O(1) |

### Implementation
Array-based stack with dynamic resizing (doubles capacity when full). `top` index pointer tracks the stack's depth.

---

## 3. Doubly Linked List — Month Navigation History

### Where Used
Tracks the history of months the user has visited. Supports browser-like back/forward navigation. A cursor pointer tracks the current position, and `goNext()`/`goPrev()` move the cursor O(1).

### Why Chosen
- **O(1) bidirectional traversal** — both forward and backward navigation
- Alternatives considered:
  - **Singly Linked List**: No backward traversal — can't go "forward" after going back
  - **Array/ArrayList**: O(1) random access but O(n) insertion/deletion at arbitrary positions
  - **Stack**: Only supports one direction

### Time Complexity
| Operation | Time |
|-----------|------|
| `addFirst()` / `addLast()` | O(1) |
| `removeFirst()` / `removeLast()` | O(1) |
| `goNext()` / `goPrev()` | O(1) |
| `get(index)` | O(n) |

### Implementation
Nodes contain `prev` and `next` pointers. A `cursor` reference allows stateful navigation. `addAfterCursor()` supports branching (new navigation path from a back-tracked position).

---

## 4. Trie — Tag/Mood Autocomplete Search

### Where Used
When users type tags for their journal entries, the Trie provides autocomplete suggestions. All previously-used tags are inserted on load, and `autocomplete(prefix)` returns matching tags as the user types.

### Why Chosen
- **O(m) prefix search** where m = prefix length — independent of total tag count
- Alternatives considered:
  - **HashMap**: No prefix matching — would need to iterate all keys
  - **Linear scan**: O(n × m) — checks every tag against the prefix
  - **Sorted array + binary search**: O(log n + k) — decent but Trie is conceptually cleaner

### Time Complexity
| Operation | Time |
|-----------|------|
| `insert()` | O(m) |
| `search()` | O(m) |
| `startsWith()` | O(m) |
| `autocomplete()` | O(m + k) |
| `delete()` | O(m) |

*m = word/prefix length, k = number of results*

### Implementation
26-child array at each node (lowercase English letters). `isEndOfWord` flag marks complete words. `wordCount` on each node aids deletion cleanup.

---

## 5. BST — Entry Sorting by Date

### Where Used
Journal entries can be sorted chronologically using a BST. Date strings (`YYYY-MM-DD`) are Comparable, so the BST maintains sorted order. In-order traversal produces entries from earliest to latest. Range queries efficiently retrieve entries within a date window.

### Why Chosen
- **O(log n) insert/search/delete** while maintaining sorted order
- **In-order traversal** yields chronological listing in O(n)
- Alternatives considered:
  - **Sorted Array**: O(n) insertion to maintain order
  - **HashMap**: O(1) lookup but no inherent ordering
  - **Heap**: Good for min/max but not for range queries or full sorted order

### Time Complexity
| Operation | Average | Worst |
|-----------|---------|-------|
| `insert()` | O(log n) | O(n) |
| `search()` | O(log n) | O(n) |
| `delete()` | O(log n) | O(n) |
| `inOrderList()` | O(n) | O(n) |
| `rangeQuery()` | O(log n + k) | O(n + k) |

### Implementation
Standard BST with recursive insert/delete. Delete handles three cases (leaf, one child, two children — uses in-order successor). Range query prunes subtrees outside the range.

---

## 6. Queue — Notification Scheduling

### Where Used
The notification system uses a Queue to schedule and dispatch reminders in the order they were created. New reminders are enqueued, and the system processes them FIFO — first scheduled, first delivered.

### Why Chosen
- **FIFO ordering** ensures fair, chronological delivery of notifications
- Alternatives considered:
  - **Stack**: LIFO — would deliver newest notifications first (unfair)
  - **Priority Queue**: Useful if priority matters, but chronological FIFO suffices here
  - **ArrayList**: O(n) removal from front due to shifting

### Time Complexity
| Operation | Time |
|-----------|------|
| `enqueue()` | O(1) amortized |
| `dequeue()` | O(1) |
| `peek()` | O(1) |
| `size()` | O(1) |

### Implementation
Circular array with `front` and `rear` pointers. Wrap-around avoids O(n) shifting after dequeue. Auto-resizes (doubles) when capacity is reached, re-linearizing the circular buffer.
