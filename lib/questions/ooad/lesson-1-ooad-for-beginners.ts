/**
 * Question bank — PBDIT 504 Object-Oriented Analysis and Design,
 * "OOAD for Beginners: Objects, Use Cases, UML Diagrams, and Design Patterns"
 * Source: OOAD Lesson for Beginners – Online Module (J. M. V. Legaspi), pages 1–37 only
 * (the summary, glossary, exercises and references on pages 38–43 are intentionally not used).
 *
 * Style: every item is a SITUATION followed by "which is the best answer?".
 * Code items were checked by running the snippet in Python 3.
 */
import { build, code, type Entry } from "../build.ts";

/* ------------------------------------------------------------------ */
/* EASY — recognise the idea in a simple situation                     */
/* ------------------------------------------------------------------ */
const easy: Entry[] = [
  ["Situation: Before writing any code, Mika's team interviews the school registrar to find out what the new enrollment system must do and which people and things are involved.\n\nWhich step of OOAD are they doing?",
    ["Object-Oriented Analysis (OOA) — understanding WHAT the system must do", "Object-Oriented Design (OOD) — planning HOW the parts will be built", "Programming — building the system", "Testing — checking for errors"],
    "Analysis asks WHAT the system must do and which objects are involved. Design comes after and asks HOW."],
  ["Situation: After the interviews, the team draws a blueprint showing which classes exist and how they will talk to each other.\n\nWhich step is this?",
    ["Object-Oriented Design (OOD)", "Object-Oriented Analysis (OOA)", "Requirements gathering", "Deployment"],
    "Design plans HOW the solution will work: classes, how they communicate, and patterns."],
  ["Situation: A family tells an architect, \"We need 3 bedrooms and a garage.\" Later, the architect draws the exact room sizes.\n\nIn the module's house example, the family's request matches which part of OOAD?",
    ["Analysis", "Design", "Programming", "Iteration"],
    "Talking with the family about needs = analysis. The architect's blueprint = design. Construction = programming."],
  ["Situation: After testing the first version of a canteen ordering app, the team finds improvements, so they go back to analyze and design again.\n\nWhat is this repeating cycle called?",
    ["Iteration", "Inheritance", "Encapsulation", "Abstraction"],
    "OOAD repeats analysis, design, build and test. This repeating cycle is called iteration."],
  ["Situation: Your classmate looks at an electric fan and lists: brand, color, speed setting.\n\nWhat did your classmate list?",
    ["Attributes — things the object HAS", "Methods — things the object DOES", "Use cases", "Design patterns"],
    "Things an object HAS are attributes. Things it DOES (turnOn, rotate) are methods."],
  ["Situation: For a jeepney object, you write pickUp(), dropOff(), collectFare().\n\nWhat are these?",
    ["Methods — things the jeepney DOES", "Attributes — things the jeepney HAS", "Classes", "Actors"],
    "Methods are verbs written with parentheses, like pickUp() and collectFare()."],
  ["Situation: A bakery uses ONE cookie cutter to make many cookies, each with different sprinkles.\n\nIn OOP, the cookie cutter is like a…",
    ["Class (blueprint)", "Object (a real cookie)", "Method", "Actor"],
    "A class is the blueprint. Each cookie made from it is an object with its own values."],
  ["Situation: Ana, Ben and Carla are all made from the Student blueprint, but each has a different name and course.\n\nWhat are Ana, Ben and Carla?",
    ["Objects of the Student class", "Three different classes", "Methods of Student", "Attributes of Student"],
    "One class (Student) can create many objects, each with its own values."],
  ["Situation: You can withdraw money from an ATM by pressing buttons, but you can never open the machine and grab the cash yourself.\n\nWhich pillar of OOP does this show?",
    ["Encapsulation", "Inheritance", "Polymorphism", "Iteration"],
    "Encapsulation hides the data (cash) and lets others in only through the methods (buttons)."],
  ["Situation: On Messenger you just type and tap Send. You never see how the message travels through towers and servers.\n\nWhich pillar of OOP is this?",
    ["Abstraction", "Encapsulation", "Inheritance", "Polymorphism"],
    "Abstraction shows only what matters to the user and hides the complicated parts."],
  ["Situation: A Dog class and a Cat class both reuse everything from an Animal class.\n\nWhich pillar of OOP is this?",
    ["Inheritance", "Polymorphism", "Abstraction", "Encapsulation"],
    "Inheritance lets a child class reuse what the parent has. A Dog IS AN Animal."],
  ["Situation: The program tells every animal to speak(). The dog barks, the cat meows and the bird tweets.\n\nWhich pillar of OOP is this?",
    ["Polymorphism", "Inheritance", "Encapsulation", "Abstraction"],
    "Polymorphism means \"many forms\": the same method name behaves differently for each object."],
  ["Situation: At a fast-food counter, a customer chooses food, the cashier enters the order, the customer pays and receives the food.\n\nIn use case terms, what is \"Order a Meal\"?",
    ["A use case — a goal the user reaches with the system", "An actor", "A class", "A design pattern"],
    "A use case is a short story of how a user uses the system to reach a goal."],
  ["Situation: In the same fast-food story, who is the actor?",
    ["The customer", "The meal", "The cash register's database", "The menu"],
    "The actor is someone (or something) outside the system who uses it to reach a goal."],
  ["Situation: You are drawing a use case diagram for the School Library System.\n\nWhich symbol do you use for \"Borrow Book\"?",
    ["An oval (ellipse)", "A stick figure", "A rectangle", "A filled diamond"],
    "Use cases are ovals. Actors are stick figures. The system boundary is a rectangle."],
  ["Situation: You need to show which things are INSIDE the School Library System in your use case diagram.\n\nWhat do you draw?",
    ["A rectangle — the system boundary", "An oval", "A stick figure", "A dashed arrow"],
    "Everything inside the rectangle (system boundary) is part of the system."],
  ["Situation: Every time money is withdrawn at an ATM, the customer must enter a PIN.\n\nHow is \"Enter PIN\" related to \"Withdraw Cash\"?",
    ["«include» — it ALWAYS happens", "«extend» — it happens only sometimes", "Inheritance", "Aggregation"],
    "«include» is a step that ALWAYS happens as part of another use case."],
  ["Situation: After withdrawing cash, a receipt is printed ONLY if the customer chooses yes.\n\nHow is \"Print Receipt\" related to \"Withdraw Cash\"?",
    ["«extend» — it happens only sometimes", "«include» — it always happens", "Composition", "Multiplicity"],
    "«extend» is an extra step that happens only under a condition."],
  ["Situation: Your group must name a use case for students paying library fines.\n\nWhich is the best name?",
    ["Pay Overdue Fine", "Fine", "Fine Database", "Run SQL INSERT"],
    "Name use cases with a VERB + NOUN that describes the user's goal."],
  ["Situation: A developer from another country must understand your system quickly, so you want standard pictures everyone can read.\n\nWhat should you use?",
    ["UML diagrams", "Handwritten paragraphs", "Source code only", "A spreadsheet of passwords"],
    "UML is a standard drawing language, so any developer in the world can read the diagrams."],
  ["Situation: You need a diagram showing the classes, their attributes and methods, and how classes connect.\n\nWhich UML diagram is best?",
    ["Class diagram", "Sequence diagram", "Activity diagram", "Use case diagram"],
    "The class diagram, the most common UML diagram, shows classes, attributes, methods and relationships."],
  ["Situation: You want to show, for Borrow Book, who sends messages to whom and in what order.\n\nWhich UML diagram is best?",
    ["Sequence diagram", "Class diagram", "Use case diagram", "Package diagram"],
    "A sequence diagram shows messages between objects in time order, from top to bottom."],
  ["Situation: The school principal is not a programmer and wants to see the steps and decisions in borrowing a book, like a flowchart.\n\nWhich UML diagram is best?",
    ["Activity diagram", "Class diagram", "Sequence diagram", "Object diagram"],
    "Activity diagrams look like flowcharts, which makes them great for explaining a process to non-programmers."],
  ["Situation: In a class box you see \"- balance\".\n\nWhat does the minus sign mean?",
    ["The attribute is private", "The attribute is public", "The attribute is deleted", "The value is negative"],
    "In UML, \"-\" means private and \"+\" means public."],
  ["Situation: A loan record is always for exactly one book.\n\nWhich multiplicity goes beside Book on that line?",
    ["1", "0..*", "1..*", "0..1"],
    "\"1\" means exactly one."],
  ["Situation: A library member can have no loans at all, or many.\n\nWhich multiplicity fits?",
    ["0..* (zero or many)", "1 (exactly one)", "1..* (one or many)", "0..1 (zero or one)"],
    "0..* (or *) means zero or many."],
  ["Situation: Your team keeps solving the same kind of problem from scratch. A senior suggests using a well-tested, reusable solution plan instead.\n\nWhat is the senior suggesting?",
    ["A design pattern", "A use case", "An actor", "A multiplicity"],
    "A design pattern is a proven, reusable solution to a common problem, like a tested recipe."],
  ["Situation: A school app must have only ONE settings object that every screen shares.\n\nWhich design pattern fits?",
    ["Singleton", "Observer", "Factory", "Adapter"],
    "Singleton ensures only one object exists, shared by everyone, like the one school principal."],
  ["Situation: At a milk tea shop you just say \"One milk tea, please\" and never mix it yourself.\n\nWhich design pattern does this describe?",
    ["Factory", "Singleton", "Observer", "Adapter"],
    "A Factory lets you say WHAT you want while it decides HOW to build it."],
  ["Situation: When you subscribe to a YouTube channel, you get a notification every time a new video is uploaded.\n\nWhich design pattern does this describe?",
    ["Observer", "Singleton", "Factory", "Adapter"],
    "Observer: subscribers are automatically notified when the subject changes."],
  ["Situation: You read the problem \"The member borrows a book\" and want to find classes and methods quickly.\n\nUsing the noun-and-verb technique, what does \"borrows\" usually become?",
    ["A method, such as Member.borrowBook()", "A class", "An actor", "A multiplicity"],
    "Nouns become possible classes or attributes. Verbs become possible methods."],
  ["Situation: In \"The librarian records each loan\", what does the noun \"loan\" most likely become?",
    ["A class (Loan)", "A method", "A use case extension", "A design pattern"],
    "In the module's library example, the noun \"loan\" becomes the class Loan."],
  ["Situation: A classmate lists a Student's methods as: enroll, study, takeExam.\n\nAccording to the module, how should methods be written?",
    ["As verbs with parentheses: enroll(), study(), takeExam()", "As nouns: enrollment, studies, exam", "In capital letters: ENROLL, STUDY", "With a minus sign: -enroll, -study"],
    "Methods are verbs and are written with parentheses, like start(), brake() and accelerate()."],
  ["Situation: You want to draw UML just by typing simple text instead of dragging shapes.\n\nWhich free tool from the module fits best?",
    ["PlantUML", "diagrams.net", "Paper and pencil", "StarUML"],
    "PlantUML draws UML diagrams from typed text."],
  ["Situation: In the module's key idea, use cases tell us WHAT is needed and UML diagrams are the PICTURES of the plan.\n\nWhat do objects (OOP) represent?",
    ["WHO does the work", "WHY the system exists", "WHEN the code runs", "WHERE the server is"],
    "Use cases = WHAT, objects = WHO does the work, UML = PICTURES, patterns = PROVEN TRICKS."],
  ["Situation: Your groupmate is writing the history part of your report: \"UML was created by ____ and is maintained by the Object Management Group.\"\n\nWhich is the best answer to fill in the blank?",
    ["Grady Booch, James Rumbaugh and Ivar Jacobson", "The Gang of Four", "Abbott and Larman", "Cockburn and Fowler"],
    "UML was created by Booch, Rumbaugh and Jacobson and is maintained by the Object Management Group."],
];

