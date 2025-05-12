# 🦩 Elll Model Class Style Guide

This guide defines the canonical structure and coding conventions for model classes in the Elll codebase. Following this structure ensures clarity, consistency, and seamless integration with AI-generated code.

---

## ✅ Property & Method Order

All model class members must follow this strict order:

1. **🔒 Static Properties**
   Constants and schema definitions shared across all instances.

   ```ts
   static readonly typeId = "component";
   ```

2. **🔐 Readonly Properties**
   Immutable after construction. Used for injected dependencies.

   ```ts
   readonly workspace: WorkspaceModel;
   readonly id: string;
   ```

3. **🪥 Private Properties**
   Internal reactive state and references, not exposed publicly. Prefix with `_`.

   ```ts
   private _state: RecordState<ComponentData>;
   private _children: AggregatedModelRecord<ChildModel>;
   ```

4. **🔍 Getters**
   Computed fields. Must be pure and side-effect free.

   ```ts
   get name(): string {
     return this._state.record.name;
   }
   ```

5. **📡 `data` and `data$` Getters**
   Structured access to current and reactive state.

   ```ts
   get data(): ComponentData {
     return { ...this._state.record, children: this._children.data };
   }

   get data$(): Observable<ComponentData> {
     return combineLatestMerged([
       this._state.record$,
       forkJoin({ children: this._children.data$ }),
     ]);
   }
   ```

6. **🏧 Constructor**
   Accepts dependencies and initializes state.

   ```ts
   constructor(props: { id: string; workspace: WorkspaceModel }) {
     super();
     this.id = props.id;
     this.workspace = props.workspace;
     this._state = createRecordState<ComponentData>();
   }
   ```

7. **🧰 Methods**
   Public APIs and internal logic.

   ```ts
   setName(name: string) {
     this._state.patch({ name });
   }
   ```

8. **♻️ `restore()` Method**
   Used to hydrate model state from plain data.

   ```ts
   restore(data: ComponentData) {
     this._state.restore(data);
     this._children.restore(data.children ?? []);
   }
   ```

---

## ✨ Naming Conventions

- **Class names:** `PascalCase`
- **Fields:** `camelCase`
- **Private fields:** Prefix with `_`
- **Observables:** Suffix with `$` (e.g., `name$`, `data$`)
- **Immutability:** Use `readonly` wherever possible

---

## ⚠️ Notes

- Avoid accessing `.state` directly outside the class.
- Prefer small, composable methods over large blocks of logic.
- Use `combineLatestMerged` for merging multiple reactive sources.
- Ensure AI-generated classes follow this exact structure.

---

> Designed for harmony between human elegance and AI precision. 🧠💛
