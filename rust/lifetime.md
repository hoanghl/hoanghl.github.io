<center> <h1>Lifetime in Rust</h1> </center>

Note: This discussion is within the context of safe Rust. It only focuses on reference, not pointer.

Outline

1. Starting with the problem of function’s returning references

Impossible > Returned value must be either:

- From arguments
- Globally available

2. Purpose of lifetime

- avoid Dangling pointer

3. Impacts of lifetime:

- not affect the internal code of the function but instead constraint on 2 things:
    - The variable passed as arguments to the function
    - The returned value of the function

not affect the internal code: It doesn’t change how long any of reference live but describe the relationship of lifetimes of multiple references to each other.

Lifetime is similar to the typing of argument and returned value in the extent that they both specify the constrains that must be satisfied as calling the function. As calling a function, the caller must ensure that the variables as the argument follow the type specified in the function prototype. In turn, as calling the function and receiving the returned reference, the caller will know that the returned reference either lives as long as at least one of the arguments or is the static reference.

Corollary impact: facility the compiler (i.e. the Borrow checker) as checking the reference problem. Since the function has already constrained on the relationship of the reference, the problem, if exists, must derive from the other things outside the function such as the variables passing as arguments.

Example of compiler’s being aware of the internal code of the function:

```rust
// ================================================
// Permitted
// ================================================

fn longest_permitted_2<'a, 'b, 'c>() -> &'c str {
    if 1 > 2 {
        "bad"
    } else {
        "good"
    }
}

// ================================================
// Forbidden
// ================================================

fn longest_forbidden_5<'a, 'b, 'c>(x: &'a str, y: &'b str) -> &'c str {
    y
}
```

Borrow Checker examines the internal code to check the validity of the lifetime constraint. In the above snipper, since the returned value inside the function body are static references (i.e. a reference to a static value - which outlives than even the `main` function) and the lifetime of the returned reference is explicitly specified in the function prototype, Borrow Checker allows this snippet. OTOH, in the body of the below function, the returned value is one of the argument and Borrow Checker sees that the lifetime constraint of this argument doesn’t align with the lifetime constraint of the returned reference, Checker then throws an error.