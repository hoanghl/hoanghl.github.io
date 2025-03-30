
<center> <h1>Ownership, pointer and reference</h1> </center>

In Python, when you first assign a variable to a value such as

```python
x = 23
```

what happens under the hood is that Python creates a 4-byte-size area in the memory, assigns value 23 for it and binds the variable `x` for that memory. Later, when you do

```python
y = x
```

you are assigning another reference of the above 4-byte-size memory area for `y`. In other words, this 4-byte-size memory area has two references and we can use either of them to access the memory area.

In addition, Python has 4 immutable types (i.e. the types which cannot be modified) and they are `int`, `float`, `str` and `tuple`. For example, in the following snippet,

```python
y = 4
x = y
y += 5
x += 43
```

line 2 means that the memory area containing value 4 now has two references namely `x` and `y`. In line 3, `y` is bind to a new memory area and this area contains value 9. After this line, memory area holding value 4 is only referred by `x`. In line 4, `x` in turns is referred to new memory area containing value 47. After line 4, memory area holding value 4 isn’t referred by any reference, which is later freed by garbage collector. Check out https://nedbatchelder.com/text/names1.html for more.

In Rust, the assignment behaves mostly the same. Taking the following snippet for example.

```rust
let x = 3;
let y = x;

```

Owner: when you assign a variable to a specific value, that variable is the owner of that value and that value can only have one owner at a time

Move: when you transfer the ownership of the resource to a specific variable, it’s called move. There are 2 operations that change the ownership of the resource:

- first assignment of a variable to that resource
- passing resource as an argument to a function

If for some reason, the resource is taken its owner, it will be freed. In either of 2 above operations, there are scenarios which can lead to the memory’s being free. For variable assignment, if that variable is set to `mut` and later it is assigned to another resource, then the first resource will bee

TODO: What do `&` , `*`, reference, deference, `mut` , `&mut`mean and how to they relate?

`mut` is a Rust keyword indicating that the object can be modified. By default, every variable in Rust is immutable. `mut` is only applied onto a variable, a reference and a pointer. Examples for 3 cases are described below.

```rust
// Case 1: mut with variable
let mut a = String::from("Hellow");

//Case 2.1: mut with reference in variable declaration
let b = &mut a;
// Case 2.2: mut with reference in function prototype
fn modify(c: &mut String) {}

// Case 3: mut with raw pointer
// TODO: I will fill this later
```

At any given time, there is only one mutable reference corresponding to the resource. For example, the following snippet raises error.

```rust
struct Person {height: Option<f32>, age: Option<i32>};
let mut s = Person {height: None, age: None};
let b = &mut s;
let c = &mut s;
s.height = Some(1233.2);
b.age = Some(432423);
```

Denote the memory area holding the value of struct `Person` as **A** and variable `s` is having the ownership onto this memory area. After line 3, this ownership is borrowed by variable `b` and since then, only `b` has the right to modify A, even `s` which is holding the ownership isn’t allowed for modification. Therefore, line 4 and 5 will raise error.