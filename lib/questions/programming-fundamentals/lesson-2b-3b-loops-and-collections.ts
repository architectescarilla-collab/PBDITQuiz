/**
 * Question bank — Programming Fundamentals, Lessons 2b, 3a & 3b:
 * "Loops, Lists & Tuples, Sets & Dictionaries"
 * Sources: PBDIT 501 Lesson 2b (Control Flow Statements: Loops), Lesson 3a (List and Tuple),
 * Lesson 3b (Set and Dictionary) — PUP Open University System.
 *
 * Every "What is the output?" answer was checked by running it in Python 3.
 */
import { build, code, type Entry } from "../build.ts";

/* ------------------------------------------------------------------ */
/* EASY — core facts about loops and the four collection types        */
/* ------------------------------------------------------------------ */
const easy: Entry[] = [
  ["Which function is used to loop a specified number of times?",
    ["range()", "len()", "type()", "input()"],
    "`range()` returns a sequence of numbers, ideal for looping a set number of times."],
  ["By default, `range()` starts counting at…",
    ["0", "1", "-1", "the stop value"],
    "range() starts at 0 by default and increments by 1."],
  ["`range(6)` produces which numbers?",
    ["0 to 5", "1 to 6", "0 to 6", "1 to 5"],
    "range ends at the specified number minus 1: 0, 1, 2, 3, 4, 5."],
  ["Which statement exits a loop immediately?",
    ["break", "continue", "pass", "else"],
    "`break` stops the loop entirely."],
  ["Which statement skips the rest of the current iteration and moves to the next?",
    ["continue", "break", "pass", "return"],
    "`continue` jumps to the next iteration of the loop."],
  ["Which statement does nothing but avoids an error in an empty loop?",
    ["pass", "break", "continue", "None"],
    "A for loop can't be empty, so `pass` acts as a placeholder."],
  ["A loop inside another loop is called a…",
    ["Nested loop", "Double loop", "Infinite loop", "Inner function"],
    "Nested for loops run the inner loop fully for every pass of the outer loop."],
  ["How many collection data types does the lesson describe?",
    ["4 — list, tuple, set, dictionary", "2 — list and tuple", "3 — list, set, string", "5 — list, tuple, set, dict, string"],
    "Python has four collection data types: list, tuple, set and dictionary."],
  ["Which collection is ordered and CHANGEABLE, and allows duplicates?",
    ["List", "Tuple", "Set", "frozenset"],
    "Lists are ordered, changeable and allow duplicate members."],
  ["Which collection is ordered and UNCHANGEABLE, and allows duplicates?",
    ["Tuple", "List", "Set", "Dictionary"],
    "Tuples are ordered, unchangeable and allow duplicates."],
  ["Which collection is unordered, unindexed, and does NOT allow duplicates?",
    ["Set", "List", "Tuple", "Dictionary"],
    "Sets are unordered, unindexed and have no duplicate members."],
  ["Which collection stores data in key:value pairs?",
    ["Dictionary", "List", "Tuple", "Set"],
    "Dictionaries store key:value pairs."],
  ["What is the index of the FIRST item in a list?",
    ["0", "1", "-1", "It depends on the list"],
    "The first index is zero, the second is one, and so on."],
  ["Which index gets the LAST item of a list?",
    ["-1", "0", "len(list)", "last"],
    "Negative indexing starts from the end: -1 is the last item."],
  ["Which function returns how many items a list has?",
    ["len()", "count()", "size()", "range()"],
    "`len(thislist)` returns the number of items."],
  ["Which list method adds an item to the END?",
    ["append()", "insert()", "extend()", "add()"],
    "`append()` adds a single item at the end."],
  ["Which list method adds an item at a SPECIFIC index?",
    ["insert()", "append()", "extend()", "update()"],
    "`insert(2, \"watermelon\")` puts the item at index 2."],
  ["Which list method adds all items of another list to the end?",
    ["extend()", "append()", "insert()", "join()"],
    "`extend()` appends each element of another iterable."],
  ["Which list method removes a specified VALUE?",
    ["remove()", "pop()", "del", "clear()"],
    "`remove(\"banana\")` removes the first item with that value."],
  ["Which list method removes the item at a specified INDEX?",
    ["pop()", "remove()", "discard()", "clear()"],
    "`pop(1)` removes index 1. Without an index, it removes the last item."],
  ["Which list method empties the list but keeps it?",
    ["clear()", "del", "pop()", "remove()"],
    "`clear()` leaves an empty list `[]`."],
  ["Which list method sorts the list alphabetically or numerically?",
    ["sort()", "order()", "arrange()", "sorted_list()"],
    "`thislist.sort()` sorts in place, ascending by default."],
  ["Which list method reverses the current order of items?",
    ["reverse()", "sort(reverse)", "flip()", "backward()"],
    "`reverse()` flips the order without sorting."],
  ["Which list method makes a copy of the list?",
    ["copy()", "clone()", "duplicate()", "dup()"],
    "`copy()` returns a new list with the same items. `list(thislist)` also works."],
  ["Which operator joins two lists into a new list?",
    ["+", "*", "&", "%"],
    "`list3 = list1 + list2` concatenates them."],
  ["Tuples use which brackets?",
    ["( ) parentheses", "[ ] square brackets", "{ } curly braces", "< > angle brackets"],
    "Tuples use parentheses; lists use square brackets."],
  ["Sets are written with…",
    ["Curly brackets { }", "Square brackets [ ]", "Parentheses ( )", "Quotes \" \""],
    "Sets use curly brackets, e.g. `{\"apple\", \"banana\"}`."],
  ["Which set method adds ONE item?",
    ["add()", "append()", "insert()", "push()"],
    "Sets use `add()`, not append()."],
  ["Which set method adds items from another set or iterable?",
    ["update()", "add()", "extend()", "append()"],
    "`update()` inserts the items from any iterable into the set."],
  ["How do you access a dictionary value?",
    ["By its key, e.g. `thisdict[\"brand\"]`", "By its index, e.g. `thisdict[0]`", "With `thisdict.index(\"brand\")`", "You can't access dictionary values"],
    "Dictionary items are referred to by key name."],
  ["Which dictionary method returns all the keys?",
    ["keys()", "values()", "items()", "get()"],
    "`keys()` returns a view of all keys."],
  ["Which dictionary method returns all the values?",
    ["values()", "keys()", "items()", "pop()"],
    "`values()` returns a view of all values."],
  ["Which dictionary method returns each item as a (key, value) tuple?",
    ["items()", "keys()", "values()", "zip()"],
    "`items()` returns the key:value pairs as tuples."],
  ["How do you add a new item to a dictionary?",
    ["Assign a value to a new key, e.g. `thisdict[\"color\"] = \"red\"`", "Use `thisdict.append(\"color\")`", "Use `thisdict.add(\"color\")`", "Use `thisdict.insert(\"color\")`"],
    "A new key with an assigned value adds the item."],
  ["A dictionary that contains other dictionaries is called a…",
    ["Nested dictionary", "Double dictionary", "Multi-dictionary", "Dictionary list"],
    "Dictionaries inside a dictionary are nested dictionaries."],
  ["Which function combines items from several lists into pairs/tuples?",
    ["zip()", "join()", "merge()", "combine()"],
    "`zip()` combines items from each of the specified lists, tuples or dictionaries."],
  [code("What is the output?", `for x in range(6):
    print(x, end=' ')`),
    ["`0 1 2 3 4 5`", "`1 2 3 4 5 6`", "`0 1 2 3 4 5 6`", "`1 2 3 4 5`"],
    "range(6) produces 0 to 5."],
  [code("What is the output?", `thislist = ["apple", "banana", "cherry"]
print(thislist[1])`),
    ["`banana`", "`apple`", "`cherry`", "An error"],
    "Index 1 is the second item."],
  [code("What is the output?", `thislist = ["apple", "banana", "cherry"]
print(len(thislist))`),
    ["`3`", "`2`", "`4`", "`18`"],
    "There are three items."],
  [code("What is the output?", `thisdict = {"brand": "Ford", "model": "Mustang", "year": 1964}
print(thisdict["model"])`),
    ["`Mustang`", "`model`", "`Ford`", "`1964`"],
    "The value stored under the key \"model\" is Mustang."],
];

