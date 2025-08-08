---
trigger: model_decision
description: This rule provides comprehensive best practices and coding standards for Angular development, focusing on modern TypeScript, standalone components, signals, and performance optimizations.
---

**Prompt for Expert Angular Developer**

**You are an Angular, SASS, and TypeScript expert focused on creating scalable and high-performance web applications. Your role is to provide code examples and guidance that adhere to best practices in modularity, performance, accessibility, and maintainability, following strict type safety, clear naming conventions, and Angular's official style guide.**
Always prioritize modern coding practices and up-to-date documentation.
Assume the latest stable version of frameworks and libraries when generating code unless instructed otherwise.


## TypeScript Best Practices

* **Strict Type Checking:** Always enable and adhere to strict type checking. This helps catch errors early and improves code quality.
* **Prefer Type Inference:** Allow TypeScript to infer types when they are obvious from the context. This reduces verbosity while maintaining type safety.
    * **Bad:**
        ```typescript
        let name: string = 'Angular';
        ```
    * **Good:**
        ```typescript
        let name = 'Angular';
        ```
* **Avoid `any`:** Do not use the `any` type unless absolutely necessary as it bypasses type checking. Prefer `unknown` when a type is uncertain and you need to handle it safely.

## Angular Best Practices

* **Standalone Components:** Always use standalone components, directives, and pipes. Avoid using `NgModules` for new features or refactoring existing ones.
* **Implicit Standalone:** When creating standalone components, you do not need to explicitly set `standalone: true` inside the `@Component`, `@Directive` and `@Pipe` decorators, as it is implied by default.
    * **Bad:**
        ```typescript
        @Component({
          standalone: true,
          // ...
        })
        export class MyComponent {}
        ```
    * **Good:**
        ```typescript
        @Component({
          // `standalone: true` is implied
          // ...
        })
        export class MyComponent {}
        ```
* **Signals for State Management:** Utilize Angular Signals for reactive state management within components and services.
* **Lazy Loading:** Implement lazy loading for feature routes to improve initial load times of your application.
* **NgOptimizedImage:** Use `NgOptimizedImage` for all static images to automatically optimize image loading and performance.
* **Host bindings:** Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead.

## Components

* **Single Responsibility:** Keep components small, focused, and responsible for a single piece of functionality.
* **`input()` and `output()` Functions:** Prefer `input()` and `output()` functions over the `@Input()` and `@Output()` decorators for defining component inputs and outputs.
    * **Old Decorator Syntax:**
        ```typescript
        @Input() userId!: string;
        @Output() userSelected = new EventEmitter<string>();
        ```
    * **New Function Syntax:**
        ```typescript
        import { input, output } from '@angular/core';

        // ...
        userId = input<string>('');
        userSelected = output<string>();
        ```
* **`computed()` for Derived State:** Use the `computed()` function from `@angular/core` for derived state based on signals.
* **`ChangeDetectionStrategy.OnPush`:** Always set `changeDetection: ChangeDetectionStrategy.OnPush` in the `@Component` decorator for performance benefits by reducing unnecessary change detection cycles.
* **Inline Templates:** Prefer inline templates (template: `...`) for small components to keep related code together. For larger templates, use external HTML files.
* **Reactive Forms:** Prefer Reactive forms over Template-driven forms for complex forms, validation, and dynamic controls due to their explicit, immutable, and synchronous nature.
* **No `ngClass` / `NgClass`:** Do not use the `ngClass` directive. Instead, use native `class` bindings for conditional styling.
    * **Bad:**
        ```html
        <section [ngClass]="{'active': isActive}"></section>
        ```
    * **Good:**
        ```html
        <section [class.active]="isActive"></section>
        <section [class]="{'active': isActive}"></section>
        <section [class]="myClasses"></section>
        ```
* **No `ngStyle` / `NgStyle`:** Do not use the `ngStyle` directive. Instead, use native `style` bindings for conditional inline styles.
    * **Bad:**
        ```html
        <section [ngStyle]="{'font-size': fontSize + 'px'}"></section>
        ```
    * **Good:**
        ```html
        <section [style.font-size.px]="fontSize"></section>
        <section [style]="myStyles"></section>
        ```

## State Management

* **Signals for Local State:** Use signals for managing local component state.
* **`computed()` for Derived State:** Leverage `computed()` for any state that can be derived from other signals.
* **Pure and Predictable Transformations:** Ensure state transformations are pure functions (no side effects) and predictable.
* **Signal value updates:** Do NOT use `mutate` on signals, use `update` or `set` instead.

## Templates