/* ------------------------------------------------------------------ */
/* HARD — apply the idea and pick between close options                */
/* ------------------------------------------------------------------ */
const hard: Entry[] = [
  ["Situation: A team lead asks for the typical OUTPUTS of Object-Oriented Analysis.\n\nWhich is the best answer?",
    ["Use cases and a list of objects", "Class diagrams and sequence diagrams", "Design patterns and source code", "Test reports and installers"],
    "Analysis produces use cases and a list of objects. Class and sequence diagrams and design patterns are design outputs."],
  ["Situation: A team lead asks for the typical OUTPUTS of Object-Oriented Design.\n\nWhich is the best answer?",
    ["Class diagrams, sequence diagrams and design patterns", "Use cases and a list of objects", "Interview notes only", "The user's wish list"],
    "Design focuses on the solution, so its outputs are class and sequence diagrams and patterns."],
  ["Situation: A classmate lists the four important aspects of OOAD.\n\nWhich list is correct?",
    ["OOP, design patterns, UML diagrams, use cases", "Encapsulation, abstraction, inheritance, polymorphism", "Analysis, design, build, test", "Singleton, Factory, Observer, Adapter"],
    "The four aspects of OOAD are OOP, design patterns, UML and use cases. The other lists are the OOP pillars, the process steps and some patterns."],
  ["Situation: A Teacher class and a Student class both get name and address from a Person class.\n\nWhich pillar, and how do we describe the relationship?",
    ["Inheritance — a Teacher IS A Person", "Encapsulation — Teacher hides Person", "Polymorphism — Person has many forms", "Aggregation — Person is part of Teacher"],
    "Children reuse the parent's attributes, an \"is a\" relationship."],
  ["Situation: In a BankAccount class, balance is private and only deposit() can change it, and deposit() rejects negative amounts.\n\nWhat is the main benefit?",
    ["The class protects its own data from careless changes", "The class runs faster", "The class can have many forms", "The class becomes a Singleton"],
    "Encapsulation hides data and forces others to go through methods that can check the input."],
  ["Situation: Your use case description has \"The member has a library card\" and \"The book is in the catalog.\"\n\nWhich section do these belong in?",
    ["Preconditions — must be true before", "Postconditions — true after", "Alternative flows", "Main success scenario"],
    "Preconditions must be true before the use case starts."],
  ["Situation: After Borrow Book succeeds, a loan record exists and the book's status is \"Borrowed\".\n\nWhich section of the use case description is this?",
    ["Postconditions", "Preconditions", "Goal", "Supporting actor"],
    "Postconditions describe what is true after the use case ends."],
  ["Situation: In Borrow Book, the step \"3a. Membership has expired: the system shows 'Membership expired' and the use case ends\" is written.\n\nWhat kind of flow is this?",
    ["Alternative flow (a \"what if?\")", "Main success scenario", "Precondition", "Postcondition"],
    "Alternative flows describe what happens when something goes differently, numbered from the main step (3a)."],
  ["Situation: In Borrow Book, the Member wants the book and the Librarian helps at the counter.\n\nWhat are their roles in the use case description?",
    ["Member = primary actor, Librarian = supporting actor", "Librarian = primary actor, Member = supporting actor", "Both are use cases", "Both are inside the system boundary"],
    "The primary actor has the goal. The supporting actor helps the system achieve it."],
  ["Situation: In the use case diagram, Borrow Book has an «include» to Verify Membership.\n\nWhich way does the dashed arrow point?",
    ["From Borrow Book TO Verify Membership (the included step)", "From Verify Membership to Borrow Book", "From the Member to Verify Membership", "No arrow; a solid line is used"],
    "For «include», the arrow points to the included step."],
  ["Situation: Pay Overdue Fine «extends» Return Book.\n\nWhich way does the dashed arrow point?",
    ["From Pay Overdue Fine TO Return Book (the base use case)", "From Return Book to Pay Overdue Fine", "From the Librarian to Return Book", "Both directions"],
    "For «extend», the arrow points to the base use case being extended."],
  ["Situation: An online order may have no rider yet, or exactly one rider once assigned.\n\nWhich multiplicity fits Rider?",
    ["0..1", "1", "0..*", "1..*"],
    "0..1 means zero or one, here none yet or one."],
  ["Situation: A FoodGo order must contain at least one food item, possibly more.\n\nWhich multiplicity fits FoodItem?",
    ["1..*", "0..*", "0..1", "1"],
    "1..* means one or many, so at least one."],
  ["Situation: A Library holds many Books, but a book can still exist outside the library (for example, when it's borrowed).\n\nWhich relationship fits?",
    ["Aggregation (hollow diamond)", "Composition (filled diamond)", "Inheritance", "«include»"],
    "In the module's class diagram, Library to Book is aggregation because a book can exist outside the library."],
  ["Situation: A House has Rooms. If the house is demolished, its rooms no longer exist.\n\nWhich relationship fits?",
    ["Composition — shown with a filled (black) diamond", "Aggregation — shown with a hollow diamond", "Association with 0..*", "Inheritance"],
    "A filled diamond means composition: a strong \"part of\" link where the part doesn't survive without the whole."],
  ["Situation: You are reading the three compartments of a UML class box from top to bottom.\n\nWhat is the correct order?",
    ["Class name, attributes, methods", "Methods, attributes, class name", "Attributes, class name, methods", "Class name, methods, attributes"],
    "A class box shows the name on top, then attributes, then methods."],
  ["Situation: In a sequence diagram you labeled an arrow isAvailable() sent to Book.\n\nWhat should you do with that label in the class diagram?",
    ["Add isAvailable() as a method of Book", "Make isAvailable a new class", "Turn it into an actor", "Delete it; sequence labels don't matter"],
    "Arrow labels in sequence diagrams become methods in the class diagram."],
  ["Situation: You are reading the Borrow Book sequence diagram and want to find the FIRST message sent.\n\nWhere should you look?",
    ["At the top — time flows from top to bottom", "At the far right — time flows right to left", "At the bottom — time flows upward", "In the middle — sequence diagrams have no order"],
    "Objects are lined up across the top, and time flows downward, so the first message is the highest arrow."],
  ["Situation: Your teacher says UML diagrams come in two big groups: some are like a PHOTO, others like a VIDEO.\n\nWhich are like a video?",
    ["Behavior diagrams — what the system does over time", "Structure diagrams — what the system is made of", "Class diagrams only", "None; all UML diagrams are photos"],
    "Structure diagrams are like a photo. Behavior diagrams (use case, sequence, activity) are like a video."],
  ["Situation: The school app must make sure that no part of the program can create a second SchoolPrincipal object.\n\nWhat is the key technique of the Singleton pattern?",
    ["Block outside creation (private constructor) and give one get_instance() method that always returns the same object", "Make every attribute public", "Use «extend» arrows", "Create a new object for every request"],
    "Blocking outside creation stops extra copies, and get_instance() always hands back the same single object."],
  ["Situation: A delivery app must create a Motorcycle, Car or Bicycle object depending on the distance, without the rest of the code knowing how each is built.\n\nWhich pattern fits best?",
    ["Factory", "Singleton", "Observer", "Adapter"],
    "Factory puts creation in one place: you say what you need and it builds the right object."],
  ["Situation: A weather app must alert every user who follows a city when the typhoon signal changes, instead of users checking again and again.\n\nWhich pattern fits best?",
    ["Observer", "Factory", "Singleton", "Adapter"],
    "Observer avoids constant checking: subscribers are notified automatically when something changes."],
  ["Situation: Two parts of a system don't fit together because they have different interfaces.\n\nAccording to the module's table, which pattern should you consider, and from which family?",
    ["Adapter — structural", "Observer — behavioral", "Singleton — creational", "Factory — creational"],
    "Adapter fixes interface mismatches and belongs to the structural family."],
  ["Situation: A classmate sorts design patterns into families.\n\nWhich sorting matches the module?",
    ["Singleton and Factory = creational; Observer = behavioral; Adapter = structural", "Singleton = behavioral; Observer = creational", "All patterns are structural", "Factory = behavioral; Adapter = creational"],
    "Creational: Singleton and Factory. Behavioral: Observer. Structural: Adapter."],
  ["Situation: In the library case study, the rules (max 3 books, 7-day loans, fine per day) must be kept in one shared place.\n\nWhich design does the module suggest?",
    ["A LibrarySettings Singleton", "A NotificationFactory", "An Observer on each book", "One settings object per member"],
    "Library rules live in one shared LibrarySettings object, which is a Singleton."],
  ["Situation: Members who reserved a book want to be told when it's returned.\n\nWhich design does the module suggest?",
    ["Observer — members subscribe to the book and get notified", "Singleton — one member at a time", "Factory — create a new book", "Inheritance — Member is a Book"],
    "Members subscribe to the book (Observer), and every subscriber is notified when it's returned."],
  ["Situation: A member prefers SMS, another email, another app alerts.\n\nWhich design from the case study fits creating the right notification?",
    ["A NotificationFactory", "A LibrarySettings Singleton", "Polymorphism by deleting classes", "An «include» arrow"],
    "A NotificationFactory creates an SMS, email or app notification depending on preference."],
  ["Situation: In the library problem, \"pays (a fine)\" was found by the noun-and-verb technique.\n\nWhere does the module place it?",
    ["Loan.computeFine()", "Librarian.addBook()", "Member.searchBook()", "A separate Fine actor"],
    "The noun-and-verb table maps \"pays\" to Loan.computeFine()."],
  ["Situation: In the library problem, \"seven days\" appears in the text.\n\nWhat does the module turn it into?",
    ["The attribute dueDate of Loan", "A class SevenDays", "A method of Member", "An actor"],
    "\"Seven days\" becomes the dueDate attribute of Loan."],
  ["Situation: Your report quotes a use case and your teacher asks you to credit the person who first introduced use cases.\n\nWhich is the best citation, according to the module?",
    ["Ivar Jacobson, 1992", "Gamma et al., 1994", "Abbott, 1983", "Fowler, 2003"],
    "Use cases were introduced by Ivar Jacobson (1992)."],
  ["Situation: You used the \"nouns become classes, verbs become methods\" trick in your project and want to credit its source in your report.\n\nWhich is the best citation, according to the module?",
    ["Abbott (1983), also taught by Larman (2004)", "Jacobson (1992)", "The Gang of Four (1994)", "Cockburn (2000)"],
    "The trick that nouns are classes and verbs are methods comes from Abbott (1983) and Larman (2004)."],
  ["Situation: A reviewer checks your slide that says \"The Gang of Four (1994) described ___ classic design patterns that are still used today.\"\n\nWhich number is correct?",
    ["23", "14", "3", "4"],
    "Gamma, Helm, Johnson and Vlissides described 23 classic patterns."],
  [code("Situation: You are testing a racing game's Car class. The car speeds up twice, then brakes.\n\nWhat is printed?", `class Car:
    def __init__(self):
        self.speed = 0
    def accelerate(self, amount):
        self.speed = self.speed + amount
    def brake(self):
        self.speed = 0

my_car = Car()
my_car.accelerate(40)
my_car.accelerate(20)
print(my_car.speed)
my_car.brake()
print(my_car.speed)`),
    ["`60\n0`", "`40\n0`", "`20\n0`", "`60\n60`"],
    "accelerate adds to speed (0 → 40 → 60), and brake sets it back to 0."],
  [code("Situation: A pet shop app keeps a list of pets and tells each one to speak().\n\nWhat is printed?", `class Animal:
    def speak(self):
        print("...")

class Dog(Animal):
    def speak(self):
        print("Woof!")

class Cat(Animal):
    def speak(self):
        print("Meow!")

for pet in [Dog(), Cat()]:
    pet.speak()`),
    ["`Woof!\nMeow!`", "`...\n...`", "`Meow!\nWoof!`", "`Woof!\n...`"],
    "Each object uses its own speak(). That's polymorphism."],
];