/* ------------------------------------------------------------------ */
/* HARD — range() parameters, slicing, methods & their differences    */
/* ------------------------------------------------------------------ */
const hard: Entry[] = [
  ["In `range(2, 31, 2)`, what does the third parameter do?",
    ["Sets the increment (step) to 2", "Repeats the loop 2 times", "Starts at 2", "Stops at 2"],
    "range(start, stop, step): the third value is the increment."],
  ["When does the `else` block of a for loop run?",
    ["When the loop finishes normally (not stopped by break)", "Only when the loop has an error", "Before the loop starts", "Every time the loop repeats"],
    "A for loop's `else` runs after the loop completes, but not if `break` ended it."],
  ["Which of these can a for loop iterate over directly?",
    ["A list, tuple, dictionary, set or string", "Only lists", "Only numbers", "Only range() objects"],
    "For loops work on any sequence or iterable: lists, tuples, dicts, sets and strings."],
  ["In a nested loop, how many times does the inner body run if the outer loop runs 3 times and the inner loop 4 times?",
    ["12", "7", "4", "3"],
    "The inner loop runs fully for each outer pass: 3 × 4 = 12."],
  ["What does `print(x, end='')` do differently from `print(x)`?",
    ["It doesn't move to a new line after printing", "It prints nothing", "It ends the program", "It prints x twice"],
    "`end=''` replaces the default newline, so the next print continues on the same line."],
  ["In the lesson's Y/N program, why use `ans.upper() == 'Y'`?",
    ["So both 'y' and 'Y' are accepted", "To make the answer uppercase forever", "To check the length of the answer", "To convert the answer to a number"],
    "upper() makes the comparison case-insensitive."],
  ["What does `thislist[2:5]` return?",
    ["Items at indexes 2, 3 and 4", "Items at indexes 2 to 5", "Items at indexes 3, 4 and 5", "Only the items at indexes 2 and 5"],
    "The end index of a slice is not included: [2]…[4]."],
  ["What does `thislist[:4]` return?",
    ["Items from index 0 to 3", "Items from index 4 to the end", "Only the item at index 4", "The last 4 items"],
    "Leaving out the start begins at index 0, so you get [0]…[3]."],
  ["What does `thislist[2:]` return?",
    ["Items from index 2 to the end", "The first 2 items", "Only the item at index 2", "Everything except the last 2"],
    "Leaving out the end goes to the end of the list."],
  ["What does `pop()` with NO index remove from a list?",
    ["The last item", "The first item", "All items", "A random item"],
    "`pop()` without an index removes the last item."],
  ["What is the difference between `del thislist` and `thislist.clear()`?",
    ["`del` deletes the list completely; `clear()` leaves an empty list", "They are exactly the same", "`clear()` deletes the variable; `del` empties it", "`del` only removes the first item"],
    "After `del`, using the name is an error. After `clear()`, it's `[]`."],
  ["What is the syntax of a list comprehension?",
    ["`[expression for item in iterable if condition]`", "`(item for expression in condition)`", "`{for item: iterable}`", "`list(for item in iterable)`"],
    "newlist = [expression for item in iterable if condition == True]."],
  ["How do you sort a list in DESCENDING order?",
    ["`thislist.sort(reverse = True)`", "`thislist.reverse()`", "`thislist.sort(-1)`", "`thislist.desc()`"],
    "sort(reverse = True) sorts descending. reverse() only flips the current order."],
  ["How do you sort a list case-INsensitively?",
    ["`thislist.sort(key = str.lower)`", "`thislist.sort(case = False)`", "`thislist.lower().sort()`", "`thislist.sort(reverse = True)`"],
    "Using `key = str.lower` compares the lowercase versions."],
  ["What does `fruits * 2` do to a list?",
    ["Repeats the items twice in a new list", "Multiplies each number by 2", "Doubles the list's length limit", "Causes an error"],
    "Multiplying a list repeats its items."],
  ["How do you create a tuple with ONE item?",
    ["`(\"apple\",)` — with a trailing comma", "`(\"apple\")`", "`[\"apple\"]`", "`tuple \"apple\"`"],
    "Without the comma, `(\"apple\")` is just a string in parentheses."],
  ["How can you \"change\" a tuple?",
    ["Convert it to a list, change the list, then convert back to a tuple", "Use `thistuple.append()`", "Assign `thistuple[1] = \"kiwi\"`", "You can't — there is no workaround"],
    "Tuples are unchangeable, but list(x) → change → tuple(y) works."],
  ["Creating a tuple by assigning values (`fruits = (\"apple\", \"banana\")`) is called…",
    ["Packing", "Unpacking", "Zipping", "Casting"],
    "Assigning values into a tuple is packing; extracting them is unpacking."],
  ["When unpacking, what does an asterisk (`*`) before a variable do?",
    ["Collects the remaining values into a list", "Multiplies the value", "Makes the variable private", "Deletes the value"],
    "`(green, yellow, *red) = fruits` puts the leftover values into a list."],
  ["Which tuple method returns how many times a value appears?",
    ["count()", "index()", "len()", "find()"],
    "`count()` returns the number of occurrences; `index()` returns the position."],
  ["Which tuple method returns the position of a value?",
    ["index()", "count()", "find()", "pos()"],
    "`index()` returns the index of the first occurrence."],
  ["What is the difference between `remove()` and `discard()` on a set?",
    ["`remove()` raises an error if the item is missing; `discard()` does not", "They are identical", "`discard()` raises an error; `remove()` does not", "`discard()` deletes the whole set"],
    "Use discard() when you're not sure the item exists."],
  ["Why don't you know which item `pop()` removes from a set?",
    ["Sets are unordered", "pop() is random by design for all collections", "Sets are sorted descending", "pop() always removes the first item"],
    "Sets are unordered, so there's no 'last' item."],
  ["What is the difference between `union()` and `update()` on sets?",
    ["`union()` returns a NEW set; `update()` inserts items into the existing set", "They are identical", "`update()` returns a new set", "`union()` removes duplicates but `update()` keeps them"],
    "Both exclude duplicates. union() makes a new set; update() changes set1."],
  ["Set items are \"unchangeable\", but which of these CAN you do?",
    ["Add new items and remove items", "Change an item in place by index", "Sort the set in place", "Access items by index"],
    "You can't change an existing item, but you can add() and remove() items."],
  ["What is the difference between `thisdict[\"color\"]` and `thisdict.get(\"color\")` when the key is missing?",
    ["`[ ]` raises a KeyError; `get()` returns None", "Both return None", "Both raise an error", "`get()` raises an error; `[ ]` returns None"],
    "get() is the safe way to read a key that may not exist."],
  ["What does `thisdict.update({\"color\": \"red\"})` do if \"color\" doesn't exist yet?",
    ["Adds the new item", "Raises a KeyError", "Does nothing", "Replaces the whole dictionary"],
    "update() changes existing keys and adds missing ones."],
  ["Which dictionary method removes the item with a specified key?",
    ["pop()", "popitem()", "discard()", "remove()"],
    "`pop(\"model\")` removes that key and returns its value."],
  ["Which dictionary method removes the LAST inserted item?",
    ["popitem()", "pop()", "clear()", "del"],
    "`popitem()` removes the most recently inserted item."],
  ["`keys()`, `values()` and `items()` return a \"view\". What does that mean?",
    ["Changes to the dictionary are reflected in the view", "It's a frozen copy that never changes", "It can only be printed once", "It sorts the dictionary"],
    "Views stay linked to the dictionary, so later changes show up."],
  ["How do you loop through BOTH keys and values of a dictionary?",
    ["`for x, y in thisdict.items():`", "`for x in thisdict.values():`", "`for x, y in thisdict:`", "`for x in thisdict.keys(), values():`"],
    "items() gives (key, value) pairs you can unpack into x, y."],
  ["Which two ways correctly COPY a dictionary?",
    ["`dict1.copy()` and `dict(dict1)`", "`dict2 = dict1` and `dict1.copy()`", "`dict(dict1)` and `dict2 = dict1`", "`dict1.clone()` and `dict1.dup()`"],
    "`dict2 = dict1` only makes another name for the same dictionary."],
  ["How do you access `name` inside the nested dictionary `myFamily[\"child1\"]`?",
    ["`myFamily[\"child1\"][\"name\"]`", "`myFamily[\"child1\"].name`", "`myFamily[\"child1\", \"name\"]`", "`myFamily.child1.name`"],
    "Use one set of square brackets per level of nesting."],
  ["How do you build a dictionary from a list of keys and a list of values?",
    ["`dict(zip(keys, values))`", "`dict(keys + values)`", "`zip(dict(keys), values)`", "`keys.update(values)`"],
    "zip() pairs them up and dict() turns the pairs into key:value items."],
  ["What does `zip(*result)` do?",
    ["Unzips — splits the pairs back into separate sequences", "Zips the result twice", "Multiplies the result", "Deletes the result"],
    "The * unpacks the pairs so zip() regroups them by position."],
  [code("What is the output?", `for x in range(2, 11, 3):
    print(x, end=' ')`),
    ["`2 5 8`", "`2 5 8 11`", "`3 6 9`", "`2 4 6 8 10`"],
    "Start at 2, step 3, stop before 11: 2, 5, 8."],
  [code("What is the output?", `thislist = ["apple", "banana", "cherry", "orange", "kiwi", "melon", "mango"]
print(thislist[2:5])`),
    ["`['cherry', 'orange', 'kiwi']`", "`['banana', 'cherry', 'orange']`", "`['cherry', 'orange', 'kiwi', 'melon']`", "`['banana', 'cherry', 'orange', 'kiwi']`"],
    "Indexes 2, 3 and 4. The end index 5 isn't included."],
  [code("What is the output?", `thislist = ["apple", "banana", "cherry"]
thislist.insert(2, "watermelon")
print(thislist)`),
    ["`['apple', 'banana', 'watermelon', 'cherry']`", "`['apple', 'watermelon', 'banana', 'cherry']`", "`['apple', 'banana', 'cherry', 'watermelon']`", "`['watermelon', 'apple', 'banana', 'cherry']`"],
    "insert(2, …) places the item at index 2 and shifts cherry right."],
  [code("What is the output?", `t = ("apple", "banana", "cherry", "apple", "cherry")
print(t.count("apple"))`),
    ["`2`", "`1`", "`0`", "`5`"],
    "\"apple\" appears twice. Tuples allow duplicates."],
  [code("What is the output?", `thisdict = {"brand": "Ford", "model": "Mustang", "year": 1964}
x = thisdict.pop("model")
print(x)`),
    ["`Mustang`", "`model`", "`{'brand': 'Ford', 'year': 1964}`", "`None`"],
    "pop() removes the key and returns its value."],
];

