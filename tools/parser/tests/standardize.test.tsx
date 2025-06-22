import { render } from "@testing-library/react";
import path from "path";
import { expect, test } from "vitest";
import { standardizeComponent } from "../src/index.js";
import { readFixture, writeFile } from "./_utils.js";

function writeFileStd(modulePath: string, content: string): void {
  const suffix = [
    `function __elll_configure_component(...args: any) {`,
    `  console.log("__elll_configure_component", ...args);`,
    `}`,
  ].join("\n");
  writeFile(modulePath, content + "\n" + suffix);
}

test("renders a static HelloWorld component", async () => {
  const code = readFixture("hello_world.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/hello_world/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component />);
  expect(dom.getByText("hello world")).toBeDefined();
});

test("handles destructured props in function signature", async () => {
  const code = readFixture("destructured_props.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/destructured_props/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  // Give the file system a moment to register the new file
  const Component = (await import(modulePath)).default;
  const dom = render(<Component message="Hello, Vitest!" />);
  expect(dom.getByText("Hello, Vitest!")).toBeDefined();
});

// 3. Component with a single identifier `props` in signature
test("handles `props` identifier and renames to `props` if necessary", async () => {
  const code = readFixture("props_identifier.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/props_identifier/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component message="Hello from props!" />);
  expect(dom.getByText("Hello from props!")).toBeDefined();

  // Verify the component uses the standardized props object
  expect(std).toContain("function Component(props)");
});

// 4. Component with object‐binding pattern for props that must be normalized
test("normalizes object binding pattern for props to `props` object", async () => {
  const code = readFixture("object_binding_props.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/object_binding_props/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component message="Hello" count={5} />);
  expect(dom.getByText("Hello - Count: 5")).toBeDefined();

  // Verify the props are standardized
  expect(std).toContain("function Component(props)");
  expect(std).toContain("props.message");
  expect(std).toContain("props.count");
});

// 5. Component with legacy `ref` as second parameter (identifier)
test("handles legacy ref as identifier parameter and rewrites to `props.ref`", async () => {
  const code = readFixture("legacy_ref_identifier.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/legacy_ref_identifier/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const ref = { current: null };
  render(<Component ref={ref} />);

  // Verify ref is standardized
  expect(std).toContain("function Component(props)");
  expect(std).not.toContain("function Component(props, ref)");
  expect(std).toContain("props.ref");
});

// 6. Component with legacy `ref` as object destructuring parameter
test("handles legacy ref as object destructuring parameter and rewrites to `props.ref`", async () => {
  const code = readFixture("legacy_ref_destructuring.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/legacy_ref_destructuring/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const ref = { current: null };
  render(<Component ref={ref} />);

  // Verify ref is standardized
  expect(std).toContain("function Component(props)");
  expect(std).not.toContain("function Component({ref})");
  expect(std).toContain("props.ref");
});

// 7. Component with more than two parameters should throw an error
test("throws if component function has more than two parameters", async () => {
  const code = readFixture("too_many_params.tsx");

  // Should throw an error when standardizing
  expect(() => standardizeComponent(code)).toThrow(
    "Component Function have more than two parameters"
  );
});

// 8. Memoized component with only one argument (no compareProps)
test("handles `memo(Component)` without compareProps", async () => {
  const code = readFixture("memo_without_compare.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/memo_without_compare/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component message="Memoized Component" />);
  expect(dom.getByText("Memoized Component")).toBeDefined();

  // Verify memo handling
  expect(std).toContain("__elll_configure_component('memoized')");
  expect(std).not.toContain("memo(");
});

// 9. Memoized component with two arguments (with compareProps)
test("handles `memo(Component, compareProps)` and injects `__elll_configure_component`", async () => {
  const code = readFixture("memo_with_compare.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/memo_with_compare/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component message="Memoized with Compare" />);
  expect(dom.getByText("Memoized with Compare")).toBeDefined();

  // Verify memo with compareProps handling
  expect(std).toContain("__elll_configure_component('memoized')");
  expect(std).toContain("__elll_configure_component('compareProps'");
  expect(std).not.toContain("memo(");
});

// 10. Memoized component with wrong argument count should throw
test("throws if `memo` call has wrong number of arguments", async () => {
  const code = readFixture("memo_wrong_args.tsx");

  // Should throw an error when standardizing
  expect(() => standardizeComponent(code)).toThrow();
});

// 11. forwardRef component with exactly one argument
test("handles `forwardRef(Component)` and unwraps correctly", async () => {
  const code = readFixture("forward_ref.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/forward_ref/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const ref = { current: null };
  render(<Component ref={ref} message="Forwarded Ref" />);
  expect(ref.current).not.toBeNull();

  // Verify forwardRef handling
  expect(std).not.toContain("forwardRef(");
});

// 12. forwardRef component with wrong argument count should throw
test("throws if `forwardRef` call has wrong number of arguments", async () => {
  const code = readFixture("forward_ref_wrong_args.tsx");

  // Should throw an error when standardizing
  expect(() => standardizeComponent(code)).toThrow();
});

// 13. Component using only expression body (no block) should be wrapped into a block
test("converts expression‐body component to block with `return`", async () => {
  const code = readFixture("expression_body.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/expression_body/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component message="Expression Body" />);
  expect(dom.getByText("Expression Body")).toBeDefined();

  // Verify expression body is converted to block
  expect(std).toContain("return");
  expect(std).toContain("{");
  expect(std).toContain("}");
});

// 14. Component with a single hook (useState) at top level should not extract it
test("leaves top‐level `useState` call intact", async () => {
  const code = readFixture("single_hook.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/single_hook/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  render(<Component />);

  // Verify useState is properly handled
  expect(std).toContain("useState(0)");
  // It should not extract the hook into a separate function
  expect(std.match(/function useState\d+/g)).toBeNull();
});

// 15. Component with multiple hooks in sequence should preserve their order
test("preserves order of multiple top‐level hook calls", async () => {
  const code = readFixture("multiple_hooks.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/multiple_hooks/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component />);
  expect(dom.getByText("Count: 1")).toBeDefined(); // useEffect runs and increments
});

// 16. Component with nested `if` containing a `return` should extract the later statements properly
test("extracts statements after nested `if-return` into helper, preserving early return", async () => {
  const code = readFixture("nested_if_return.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/nested_if_return/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;

  // Test with showLoading=false to show content
  const dom = render(<Component showLoading={false} />);
  expect(dom.getByText("Content loaded")).toBeDefined();

  // Verify helper function extraction
  expect(std).toContain("function useState");
});

// 17. Component with `return` inside a `for` loop should extract properly
test("extracts statements after loop‐bound return, preserving loop return", async () => {
  const code = readFixture("loop_return.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/loop_return/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;

  // Test with items that won't trigger the early return
  const dom = render(<Component items={[1, 2, 3]} target={5} />);
  expect(dom.getByText("Item not found")).toBeDefined();

  // Verify helper function extraction
  expect(std).toContain("function useState");
});

// 18. Component with a nested arrow function containing `return` must NOT treat that inner `return` as early return
test("ignores `return` inside nested arrow function when extracting state", async () => {
  const code = readFixture("nested_arrow_return.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/nested_arrow_return/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component />);
  expect(dom.getByText("Counter: 0")).toBeDefined();

  // Verify nested arrow function return is ignored
  expect(std).toContain("return item * 2");
});

// 19. Component with a nested function declaration containing `return` must NOT treat it as early return
test("ignores `return` inside nested function declaration when extracting state", async () => {
  const code = readFixture("nested_function_return.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/nested_function_return/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component />);
  expect(dom.getByText("Component with nested function")).toBeDefined();

  // Verify nested function declaration return is ignored
  expect(std).toContain("function double(x)");
  expect(std).toContain("return x * 2;");
});

// 20. Component with a nested class containing `return` in method must NOT treat it as early return
test("ignores `return` inside nested class method when extracting state", async () => {
  const code = readFixture("nested_class_return.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/nested_class_return/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component />);
  expect(dom.getByText("Class Calculator Result: 10")).toBeDefined();

  // Verify nested class method return is ignored
  expect(std).toContain("class Calculator");
  expect(std).toContain("return this.value * 2;");
});

// 21. Component with nested enum declaration and inner returns must skip enum
test("ignores `return` inside nested enum initializers", async () => {
  const code = readFixture("nested_enum_return.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/nested_enum_return/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component />);
  expect(dom.getByText("Direction: UP")).toBeDefined();

  // Verify enum with initializers containing return expressions is preserved
  expect(std).toContain("enum Direction");
});

// 22. Component with JSX fragments (`<> … </>`) should extract each fragment into a helper function
test("extracts top‐level JSX fragment into `__elll_fragment_X` function and replaces usage", async () => {
  const code = readFixture("jsx_fragment.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/jsx_fragment/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  // Give the file system a moment to register the new file
  const Component = (await import(modulePath)).default;
  const dom = render(<Component />);
  expect(dom.getByText("Fragment Title")).toBeDefined();
  expect(dom.getByText("This is a paragraph inside a fragment")).toBeDefined();
  // Verify the standardized code has a fragment function
  expect(std).toContain("__elll_fragment_");
});

// 23. Component with nested JSX fragments should recursively extract all fragments
test("recursively extracts nested JSX fragments into separate functions", async () => {
  const code = readFixture("nested_fragments.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/nested_fragments/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component />);
  expect(dom.getByText("Main Title")).toBeDefined();
  expect(dom.getByText("Nested Fragment")).toBeDefined();
  expect(dom.getByText("This is in a nested fragment")).toBeDefined();
  expect(dom.getByText("Footer content")).toBeDefined();

  // Count the number of fragment functions
  const fragmentFnCount = (std.match(/__elll_fragment_\d+/g) || []).length;
  // Should have at least 3 fragments (main and 2 nested)
  expect(fragmentFnCount).toBeGreaterThanOrEqual(3);
});

// 24. Component returning a call to `__elll_fragment_X` should treat that as a fragment return and NOT extract further
test("detects `return __elll_fragment_X()` as a fragment return and stops extraction", async () => {
  const code = readFixture("fragment_return.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/fragment_return/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component />);
  expect(dom.getByText("Fragment Title")).toBeDefined();
  expect(
    dom.getByText("This is a paragraph inside a fragment function")
  ).toBeDefined();

  // Verify the structure is preserved and not further extracted
  expect(std).toContain("return __elll_fragment_1()");
});

// 25. Component returning a hook call (`useSomething()`) should treat that as a state return and NOT extract further
test("detects `return useSomething()` as a state return and stops extraction", async () => {
  const code = readFixture("hook_return.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/hook_return/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component />);
  expect(dom.getByText("Direct hook return")).toBeDefined();

  // Verify the structure preserves the hook return
  expect(std).toContain("return useState");
});

// 26. Component with mixed fragments and hooks: ensure isStateDeclarationOrCall filters only hooks
test("does not treat fragment functions as hooks when scanning for state declarations", async () => {
  const code = readFixture("mixed_fragments_hooks.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/mixed_fragments_hooks/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component />);
  expect(dom.getByText("Count: 1")).toBeDefined(); // Count is 1 because useEffect runs
  expect(dom.getByText("Increment")).toBeDefined();

  // Verify both hook calls and fragment functions exist
  expect(std).toContain("useState");
  expect(std).toContain("useEffect");
  expect(std).toContain("__elll_fragment_");
});

// 27. Component with self‐closing JSX elements should extract them correctly as fragments if nested
test("extracts nested self‐closing JSX elements into fragment helpers", async () => {
  const code = readFixture("self_closing_jsx.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/self_closing_jsx/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component />);
  expect(dom.getByText("Component with self-closing elements")).toBeDefined();
  expect(dom.getByAltText("An image")).toBeDefined();
  expect(dom.getByPlaceholderText("Enter text")).toBeDefined();

  // Check for self-closing tags in fragments
  expect(std).toContain("<img");
  expect(std).toContain("<input");
  expect(std).toContain("<br");
});

// 28. Component with no return (i.e. always returns JSX in arrow) should still extract fragments and state properly
test("handles component with implicit return in arrow without early returns", async () => {
  const code = readFixture("implicit_return.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/implicit_return/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component />);
  expect(dom.getByText("Implicit Return Component")).toBeDefined();
  expect(
    dom.getByText("This component uses an arrow function with implicit return")
  ).toBeDefined();

  // Verify the arrow function was converted to use a block body with return
  expect(std).toContain("return");
  expect(std).toContain("__elll_fragment_");
});

// 29. Component that throws inside body (not for standardization) should still wrap and rethrow
test("preserves thrown errors in component body after standardization", async () => {
  const code = readFixture("throwing_component.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/throwing_component/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);

  let error: Error | null = null;
  try {
    const Component = (await import(modulePath)).default;
    render(<Component />);
  } catch (e) {
    error = e as Error;
  }

  expect(error).not.toBeNull();
  expect(error?.message).toContain("This component always throws");
});

// 30. Component using array destructuring in variable statement should be renamed correctly if batched
test("renames array‐destructured variable when batched into helper", async () => {
  const code = readFixture("array_destructuring.tsx");
  const std = standardizeComponent(code);
  const modulePath = path.resolve(
    `local/standardized/array_destructuring/${Date.now()}.tsx`
  );
  writeFileStd(modulePath, std);
  const Component = (await import(modulePath)).default;
  const dom = render(<Component />);

  // Should show "one" since the condition passes
  expect(dom.getByText("one")).toBeDefined();

  // Check that array destructuring is properly handled in standardized code
  expect(std).toContain("[first, second, third]");
});