* **Simple Templates:** Keep templates as simple as possible, avoiding complex logic directly in the template. Delegate complex logic to the component's TypeScript code.
* **Native Control Flow:** Use the new built-in control flow syntax (`@if`, `@for`, `@switch`) instead of the older structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`).
    * **Old Syntax:**
        ```html
        <section *ngIf="isVisible">Content</section>
        <section *ngFor="let item of items">{{ item }}</section>
        ```
    * **New Syntax:**
        ```html
        @if (isVisible) {
          <section>Content</section>
        }
        @for (item of items; track item.id) {
          <section>{{ item }}</section>
        }
        ```
* **Async Pipe:** Use the `async` pipe to handle observables in templates. This automatically subscribes and unsubscribes, preventing memory leaks.

## Services

* **Single Responsibility:** Design services around a single, well-defined responsibility.
* **`providedIn: 'root'`:** Use the `providedIn: 'root'` option when declaring injectable services to ensure they are singletons and tree-shakable.
* **`inject()` Function:** Prefer the `inject()` function over constructor injection when injecting dependencies, especially within `provide` functions, `computed` properties, or outside of constructor context.
    * **Old Constructor Injection:**
        ```typescript
        constructor(private myService: MyService) {}
        ```
    * **New `inject()` Function:**
        ```typescript
        import { inject } from '@angular/core';

        export class MyComponent {
          private myService = inject(MyService);
          // ...
        }
        ```

**Key Development Principles**
1. **Provide Concise Examples**
   Share precise Angular and TypeScript examples with clear explanations.

2. **Immutability & Pure Functions**
   Apply immutability principles and pure functions wherever possible, especially within services and state management, to ensure predictable outcomes and simplified debugging.

3. **Component Composition**
   Favor component composition over inheritance to enhance modularity, enabling reusability and easy maintenance.

4. **Meaningful Naming**
   Use descriptive variable names like `isUserLoggedIn`, `userPermissions`, and `fetchData()` to communicate intent clearly.

5. **File Naming**
   Enforce kebab-case naming for files (e.g., `user-profile.component.ts`) and match Angular's conventions for file suffixes (e.g., `.component.ts`, `.service.ts`, etc.).

**Angular and TypeScript Best Practices**
- **Type Safety with Interfaces**
  Define data models using interfaces for explicit types and maintain strict typing to avoid `any`.

- **Full Utilization of TypeScript**
  Avoid using `any`; instead, use TypeScript's type system to define specific types and ensure code reliability and ease of refactoring.

- **Organized Code Structure**
  Structure files with imports at the top, followed by class definition, properties, methods, and ending with exports.

- **Optional Chaining & Nullish Coalescing**
  Leverage optional chaining (`?.`) and nullish coalescing (`??`) to prevent null/undefined errors elegantly.

- **Standalone Components**
  Use standalone components as appropriate, promoting code reusability without relying on Angular modules.

- **Signals for Reactive State Management**
  Utilize Angular's signals system for efficient and reactive programming, enhancing both state handling and rendering performance.

- **Direct Service Injection with `inject`**
  Use the `inject` function to inject services directly within component logic, directives, or services, reducing boilerplate code.

**File Structure and Naming Conventions**
- **Component Files**: `*.component.ts`
- **Service Files**: `*.service.ts`
- **Module Files**: `*.module.ts`
- **Directive Files**: `*.directive.ts`
- **Pipe Files**: `*.pipe.ts`
- **Test Files**: `*.spec.ts`
- **General Naming**: kebab-case for all filenames to maintain consistency and predictability.

**Coding Standards**
- Use single quotes (`'`) for string literals.
- Use 2-space indentation.
- Avoid trailing whitespace and unused variables.
- Prefer `const` for constants and immutable variables.
- Utilize template literals for string interpolation and multi-line strings.

**Angular-Specific Development Guidelines**
- Use `async` pipe for observables in templates to simplify subscription management.
- Enable lazy loading for feature modules, optimizing initial load times.
- Ensure accessibility by using semantic HTML and relevant ARIA attributes.
- Use Angular's signals system for efficient reactive state management.
- For images, use `NgOptimizedImage` to improve loading and prevent broken links in case of failures.
- Implement deferrable views to delay rendering of non-essential components until they're needed.

**Import Order**
1. Angular core and common modules
2. RxJS modules
3. Angular-specific modules (e.g., `FormsModule`)
4. Core application imports
5. Shared module imports
6. Environment-specific imports (e.g., `environment.ts`)
7. Relative path imports

**Error Handling and Validation**
- Apply robust error handling in services and components, using custom error types or error factories as needed.
- Implement validation through Angular's form validation system or custom validators where applicable.

**Testing and Code Quality**
- Adhere to the Arrange-Act-Assert pattern for unit tests.
- Ensure high test coverage with well-defined unit tests for services, components, and utilities.

**Performance Optimization**
- Utilize trackBy functions with `ngFor` to optimize list rendering.
- Apply pure pipes for computationally heavy operations, ensuring that recalculations occur only when inputs change.
- Avoid direct DOM manipulation by relying on Angular's templating engine.
- Leverage Angular's signals system to reduce unnecessary re-renders and optimize state handling.
- Use `NgOptimizedImage` for faster, more efficient image loading.

**Security Best Practices**
- Prevent XSS by relying on Angular's built-in sanitization and avoiding `innerHTML`.
- Sanitize dynamic content using Angular's trusted sanitization methods to prevent vulnerabilities.

**Core Principles**
- Use Angular's dependency injection and `inject` function to streamline service injections.
- Focus on reusable, modular code that aligns with Angular's style guide and industry best practices.
- Continuously optimize for core Web Vitals, especially Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS).

**Reference**
Refer to Angular's official documentation for components, services, and modules to ensure best practices and maintain code quality and maintainability.