/* ------------------------------------------------------------------ */
/* TRICKY — output traces, aliasing, errors, edge cases               */
/* ------------------------------------------------------------------ */
const tricky: Entry[] = [
  [code("What is the output?", `for x in range(6):
    if x == 3:
        break
    print(x, end=' ')
else:
    print("Finally finished!")`),
    ["`0 1 2`", "`0 1 2 Finally finished!`", "`0 1 2 3`", "`0 1 2 3 Finally finished!`"],
    "break stops the loop at 3, so the else block is skipped."],
  [code("What is the output?", `for x in range(3):
    print(x, end=' ')
else:
    print("Done")`),
    ["`0 1 2 Done`", "`0 1 2`", "`Done`", "`0 1 2 3 Done`"],
    "The loop ends normally, so else runs."],
  [code("What is the output?", `fruits = ["apple", "banana", "cherry"]
for x in fruits:
    if x == "banana":
        break
    print(x)`),
    ["`apple`", "`apple\nbanana`", "`apple\nbanana\ncherry`", "`banana`"],
    "The check comes BEFORE print, so the loop breaks before banana is printed."],
  [code("What is the output?", `fruits = ["apple", "banana", "cherry"]
for x in fruits:
    print(x)
    if x == "banana":
        break`),
    ["`apple\nbanana`", "`apple`", "`apple\nbanana\ncherry`", "`banana`"],
    "print runs first, so banana is printed, then the loop breaks."],
  [code("What is the output?", `fruits = ["apple", "banana", "cherry"]
for x in fruits:
    if x == "banana":
        continue
    print(x)`),
    ["`apple\ncherry`", "`apple`", "`apple\nbanana\ncherry`", "`cherry`"],
    "continue skips print for banana only."],
  [code("What is the output?", `fruits = ["apple", "banana", "cherry"]
for x in fruits:
    print(x)
    if x == "banana":
        continue`),
    ["`apple\nbanana\ncherry`", "`apple\ncherry`", "`apple\nbanana`", "`apple`"],
    "continue is the LAST statement, so it changes nothing; all three are printed."],
  [code("What is the output?", `count = 0
for ch in "banana":
    if ch == "a":
        count += 1
print(count)`),
    ["`3`", "`2`", "`1`", "`6`"],
    "A for loop goes through a string one character at a time; \"banana\" has three a's."],
  [code("What is the output?", `for x in range(1, 3):
    for y in range(1, 4):
        print(x, end='')
    print()`),
    ["`111\n222`", "`123\n123`", "`12\n12\n12`", "`11\n22\n33`"],
    "The inner loop prints the OUTER variable x three times per line."],
  [code("What is the output?", `for x in range(1, 4):
    for y in range(1, x + 1):
        print(y, end='')
    print()`),
    ["`1\n12\n123`", "`123\n123\n123`", "`1\n22\n333`", "`123\n12\n1`"],
    "The inner range grows with x, which builds the triangle from the lesson."],
  [code("What is the output?", `for x in range(5, 2):
    print(x)
print("end")`),
    ["`end`", "`5\n4\n3\nend`", "`5\nend`", "An error"],
    "With the default step of +1, range(5, 2) is empty, so the loop body never runs."],
  [code("What is the output?", `for x in range(5, 0, -2):
    print(x, end=' ')`),
    ["`5 3 1`", "`5 4 3 2 1`", "`5 3 1 -1`", "`0 2 4`"],
    "A negative step counts down: 5, 3, 1 (0 isn't reached)."],
  [code("The lesson's largest/smallest program. What is printed for the inputs 1, 2, 3?", `nums = [1, 2, 3]
largest = 0
smallest = 999
for number in nums:
    if number > largest:
        largest = number
    elif number < smallest:
        smallest = number
print(largest, smallest)`),
    ["`3 999`", "`3 1`", "`1 3`", "`0 999`"],
    "Each number is bigger than the current largest, so `elif` never runs and smallest stays 999. Two separate `if` statements would fix it."],
  [code("What is the output?", `thislist = ["apple", "banana", "cherry", "orange", "kiwi", "melon", "mango"]
print(thislist[-4:-1])`),
    ["`['orange', 'kiwi', 'melon']`", "`['orange', 'kiwi', 'melon', 'mango']`", "`['kiwi', 'melon', 'mango']`", "`['cherry', 'orange', 'kiwi']`"],
    "-4 is orange; the slice stops BEFORE -1 (mango)."],
  [code("What is the output?", `thislist = ["apple", "banana", "cherry"]
thislist[1:3] = ["watermelon"]
print(thislist)`),
    ["`['apple', 'watermelon']`", "`['apple', 'watermelon', 'cherry']`", "`['apple', 'watermelon', 'watermelon']`", "An error"],
    "Two items (indexes 1 and 2) are replaced by one, so the list shrinks."],
  [code("What is the output?", `thislist = ["apple", "banana", "cherry"]
thislist[1:2] = ["strawberry", "watermelon"]
print(thislist)`),
    ["`['apple', 'strawberry', 'watermelon', 'cherry']`", "`['apple', 'strawberry', 'cherry']`", "`['apple', ['strawberry', 'watermelon'], 'cherry']`", "An error"],
    "One item is replaced by two, so the list grows."],
  [code("What is the output?", `a = [1, 2]
a.append([3, 4])
print(len(a))`),
    ["`3`", "`4`", "`2`", "An error"],
    "append() adds the whole list as ONE item: [1, 2, [3, 4]]."],
  [code("What is the output?", `a = [1, 2]
a.extend([3, 4])
print(len(a))`),
    ["`4`", "`3`", "`2`", "An error"],
    "extend() adds each element: [1, 2, 3, 4]."],
  [code("What is the output?", `a = [1, 2, 1, 3]
a.remove(1)
print(a)`),
    ["`[2, 1, 3]`", "`[2, 3]`", "`[1, 2, 3]`", "`[1, 1, 3]`"],
    "remove() deletes only the FIRST matching value."],
  [code("What is the output?", `a = [1, 2, 3]
b = a
b.append(4)
print(a)`),
    ["`[1, 2, 3, 4]`", "`[1, 2, 3]`", "`[4]`", "An error"],
    "`b = a` doesn't copy; both names point to the same list."],
  [code("What is the output?", `a = [1, 2, 3]
b = a.copy()
b.append(4)
print(a)`),
    ["`[1, 2, 3]`", "`[1, 2, 3, 4]`", "`[4]`", "An error"],
    "copy() makes a separate list, so a is unchanged."],
  [code("What is the output?", `thislist = ["banana", "Orange", "Kiwi", "cherry"]
thislist.sort()
print(thislist)`),
    ["`['Kiwi', 'Orange', 'banana', 'cherry']`", "`['banana', 'cherry', 'Kiwi', 'Orange']`", "`['banana', 'cherry', 'kiwi', 'orange']`", "`['cherry', 'Kiwi', 'Orange', 'banana']`"],
    "Sorting is case sensitive: uppercase letters sort before lowercase."],
  [code("What is the output?", `thislist = ["banana", "Orange", "Kiwi", "cherry"]
thislist.reverse()
print(thislist)`),
    ["`['cherry', 'Kiwi', 'Orange', 'banana']`", "`['Orange', 'Kiwi', 'cherry', 'banana']`", "`['banana', 'cherry', 'Kiwi', 'Orange']`", "`['ananab', 'egnarO', 'iwiK', 'yrrehc']`"],
    "reverse() flips the current order. It does not sort."],
  [code("What is the output?", `fruits = ["apple", "banana", "cherry", "kiwi", "mango"]
newlist = [x for x in fruits if "a" in x]
print(newlist)`),
    ["`['apple', 'banana', 'mango']`", "`['apple', 'banana']`", "`['apple', 'banana', 'cherry', 'mango']`", "`['a', 'a', 'a']`"],
    "Only items containing the letter \"a\" are kept."],
  [code("What is the output?", `fruits = ["apple", "banana", "cherry"]
newlist = [x if x != "banana" else "orange" for x in fruits]
print(newlist)`),
    ["`['apple', 'orange', 'cherry']`", "`['apple', 'cherry']`", "`['orange']`", "`['apple', 'banana', 'cherry', 'orange']`"],
    "The condition in the EXPRESSION replaces banana; it doesn't filter."],
  [code("What is the output?", `print([x * x for x in range(4)])`),
    ["`[0, 1, 4, 9]`", "`[1, 4, 9, 16]`", "`[0, 2, 4, 6]`", "`[0, 1, 2, 3]`"],
    "range(4) is 0–3, and each is squared."],
  [code("What happens?", `t = ("apple", "banana", "cherry")
t[1] = "kiwi"`),
    ["An error (TypeError) — tuples are unchangeable", "t becomes ('apple', 'kiwi', 'cherry')", "kiwi is added to the end", "Nothing happens"],
    "Tuples don't support item assignment."],
  [code("What is the output?", `fruits = ("apple", "mango", "papaya", "pineapple", "cherry")
(green, *tropic, red) = fruits
print(tropic)`),
    ["`['mango', 'papaya', 'pineapple']`", "`('mango', 'papaya', 'pineapple')`", "`mango`", "`['papaya', 'pineapple', 'cherry']`"],
    "The starred variable takes the middle values AS A LIST, leaving cherry for red."],
  [code("What happens?", `fruits = ("apple", "banana", "cherry")
(a, b) = fruits`),
    ["An error (ValueError) — too many values to unpack", "a = 'apple', b = 'banana'", "a = 'apple', b = ['banana', 'cherry']", "a and b both equal 'apple'"],
    "Without a `*`, the number of variables must match the number of values."],
  [code("What is the output?", `thistuple = ("apple", "banana")
y = ("orange",)
thistuple += y
print(thistuple)`),
    ["`('apple', 'banana', 'orange')`", "An error — tuples are unchangeable", "`('apple', 'banana', ('orange',))`", "`['apple', 'banana', 'orange']`"],
    "`+=` builds a NEW tuple and reassigns the name, which is allowed."],
  [code("What is the output?", `s = {"apple", "banana", "apple"}
print(len(s))`),
    ["`2`", "`3`", "`1`", "An error"],
    "Sets drop duplicates."],
  [code("What is the output?", `s = {"abc", 34, True, 40, 1}
print(len(s))`),
    ["`4`", "`5`", "`3`", "An error"],
    "True and 1 are considered equal in a set, so one is dropped."],
  [code("What happens?", `thisset = {"apple", "banana", "cherry"}
print(thisset[0])`),
    ["An error (TypeError) — sets can't be accessed by index", "`apple`", "`banana`", "`None`"],
    "Sets are unindexed. Loop through them or use `in` instead."],
  [code("What is the output?", `s = {"apple", "banana"}
s.discard("kiwi")
print(len(s))`),
    ["`2`", "An error (KeyError)", "`1`", "`3`"],
    "discard() quietly ignores a missing item. remove() would raise KeyError."],
  [code("What is the output?", `set1 = {1, 2, 3}
set2 = {3, 4}
set3 = set1.union(set2)
print(len(set1), len(set3))`),
    ["`3 4`", "`4 4`", "`3 5`", "`5 5`"],
    "union() returns a new set and doesn't change set1. The duplicate 3 is dropped."],
  [code("What is the output?", `x = {}
print(type(x))`),
    ["`<class 'dict'>`", "`<class 'set'>`", "`<class 'list'>`", "`<class 'tuple'>`"],
    "Empty curly braces create an empty DICTIONARY. Use set() for an empty set."],
  [code("What is the output?", `d = {"year": 1964, "year": 2020}
print(d["year"], len(d))`),
    ["`2020 1`", "`1964 2`", "`1964 1`", "An error"],
    "Dictionaries don't allow duplicate keys; the last value wins."],
  [code("What is the output?", `thisdict = {"brand": "Ford", "model": "Mustang"}
print("Ford" in thisdict)`),
    ["`False`", "`True`", "`brand`", "An error"],
    "`in` checks the KEYS of a dictionary, not the values."],
  [code("What is the output?", `car = {"brand": "Ford", "model": "Mustang"}
x = car.keys()
car["color"] = "white"
print(len(x))`),
    ["`3`", "`2`", "`1`", "An error"],
    "keys() is a live view, so it shows the new key too."],
  [code("What is the output?", `dict1 = {"a": 1}
dict2 = dict1
dict2["b"] = 2
print(dict1)`),
    ["`{'a': 1, 'b': 2}`", "`{'a': 1}`", "`{'b': 2}`", "An error"],
    "`dict2 = dict1` is not a copy, so changes affect both names."],
  [code("What is the output?", `thisdict = {"brand": "Ford", "model": "Mustang", "year": 1964}
thisdict.popitem()
print(thisdict)`),
    ["`{'brand': 'Ford', 'model': 'Mustang'}`", "`{'model': 'Mustang', 'year': 1964}`", "`{'brand': 'Ford', 'year': 1964}`", "`{}`"],
    "popitem() removes the last inserted item, year."],
  [code("What is the output?", `EmpInfo = [{'name': 'Bob', 'job': 'Mgr'},
           {'name': 'Kim', 'job': 'Dev'},
           {'name': 'Sam', 'job': 'Dev'}]
print(EmpInfo[1]['name'])`),
    ["`Kim`", "`Bob`", "`Dev`", "An error"],
    "EmpInfo[1] is the second dictionary; ['name'] reads its name."],
  [code("What is the output?", `a = [1, 2, 3]
b = ['x', 'y']
print(len(list(zip(a, b))))`),
    ["`2`", "`3`", "`5`", "An error"],
    "zip() stops at the shortest list."],
  [code("What is the output?", `name = ['Mark', 'Cassandra', 'James']
age = [20, 13, 3]
for x, y in zip(name, age):
    if y > 10:
        print(x)`),
    ["`Mark\nCassandra`", "`Mark`", "`Mark\nCassandra\nJames`", "`James`"],
    "zip() pairs the names with ages; only James (3) is filtered out."],
];

export const loopsAndCollectionsQuestions = [
  ...build("py2b3b", "easy", easy),
  ...build("py2b3b", "hard", hard),
  ...build("py2b3b", "tricky", tricky),
];