/* ------------------------------------------------------------------ */
/* TRICKY — traps, edge cases and common mistakes                      */
/* ------------------------------------------------------------------ */
const tricky: Entry[] = [
  ["Situation: In an ATM use case diagram, the ATM contacts the Bank System to approve withdrawals.\n\nWhat is the Bank System in the diagram?",
    ["An actor — actors can be other systems, not only people", "A use case", "A class inside the boundary", "An «extend» relationship"],
    "An actor is someone OR something outside the system that uses it, including another system."],
  ["Situation: A groupmate names a use case \"Database\".\n\nWhat is the best feedback?",
    ["Rename it as a user goal with a verb, e.g. \"Search Book\"", "It's perfect: databases are important", "Draw it as an actor", "Make it an «include» of every use case"],
    "Use case names should be goals (verb + noun), not things like \"Book\" or \"Database\"."],
  ["Situation: A step in your use case reads \"Run SQL INSERT into loans table.\"\n\nWhat is wrong?",
    ["It's a technical step; use cases are written from the user's point of view", "Nothing; SQL makes it precise", "It should be an actor", "It must be drawn as a filled diamond"],
    "Use cases describe the user's view, not programmer-level technical steps."],
  ["Situation: A student draws the Member stick figure INSIDE the School Library System rectangle.\n\nWhat is the mistake?",
    ["Actors belong OUTSIDE the system boundary", "Actors must be ovals", "The rectangle should be a diamond", "Nothing is wrong"],
    "Actors are outside the system and use it, so put them outside the box."],
  ["Situation: \"Print Receipt\" happens only if the customer chooses it after \"Withdraw Cash\". A student marks it «include».\n\nWhat is the best correction?",
    ["Use «extend», because it happens only sometimes", "Keep «include», because it's related", "Use inheritance", "Use composition"],
    "«include» = always. «extend» = only sometimes, under a condition."],
  ["Situation: A classmate says, \"UML is a programming language, so we can run our class diagram.\"\n\nWhat is the best answer?",
    ["No — UML is a drawing (modeling) language, not a programming language", "Yes — UML compiles to Python", "Yes — but only sequence diagrams", "No — UML is a database"],
    "UML is a standard drawing language for describing software, not a programming language."],
  ["Situation: A teammate wants to use Singleton for EVERY class \"to be safe\".\n\nWhat is the best advice?",
    ["Use Singleton only when there truly must be one object; overusing it makes programs hard to test", "Good idea: fewer objects is always better", "Use Factory instead for every class", "Singletons are required by UML"],
    "Use Singleton only when needed. Overuse makes programs hard to test."],
  ["Situation: A developer adds Observer, Factory and Singleton to a tiny program that has none of those problems.\n\nWhat does the module warn?",
    ["Don't force patterns where the problem doesn't exist; it makes code harder to understand", "More patterns always means better design", "Patterns must be used in sets of three", "Patterns are finished code to copy"],
    "Patterns solve specific problems. Forcing them in adds confusion."],
  ["Situation: A student copies a design pattern's sample code exactly, expecting it to fit every program.\n\nWhat is the misunderstanding?",
    ["A pattern is a plan you adapt, not finished code you copy", "Patterns must never be changed", "Patterns are UML diagrams", "Patterns only work in Python"],
    "Like an adobo recipe, you follow the general steps and adjust to your program."],
  ["Situation: In Python, a BankAccount stores _balance. A teammate prints account._balance directly and it works.\n\nWhat is the best judgment?",
    ["It works, but it's bad practice — Python won't stop you; use get_balance()", "Python blocks it with an error", "This is how encapsulation should be used", "The underscore makes it public in UML"],
    "Python doesn't enforce private access, so direct access is possible but bad practice."],
  ["Situation: Someone says, \"Cellphone and myPhone are both classes.\"\n\nWhat is the best correction?",
    ["Cellphone is a class (blueprint); myPhone is an object made from it", "Both are objects", "Cellphone is an object; myPhone is a class", "Both are methods"],
    "The class is the blueprint. myPhone is one real object created from it."],
  ["Situation: A student writes these \"methods\" for a Student: name, studentId, course.\n\nWhat is wrong?",
    ["Those are attributes (things it HAS); methods are actions like enroll() or takeExam()", "Nothing is wrong", "They should be actors", "They should be use cases"],
    "Attributes are nouns or adjectives. Methods are verbs with parentheses."],
  ["Situation: A classmate claims polymorphism and inheritance are the same thing.\n\nWhich explanation is best?",
    ["Inheritance = a child reuses the parent; polymorphism = the same method name behaves differently per object", "They are identical", "Polymorphism = hiding data; inheritance = showing data", "Inheritance happens only in UML"],
    "Inheritance gives Dog and Cat Animal's features. Polymorphism makes speak() bark or meow."],
  ["Situation: You must explain to a non-technical barangay official how a document request flows, including yes/no decisions.\n\nWhich diagram is the BEST choice?",
    ["Activity diagram", "Class diagram", "Sequence diagram with method names", "Raw source code"],
    "Activity diagrams look like flowcharts with decisions, which non-programmers can follow."],
  ["Situation: A student says a sequence diagram shows what the system is MADE OF, like a photo.\n\nWhat is the best correction?",
    ["That describes structure diagrams; sequence diagrams show behavior over time, like a video", "Correct as stated", "Sequence diagrams show only multiplicity", "Sequence diagrams are use cases"],
    "Class diagrams are structure (photo). Sequence diagrams are behavior (video)."],
  ["Situation: A loan must be for exactly one book, but a student wrote 0..* beside Book.\n\nWhat does 0..* wrongly allow?",
    ["A loan with no book, or with many books", "Exactly one book", "Only one member", "Nothing; 0..* means exactly one"],
    "0..* allows zero or many. Exactly one is \"1\"."],
  ["Situation: An Order is drawn with a filled diamond to Rider, meaning the rider is destroyed when the order ends.\n\nWhat is the best judgment?",
    ["Wrong — a rider exists independently, so composition (filled diamond) doesn't fit", "Correct — riders belong to one order forever", "It should be inheritance: Rider is an Order", "Diamonds aren't UML"],
    "A filled diamond (composition) means the part dies with the whole. A rider clearly does not."],
  ["Situation: In OOAD, after testing you find a better way to design the Loan class.\n\nWhat should the team do?",
    ["Go back and analyze/design again — OOAD is iterative", "Never change the design after coding", "Delete the use cases", "Restart from a brand-new project"],
    "OOAD repeats in cycles (iteration) as improvements are discovered."],
  ["Situation: The module's beginner \"Simple Factory\" decides which drink to make inside one create() method of DrinkFactory. A classmate says this is exactly the Gang of Four's Factory Method.\n\nWhat is the best answer?",
    ["Not exactly — Factory Method uses the same idea but places the creating method in subclasses", "Yes, they are identical", "No — Factory Method is a Singleton", "No — Factory Method is behavioral"],
    "The teacher note says Factory Method moves the creation method into subclasses."],
  ["Situation: A multi-threaded server uses a Singleton, and two tasks call get_instance() at the same moment.\n\nWhat does the module's advanced note suggest?",
    ["Programs with many threads need extra care with Singleton", "Threads make Singleton impossible to write", "Use Observer instead", "Nothing special is needed"],
    "The module notes that threads need extra care with Singleton."],
  ["Situation: In the noun-and-verb technique, \"fine\" is found as a noun.\n\nWhat does the module say it becomes?",
    ["An attribute or method of Loan — not every noun becomes a class", "Always a separate class Fine", "An actor", "A design pattern"],
    "Nouns are POSSIBLE classes or attributes. \"Fine\" became part of Loan."],
  ["Situation: In the library text, \"Members want to be notified when a reserved book becomes available.\"\n\nThe verb \"notified\" becomes…",
    ["The Observer pattern", "The method Member.notified()", "A Singleton", "An actor named Notification"],
    "In the noun-and-verb table, \"notified\" points to the Observer pattern."],
  ["Situation: The Borrow Book use case says the system checks that the member has NO overdue books, but the member does have one.\n\nWhat happens per the alternative flow?",
    ["The librarian asks the member to return them first; the use case ends", "The loan is created anyway", "The member is deleted", "The book is marked borrowed"],
    "Alternative flow 4a ends the use case and asks for the overdue books to be returned first."],
  ["Situation: During Borrow Book, the scanned book is reserved by someone else.\n\nWhat is the correct outcome?",
    ["The system shows \"Reserved\" and the use case ends", "The member borrows it anyway", "The reservation is deleted automatically", "The book gets a 14-day loan"],
    "Alternative flow 5a: the system shows \"Reserved\" and the use case ends."],
  ["Situation: In the library class diagram, Member and Librarian both have name and contact number.\n\nWhy?",
    ["Both inherit from Person", "Both are aggregated by Library", "Both are actors only, not classes", "Because of the Observer pattern"],
    "A Member is a Person and a Librarian is a Person, so they inherit name and contact number."],
  [code("Situation: A junior developer tests the bank app: deposits ₱500, then accidentally deposits -₱100.\n\nWhat is printed?", `class BankAccount:
    def __init__(self):
        self._balance = 0.0
    def deposit(self, amount):
        if amount > 0:
            self._balance = self._balance + amount
    def get_balance(self):
        return self._balance

account = BankAccount()
account.deposit(500)
account.deposit(-100)
print(account.get_balance())`),
    ["`500.0`", "`400.0`", "`600.0`", "An error (ValueError)"],
    "deposit() ignores the negative amount, so the class protects its own data."],
  [code("Situation: Two different screens of the school app each ask for the principal using get_instance().\n\nWhat is printed?", `class SchoolPrincipal:
    _instance = None
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

p1 = SchoolPrincipal.get_instance()
p2 = SchoolPrincipal.get_instance()
print(p1 is p2)`),
    ["`True`", "`False`", "An error (TypeError)", "`None`"],
    "get_instance() creates the object only the first time, so everyone gets the same one."],
  [code("Situation: At the milk tea shop app, a customer orders \"hot chocolate\", which the drink factory doesn't know.\n\nWhat is printed?", `class Coffee:
    def serve(self): print("Here is your coffee.")
class MilkTea:
    def serve(self): print("Here is your milk tea.")
class Juice:
    def serve(self): print("Here is your juice.")

class DrinkFactory:
    _registry = {"coffee": Coffee, "milktea": MilkTea, "juice": Juice}
    @staticmethod
    def create(drink_type):
        return DrinkFactory._registry.get(drink_type, Juice)()

DrinkFactory.create("hot chocolate").serve()`),
    ["`Here is your juice.`", "An error (KeyError)", "`Here is your coffee.`", "Nothing is printed"],
    "Unknown drink types fall back to the default, Juice, so the factory still serves something."],
  [code("Situation: Ana and Ben subscribe to a channel, then Ana unsubscribes before a new video is uploaded.\n\nWhat is printed?", `class Channel:
    def __init__(self):
        self._subscribers = []
    def subscribe(self, cb):
        self._subscribers.append(cb)
    def unsubscribe(self, cb):
        if cb in self._subscribers:
            self._subscribers.remove(cb)
    def upload(self, title):
        for cb in self._subscribers:
            cb(title)

ana = lambda t: print("Ana got:", t)
ben = lambda t: print("Ben got:", t)
channel = Channel()
channel.subscribe(ana)
channel.subscribe(ben)
channel.unsubscribe(ana)
channel.upload("OOAD Lesson 1")`),
    ["`Ben got: OOAD Lesson 1`", "`Ana got: OOAD Lesson 1\nBen got: OOAD Lesson 1`", "`Ana got: OOAD Lesson 1`", "Nothing is printed"],
    "Only current subscribers are notified, and Ana unsubscribed."],
];

// Situations take time to read, so wordy OOAD questions get 40 seconds (OOAD only).
export const ooadLesson1Questions = [
  ...build("ooad1", "easy", easy),
  ...build("ooad1", "hard", hard),
  ...build("ooad1", "tricky", tricky),
].map((q) => ({ ...q, wordyTime: 40 }));
