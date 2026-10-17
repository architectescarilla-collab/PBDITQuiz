/**
 * Key-terms flashcards — OOAD, Lesson 4 "OOAD for Beginners".
 * Source: the module's pages 1–37 only (no Java code; pages 38–43 not used).
 * Front = term, back = plain meaning, detail = everyday example from the module.
 */
import type { Flashcard } from "../../types";

type Card = [front: string, back: string, detail?: string];

const GROUPS: [group: string, cards: Card[]][] = [
  [
    "OOAD basics",
    [
      ["OOAD (Object-Oriented Analysis and Design)", "A way of planning software by thinking about real-world objects (people, things, places, events) and how they work together.", "Like planning a house before building it."],
      ["Object-Oriented Analysis (OOA)", "Understand the problem: WHAT must the system do, and which objects are involved?", "Talking with the family: how many bedrooms? Outputs: use cases, a list of objects."],
      ["Object-Oriented Design (OOD)", "Plan the solution: HOW will the objects be built and how will they talk to each other?", "The architect's blueprint. Outputs: class diagrams, sequence diagrams, design patterns."],
      ["Iteration", "The repeating OOAD cycle: analyze → design → build → test, then improve and go around again.", "After testing you usually find improvements, so you analyze and design again."],
      ["The four aspects of OOAD", "Object-Oriented Programming, design patterns, UML diagrams, and use cases.", "A car with attributes and methods · a tested recipe · a house blueprint · \"A member borrows a book.\""],
    ],
  ],
  [
    "OOP",
    [
      ["Class", "A blueprint or template for creating objects.", "One cookie cutter can make many cookies."],
      ["Object", "A real thing made from a class, with its own values.", "Ana, Ben and Carla are all Student objects, each with a different name and course."],
      ["Attribute", "Something an object HAS (its data). Written as a noun or adjective.", "An electric fan has a brand, color and speedLevel."],
      ["Method", "Something an object DOES (an action). Written as a verb with parentheses.", "turnOn(), rotate(), pickUp(), collectFare()"],
      ["The four pillars of OOP", "Encapsulation, abstraction, inheritance, polymorphism.", "The pillars that hold up object-oriented programming."],
      ["Encapsulation", "Keep data and the methods that use it together, and hide the data so others must go through the methods.", "An ATM: you press buttons, but you can never grab the cash inside."],
      ["Abstraction", "Show only the important details and hide the complicated parts.", "You tap Send on Messenger without seeing the towers and servers."],
      ["Inheritance", "A child class reuses the attributes and methods of a parent class (an \"is a\" relationship).", "A Dog IS AN Animal. Teacher and Student both get name and address from Person."],
      ["Polymorphism", "\"Many forms\": the same method name behaves differently for different objects.", "speak(): the Dog barks, the Cat meows, the Bird tweets."],
      ["\"-\" and \"+\" in a UML class box", "\"-\" means private (hidden inside the class). \"+\" means public (others can use it).", "- balance   + deposit()"],
    ],
  ],
  [
    "Use cases",
    [
      ["Use case", "A short story of how a user uses the system to reach a goal, told from the user's point of view.", "\"Order a Meal\" at a fast-food counter."],
      ["Actor", "Someone or something OUTSIDE the system that uses it. It can be a person or another system.", "Member, Librarian, or the Bank System an ATM contacts."],
      ["Good use case name", "A VERB + NOUN that states the user's goal.", "Borrow Book, Pay Overdue Fine. Not \"Book\" or \"Database\"."],
      ["System boundary", "The rectangle in a use case diagram. Everything inside it is part of the system; actors stay outside.", "The \"School Library System\" box."],
      ["Use case symbols", "Stick figure = actor · oval = use case · rectangle = system boundary · solid line = association.", "Member — (Borrow Book), inside the library box."],
      ["«include»", "A step that ALWAYS happens as part of another use case. The dashed arrow points to the included step.", "Every ATM withdrawal includes Enter PIN. Borrow Book includes Verify Membership."],
      ["«extend»", "An extra step that happens ONLY SOMETIMES, under a condition. The dashed arrow points to the base use case.", "Print Receipt extends Withdraw Cash. Pay Overdue Fine extends Return Book."],
      ["Use case description", "Explains the steps: ID & name, primary/supporting actor, goal, preconditions, main success scenario, alternative flows, postconditions.", "UC-02 Borrow Book (a template based on Cockburn, 2000)."],
      ["Primary actor vs supporting actor", "The primary actor has the goal; the supporting actor helps the system reach it.", "Borrow Book: Member (primary), Librarian (supporting)."],
      ["Precondition", "What must be true BEFORE the use case starts.", "The member has a library card; the book is in the catalog."],
      ["Main success scenario", "The normal step-by-step path when everything goes right.", "Bring book → scan ID → verify membership → … → hand the book to the member."],
      ["Alternative flow", "A \"what if?\" path when something goes differently, numbered from the main step.", "3a. Membership expired → show \"Membership expired\", use case ends."],
      ["Postcondition", "What is true AFTER the use case ends.", "A loan record exists and the book's status is \"Borrowed\"."],
      ["Who introduced use cases?", "Ivar Jacobson (1992).", "One of the best tools for discovering what a system must do (Cockburn, 2000)."],
    ],
  ],
  [
    "UML",
    [
      ["UML (Unified Modeling Language)", "A standard set of diagrams for describing software. It is a drawing language, not a programming language.", "Created by Booch, Rumbaugh and Jacobson; maintained by the Object Management Group."],
      ["Structure vs behavior diagrams", "Structure diagrams show what the system is made of (like a photo). Behavior diagrams show what it does over time (like a video).", "Class diagram = structure. Use case, sequence, activity = behavior."],
      ["Class diagram", "The most common UML diagram: classes, their attributes and methods, and how the classes are connected.", "The School Library: Person, Member, Librarian, Loan, Book, Library."],
      ["The three compartments of a class box", "Top: class name. Middle: attributes. Bottom: methods.", "Book | - title, - status | + isAvailable(), + markBorrowed()"],
      ["Association", "A general connection between two classes, drawn as a solid line.", "A Member makes Loans."],
      ["Inheritance in a class diagram", "Shows that a child class \"is a\" kind of the parent class.", "A Member is a Person; a Librarian is a Person."],
      ["Aggregation", "A weak \"has a\" link: the part can exist without the whole. Drawn with a hollow diamond.", "A Library holds Books, but a book can exist outside the library."],
      ["Composition", "A strong \"part of\" link: the part does not survive without the whole. Drawn with a filled (black) diamond.", "If the whole is destroyed, its parts go with it."],
      ["Multiplicity", "The small numbers on a UML line that answer \"how many?\".", "1 · 0..1 · 0..* · 1..*"],
      ["Multiplicity 1", "Exactly one.", "A loan is for exactly 1 book."],
      ["Multiplicity 0..1", "Zero or one.", "An order has 0 or 1 rider (none yet, or one)."],
      ["Multiplicity 0..* (or *)", "Zero or many.", "A member can have 0 or many loans."],
      ["Multiplicity 1..*", "One or many (at least one).", "An order contains at least 1 food item."],
      ["Sequence diagram", "Shows who talks to whom, and in what order, for one use case. Time flows top to bottom; each arrow is a message.", "Borrow Book: Member → Library System → Book → Loan."],
      ["Why draw sequence diagrams?", "The labels on the arrows become methods in the class diagram, so they help you discover the methods each class needs.", "isAvailable() and markBorrowed() become methods of Book."],
      ["Activity diagram", "A flowchart-like diagram of the steps and decisions in a process, great for explaining to non-programmers.", "Borrowing a book, with two yes/no decisions."],
      ["Free tools for drawing UML", "Paper and pencil, diagrams.net (draw.io), PlantUML (type text), StarUML.", "PlantUML draws diagrams from simple typed text."],
    ],
  ],
  [
    "Design patterns",
    [
      ["Design pattern", "A proven, reusable solution to a problem programmers face again and again. It's a plan you adapt, not finished code.", "Like a recipe for adobo: follow the steps, adjust to taste."],
      ["Gang of Four", "Gamma, Helm, Johnson and Vlissides, who described 23 classic design patterns in 1994.", "Their patterns are still used today."],
      ["The three pattern families", "Creational, structural, behavioral.", "Singleton and Factory = creational · Adapter = structural · Observer = behavioral."],
      ["Singleton", "Only ONE object of the class may exist, shared by everyone. Others get it through one method (get_instance()).", "A school has only one principal; whoever asks gets the same person."],
      ["When to use Singleton", "Only when there truly must be one object (app settings, a log file, a database connection). Overusing it makes programs hard to test.", "Programs with many threads need extra care."],
      ["Factory", "Put object creation in one place: you say WHAT you want, the factory decides HOW to build it.", "At a milk tea shop: \"One milk tea, please.\""],
      ["Simple Factory vs Factory Method", "A Simple Factory decides in one create() method. The Gang of Four's Factory Method uses the same idea but places that method in subclasses.", "The module's DrinkFactory is a Simple Factory."],
      ["Observer", "Interested objects subscribe to a subject; when something changes, every subscriber is notified automatically.", "Subscribe to a YouTube channel → get a notification for each new video."],
      ["Adapter", "Makes two parts with different interfaces fit together (a structural pattern).", "\"Two parts do not fit together.\""],
      ["When NOT to use a pattern", "Don't force a pattern into a program that doesn't have that problem; it only makes the code harder to understand.", "Patterns solve specific problems."],
    ],
  ],
  [
    "Case study",
    [
      ["Noun-and-verb technique", "In a problem description, nouns are possible classes or attributes, and verbs are possible methods.", "From Abbott (1983), also taught by Larman (2004)."],
      ["Library: \"member, book, librarian, loan\"", "Nouns that become the classes Member, Book, Librarian and Loan.", "\"Seven days\" becomes the dueDate attribute of Loan; \"fine\" becomes part of Loan."],
      ["Library: \"search, borrow, records, adds, pays\"", "Verbs that become methods: searchBook(), borrowBook(), processLoan(), addBook(), computeFine().", "\"Notified\" points to the Observer pattern."],
      ["Library: patterns used", "Observer notifies members when a reserved book returns; a LibrarySettings Singleton holds the rules; a NotificationFactory makes SMS, email or app alerts.", "Rules: max 3 books, 7-day loans, fine per day."],
      ["The OOAD key idea", "Use cases = WHAT is needed · objects = WHO does the work · UML = the PICTURES of the plan · design patterns = PROVEN TRICKS.", "Understand the problem with objects, then plan the solution with objects, before writing code."],
    ],
  ],
];

export const ooadLesson4Flashcards: Flashcard[] = GROUPS.flatMap(([group, cards], g) =>
  cards.map(([front, back, detail], i) => ({
    id: `ooad4-card-${g + 1}-${String(i + 1).padStart(2, "0")}`,
    group,
    front,
    back,
    detail,
  })),
);
