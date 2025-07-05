# Elementa Engine Model Layer Testing Infrastructure

## Overview

This comprehensive testing infrastructure has been created to thoroughly test the model layer of the Elementa engine. It provides multiple test infrastructures that cover all aspects of the Elementa system, from simple components to complex applications with routing, state management, styling, and media handling.

## Test Infrastructure Structure

### 1. **Simple Infrastructure** (`tests/infrastructures/simple/`)
- Basic app with router and single component
- Demonstrates minimal Elementa project structure
- Tests fundamental model loading and relationships

### 2. **Complex Infrastructure** (`tests/infrastructures/complex/`)
- Multi-route application with various component types
- Features:
  - Home page with props, states, and dynamic content
  - About page with fragments and vector graphics
  - Contact page with form states and video media
  - Dashboard with route parameters and hook states
- Tests complex routing, component composition, and state management

### 3. **Styling Infrastructure** (`tests/infrastructures/styling/`)
- Components with inline stylesheets
- Demonstrates CSS-in-JS styling approach
- Tests styling integration with elements
- Features nested styled components

### 4. **Media Infrastructure** (`tests/infrastructures/media/`)
- Media gallery component with image and video elements
- Tests media element types and properties
- Demonstrates responsive media handling
- Features dynamic media selection and positioning

### 5. **State Management Infrastructure** (`tests/infrastructures/states/`)
- Comprehensive state management examples
- Features all state types:
  - **Value States**: Primitives, objects, and arrays
  - **Hook States**: Data fetching and dependencies
  - **Inline States**: Computed values and expressions
- Tests state reactivity and dependencies

### 6. **Mixed Infrastructure** (`tests/infrastructures/mixed/`)
- Combines multiple projects in single infrastructure
- Tests cross-project interactions
- Validates infrastructure isolation and file access

## Test Suites

### Core Test Files

1. **`simple.test.ts`** - Basic functionality verification
2. **`comprehensive.test.ts`** - Full infrastructure testing
3. **`router-component.test.ts`** - Router and component-specific tests
4. **`elements.test.ts`** - Element type and property validation

### Test Coverage

#### **Element Types Tested**
- ✅ Text elements (static and dynamic content)
- ✅ Container elements (nested structures)
- ✅ Media elements (images and videos)
- ✅ Vector elements (SVG content)
- ✅ Expression elements (dynamic evaluation)
- ✅ Fragment elements (reusable content)

#### **Component Features Tested**
- ✅ Props and prop types
- ✅ State management (all state types)
- ✅ Template composition
- ✅ Fragment definitions and usage
- ✅ Nested component structures

#### **Router Features Tested**
- ✅ Route definitions and paths
- ✅ Route parameters (`:userId`)
- ✅ Component-route associations
- ✅ Navigation structure

#### **State Management Tested**
- ✅ Value states with various data types
- ✅ Hook states for data fetching
- ✅ Inline states for computed values
- ✅ State dependencies and reactivity

#### **Infrastructure Features Tested**
- ✅ Project isolation
- ✅ File access and content retrieval
- ✅ Model adaptor functionality
- ✅ Cross-project interactions

## File Structure

```
tests/
├── infrastructure.ts                 # Base test infrastructure classes
├── infrastructures/
│   ├── simple/
│   │   ├── infrastructure.ts
│   │   └── simple/
│   │       ├── project.ts
│   │       └── files/
│   │           ├── app.ts
│   │           ├── router.ts
│   │           └── home.ts
│   ├── complex/
│   │   ├── infrastructure.ts
│   │   └── complex/
│   │       ├── project.ts
│   │       └── files/
│   │           ├── app.ts
│   │           ├── router.ts
│   │           ├── home.ts
│   │           ├── about.ts
│   │           ├── contact.ts
│   │           └── dashboard.ts
│   ├── styling/
│   │   ├── infrastructure.ts
│   │   └── styling/
│   │       ├── project.ts
│   │       └── files/
│   │           ├── app.ts
│   │           ├── router.ts
│   │           ├── styled-page.ts
│   │           └── stylesheet.ts
│   ├── media/
│   │   ├── infrastructure.ts
│   │   └── media/
│   │       ├── project.ts
│   │       └── files/
│   │           ├── app.ts
│   │           ├── router.ts
│   │           └── media-gallery.ts
│   ├── states/
│   │   ├── infrastructure.ts
│   │   └── states/
│   │       ├── project.ts
│   │       └── files/
│   │           ├── app.ts
│   │           ├── router.ts
│   │           └── state-examples.ts
│   └── mixed/
│       └── infrastructure.ts
└── models/
    ├── simple.test.ts
    ├── comprehensive.test.ts
    ├── router-component.test.ts
    └── elements.test.ts
```

## Schema Compliance

All test data is fully compliant with the Elementa base schemas:
- ✅ `AppData` schema validation
- ✅ `RouterData` schema validation  
- ✅ `ComponentData` schema validation
- ✅ `ElementData` schema validation (all types)
- ✅ `StateData` schema validation (all types)
- ✅ `StyleSheetData` schema validation

## Running Tests

```bash
cd packages/engine/tests
npm test
```

## Test Results

All **24 tests** pass successfully, covering:
- 4 test suites
- 6 infrastructure types
- 24 individual test cases
- Comprehensive model layer validation

## Extension Points

This infrastructure can be easily extended with:
1. **New Element Types** - Add test cases as new element types are introduced
2. **Additional State Types** - Extend state management tests for new state patterns
3. **Styling Features** - Add tests for new styling capabilities
4. **Project Types** - Create specialized project infrastructures
5. **Integration Tests** - Add tests for model-to-backend integration

## Benefits

1. **Comprehensive Coverage** - Tests all major Elementa features
2. **Realistic Data** - Uses production-like component structures
3. **Schema Validation** - Ensures data integrity across the system
4. **Regression Prevention** - Catches breaking changes early
5. **Documentation** - Serves as living examples of Elementa usage
6. **Development Support** - Provides reliable test data for development
