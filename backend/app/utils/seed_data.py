import sys
import os

# Add parent directory to sys.path so we can run directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.exam import Exam
from app.models.question import Question
from app.utils.security import hash_password

def seed_database():
    print("Creating tables in database...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Create Default Admin User
        admin = db.query(User).filter(User.email == "admin@exam.com").first()
        if not admin:
            admin = User(
                name="Dr. Alan Turing (Lecturer)",
                email="admin@exam.com",
                password_hash=hash_password("admin123"),
                role="ADMIN",
                student_id_number=None,
                department="Computer Science & Engineering"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("Admin created: admin@exam.com / admin123")
        else:
            print("Admin already exists.")

        # 2. Create Default Student User
        student = db.query(User).filter(User.email == "student@exam.com").first()
        if not student:
            student = User(
                name="Ada Lovelace",
                email="student@exam.com",
                password_hash=hash_password("student123"),
                role="STUDENT",
                student_id_number="CSC/2026/042",
                department="Computer Science"
            )
            db.add(student)
            db.commit()
            db.refresh(student)
            print("Student created: student@exam.com / student123")
        else:
            print("Student already exists.")

        # 3. Create Sample Adaptive Exam 1: Python Programming & Logic
        exam1 = db.query(Exam).filter(Exam.title == "Adaptive Python Programming & Problem Solving").first()
        if not exam1:
            exam1 = Exam(
                title="Adaptive Python Programming & Problem Solving",
                course="CSC 301 - Advanced Python",
                description="A real-time adaptive examination testing core Python concepts, data structures, and algorithmic complexity. Difficulty automatically scales based on your ongoing answers.",
                duration_minutes=25,
                total_questions=8,
                created_by=admin.id,
                status="PUBLISHED"
            )
            db.add(exam1)
            db.commit()
            db.refresh(exam1)
            print(f"Exam 1 created: ID {exam1.id}")

            # Add balanced pool of Easy, Medium, and Hard questions
            questions_pool = [
                # --- EASY QUESTIONS (Difficulty = 1) ---
                {
                    "text": "What is the primary output of print(type([])) in Python 3?",
                    "a": "<class 'array'>", "b": "<class 'list'>", "c": "<class 'tuple'>", "d": "<class 'set'>",
                    "answer": "B", "diff": 1, "topic": "Data Types"
                },
                {
                    "text": "Which keyword is used to define an immutable function in Python?",
                    "a": "func", "b": "def", "c": "function", "d": "define",
                    "answer": "B", "diff": 1, "topic": "Functions"
                },
                {
                    "text": "Which of the following built-in collection types does NOT allow duplicate elements?",
                    "a": "list", "b": "tuple", "c": "set", "d": "dictionary keys and values",
                    "answer": "C", "diff": 1, "topic": "Collections"
                },
                {
                    "text": "What does the expression 11 // 3 evaluate to in Python?",
                    "a": "3.666", "b": "3", "c": "4", "d": "2",
                    "answer": "B", "diff": 1, "topic": "Operators"
                },
                {
                    "text": "What is the result of bool('False') in Python?",
                    "a": "False", "b": "True", "c": "None", "d": "TypeError",
                    "answer": "B", "diff": 1, "topic": "Type Conversion"
                },

                # --- MEDIUM QUESTIONS (Difficulty = 2) ---
                {
                    "text": "What will be the output of [x*2 for x in range(5) if x % 2 == 0]?",
                    "a": "[0, 4, 8]", "b": "[2, 6, 10]", "c": "[0, 2, 4]", "d": "[4, 8]",
                    "answer": "A", "diff": 2, "topic": "Comprehensions"
                },
                {
                    "text": "In Python dictionaries, what happens if you invoke d.get('key', 100) when 'key' is absent?",
                    "a": "Raises KeyError", "b": "Returns None", "c": "Returns 100", "d": "Inserts 'key': 100 into d",
                    "answer": "C", "diff": 2, "topic": "Dictionaries"
                },
                {
                    "text": "What is the time complexity of searching for a key in an average Python dictionary?",
                    "a": "O(log n)", "b": "O(n)", "c": "O(1)", "d": "O(n log n)",
                    "answer": "C", "diff": 2, "topic": "Algorithms"
                },
                {
                    "text": "What is the result of func(a, b=[]) when called repeatedly without arguments in standard Python?",
                    "a": "b is re-instantiated fresh each call", "b": "b retains state across calls due to mutable default",
                    "c": "Throws SyntaxError", "d": "Throws UnboundLocalError",
                    "answer": "B", "diff": 2, "topic": "Functions & Scope"
                },
                {
                    "text": "What does the 'yield' keyword do when placed inside a Python function body?",
                    "a": "Terminates the program immediately", "b": "Returns a generator iterator",
                    "c": "Waits for thread synchronization", "d": "Deletes local variables",
                    "answer": "B", "diff": 2, "topic": "Generators"
                },
                {
                    "text": "Which statement correctly describes the Python Global Interpreter Lock (GIL)?",
                    "a": "Prevents memory leaks in circular references",
                    "b": "Mutex that allows only one thread to hold control of the Python interpreter at once",
                    "c": "A compiler optimization for matrix math",
                    "d": "A network security firewall in standard socket library",
                    "answer": "B", "diff": 2, "topic": "Concurrency"
                },

                # --- HARD QUESTIONS (Difficulty = 3) ---
                {
                    "text": "What is the underlying sorting algorithm utilized by Python's built-in sorted() and list.sort()?",
                    "a": "Dual-Pivot QuickSort", "b": "IntroSort", "c": "Timsort", "d": "HeapSort",
                    "answer": "C", "diff": 3, "topic": "Algorithms & Internals"
                },
                {
                    "text": "In Python OOP, what algorithm does Python use to resolve Method Resolution Order (MRO)?",
                    "a": "Depth-First Search (DFS)", "b": "Breadth-First Search (BFS)",
                    "c": "C3 Linearization", "d": "Dijkstra's Shortest Path",
                    "answer": "C", "diff": 3, "topic": "OOP Architecture"
                },
                {
                    "text": "What is the key functional difference between a metaclass's __new__ and __init__ methods?",
                    "a": "__new__ creates the class object; __init__ initializes the already created class",
                    "b": "__new__ is only called for instances, not classes",
                    "c": "__init__ cannot receive class attributes",
                    "d": "There is no difference; they are aliases",
                    "answer": "A", "diff": 3, "topic": "Metaprogramming"
                },
                {
                    "text": "How does Python handle integer memory allocation for integers between -5 and 256?",
                    "a": "Allocated on the call stack dynamically",
                    "b": "Pre-allocated small integer caching array to improve performance",
                    "c": "Compressed as 8-bit bytes in high memory",
                    "d": "Encrypted using hash randomization",
                    "answer": "B", "diff": 3, "topic": "Memory Internals"
                },
                {
                    "text": "In asynchronous Python (asyncio), how does an await expression behave under the hood?",
                    "a": "Spawns a separate OS pthread immediately",
                    "b": "Yields control back to the event loop until the future/task resolves",
                    "c": "Blocks the entire operating system process",
                    "d": "Compiles the coroutine to C code at runtime",
                    "answer": "B", "diff": 3, "topic": "Async IO"
                }
            ]

            for q in questions_pool:
                question_obj = Question(
                    exam_id=exam1.id,
                    question_text=q["text"],
                    option_a=q["a"],
                    option_b=q["b"],
                    option_c=q["c"],
                    option_d=q["d"],
                    correct_answer=q["answer"],
                    difficulty=q["diff"],
                    topic=q["topic"]
                )
                db.add(question_obj)
            db.commit()
            print(f"Added {len(questions_pool)} questions to Exam 1.")

        # 4. Create Sample Adaptive Exam 2: Data Structures & Algorithms
        exam2 = db.query(Exam).filter(Exam.title == "Adaptive Data Structures & Algorithms").first()
        if not exam2:
            exam2 = Exam(
                title="Adaptive Data Structures & Algorithms",
                course="CSC 204 - Data Structures",
                description="Adaptive assessment on Big-O analysis, binary search trees, hashing, and graph theory.",
                duration_minutes=30,
                total_questions=6,
                created_by=admin.id,
                status="PUBLISHED"
            )
            db.add(exam2)
            db.commit()
            db.refresh(exam2)
            print(f"Exam 2 created: ID {exam2.id}")

            dsa_questions = [
                # Easy
                {
                    "text": "What is the worst-case time complexity of accessing an element by index in a standard array?",
                    "a": "O(n)", "b": "O(1)", "c": "O(log n)", "d": "O(n^2)",
                    "answer": "B", "diff": 1, "topic": "Arrays"
                },
                {
                    "text": "Which data structure operates on a Last-In, First-Out (LIFO) principle?",
                    "a": "Queue", "b": "Stack", "c": "Binary Tree", "d": "Priority Queue",
                    "answer": "B", "diff": 1, "topic": "Stacks"
                },
                {
                    "text": "What is the worst-case time complexity of linear search on an unsorted array of size n?",
                    "a": "O(1)", "b": "O(log n)", "c": "O(n)", "d": "O(n log n)",
                    "answer": "C", "diff": 1, "topic": "Search Algorithms"
                },
                # Medium
                {
                    "text": "What is the average time complexity of searching for an element in a balanced Binary Search Tree (BST)?",
                    "a": "O(1)", "b": "O(log n)", "c": "O(n)", "d": "O(n log n)",
                    "answer": "B", "diff": 2, "topic": "Trees"
                },
                {
                    "text": "In a hash table with open addressing, what technique resolves collisions by computing h(k, i) = (h'(k) + c1*i + c2*i^2) mod m?",
                    "a": "Linear Probing", "b": "Quadratic Probing", "c": "Double Hashing", "d": "Separate Chaining",
                    "answer": "B", "diff": 2, "topic": "Hashing"
                },
                {
                    "text": "Which graph traversal algorithm uses a FIFO Queue to visit nodes level by level?",
                    "a": "Depth-First Search (DFS)", "b": "Breadth-First Search (BFS)",
                    "c": "Bellman-Ford", "d": "Kruskal's Algorithm",
                    "answer": "B", "diff": 2, "topic": "Graphs"
                },
                # Hard
                {
                    "text": "What is the tightest worst-case time complexity of finding the Strongly Connected Components (SCCs) of a directed graph using Tarjan's algorithm?",
                    "a": "O(V + E)", "b": "O(V * E)", "c": "O(V^2)", "d": "O(E log V)",
                    "answer": "A", "diff": 3, "topic": "Advanced Graphs"
                },
                {
                    "text": "What is the worst-case rotation count required during an insertion in an AVL tree to restore balance?",
                    "a": "At most 2 rotations", "b": "O(log n) rotations", "c": "O(n) rotations", "d": "Exactly 1 rotation always",
                    "answer": "A", "diff": 3, "topic": "Self-Balancing Trees"
                },
                {
                    "text": "In Fibonacci Heaps, what is the amortized time complexity of the decrease-key operation?",
                    "a": "O(log n)", "b": "O(1)", "c": "O(n)", "d": "O(log log n)",
                    "answer": "B", "diff": 3, "topic": "Heaps"
                }
            ]

            for q in dsa_questions:
                question_obj = Question(
                    exam_id=exam2.id,
                    question_text=q["text"],
                    option_a=q["a"],
                    option_b=q["b"],
                    option_c=q["c"],
                    option_d=q["d"],
                    correct_answer=q["answer"],
                    difficulty=q["diff"],
                    topic=q["topic"]
                )
                db.add(question_obj)
            db.commit()
            print(f"Added {len(dsa_questions)} questions to Exam 2.")

    finally:
        db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
