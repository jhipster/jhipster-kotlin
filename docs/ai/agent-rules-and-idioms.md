# AI Agent Context, Sub-Generators, and Kotlin Idioms

[Documentation home](../../README.md#documentation) | [Generation guide](../generation.md)

When collaborating with AI coding agents (such as **Cursor**, **Windsurf**, **Claude Code**, or **GitHub Copilot**) on a KHipster project, models often default to generic Java Spring Boot patterns, create boilerplate from scratch that breaks generator metadata, and produce un-idiomatic "Java-flavored Kotlin."

This guide explains how to establish **strict agent context**, direct agents to **leverage sub-generators**, and **enforce idiomatic Kotlin** in automated reviews.

---

## 1. Set Strict Agent Context

Because AI models are trained predominantly on standard Java Spring Boot codebases, they default to Java syntax, Lombok annotations, and imperative idioms unless explicitly constrained.

Establish strict boundaries in your repository root using [`.cursorrules`](../../.cursorrules) (for Cursor) or [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md) (for Copilot and Windsurf):

### The Three Golden Rules

```text
1. "This is a KHipster project (Kotlin + Spring Boot)."
2. "Use concise Kotlin idioms (e.g., data classes, scope functions, extension functions)."
3. "Never overwrite KHipster-generated Liquibase changelogs manually."
```

### Why Liquibase Guardrails Are Critical

AI coding agents often hallucinate schema changes by directly editing existing Liquibase XML changelogs or adding JPA annotations without migrations. This breaks Liquibase checksum hashes and corrupts database deployments. The agent rule forces schema updates to go through JDL or KHipster entity sub-generators.

---

## 2. Leverage Sub-Generators (CLI First, Custom Code Second)

Never ask an AI agent to create Spring services, REST controllers, or repositories from scratch.

### The Problem with Manual AI Scaffolding

When an agent writes a service or controller by hand, it routinely misses:

- Class-level and method-level transaction boundaries (`@Transactional(readOnly = true)`).
- Spring Security authority filters and method security annotations.
- MapStruct Kotlin DTO mappers and converters.
- Pagination response headers via `PaginationUtil`.
- Integration test suites (`*IT.kt`) configured with security contexts and test containers.
- `.jhipster/*.json` entity metadata, leading to conflicts on future generation runs.

### Modern Sub-Generator Toolchain

| Task                                   | Modern KHipster Command                                        | What It Scaffolds                                                                                                    |
| -------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **New Entity & Full Stack**            | `khipster entity <EntityName>`                                 | Complete Kotlin domain, repository, service, DTO, mapper, REST resource, Liquibase changelog, and integration tests. |
| **Declarative Service Generation**     | `service <Entity> with serviceClass` in JDL                    | Dedicated Kotlin service class (`*Service.kt`) with dependency injection and transaction boundaries.                 |
| **Service Interface & Implementation** | `service <Entity> with serviceImpl` in JDL                     | Service interface (`*Service.kt`) and implementation class (`*ServiceImpl.kt`).                                      |
| **Regenerate Configured Entities**     | `khipster entities`                                            | Refreshes all entity code based on `.jhipster/` definitions.                                                         |
| **Import Entire Schema**               | `khipster import-jdl <file> --skip-install --skip-git --force` | Non-interactive baseline generation for fast AI iterations.                                                          |

> [!NOTE]
> Older tutorials often reference standalone commands like `khipster spring-service` or `khipster spring-controller`. In modern JHipster 9+, services and controllers are scaffolded through entity definitions and JDL configuration (`service * with serviceClass`).

### Agent Prompt Pattern

> _"I need an invoice management module with invoice number, issue date, and line items.  
> **Do not write Kotlin classes manually.**  
> First, define this in `domain.jdl` with `service Invoice with serviceClass` and `dto Invoice with mapstruct`, and run `khipster import-jdl domain.jdl --skip-install --skip-git --force`.  
> Once the scaffold is generated, inspect `InvoiceService.kt` and implement the custom calculation logic inside it."_

---

## 3. Enforce Kotlin Idioms in Code Reviews

Large language models frequently generate **"Java-in-Kotlin"**—writing literal Java translations wrapped in Kotlin syntax. Use this checklist and automated review prompt to catch these patterns.

### Anti-Pattern Catalog

#### 1. Imperative Loops vs. Functional Collections

- **Anti-Pattern (Java Style)**:
    ```kotlin
    val activeNames = mutableListOf<String>()
    for (product in products) {
        if (product.active == true && product.name != null) {
            activeNames.add(product.name!!)
        }
    }
    ```
- **Idiomatic Kotlin**:
    ```kotlin
    val activeNames = products
        .filter { it.active == true }
        .mapNotNull { it.name }
    ```

#### 2. Manual Null Checks vs. Safe Calls & Elvis

- **Anti-Pattern (Java Style)**:
    ```kotlin
    val city: String
    if (user != null && user.address != null && user.address.city != null) {
        city = user.address.city
    } else {
        city = "Unknown"
    }
    ```
- **Idiomatic Kotlin**:
    ```kotlin
    val city = user?.address?.city ?: "Unknown"
    ```

#### 3. Scope Functions (`apply`, `also`, `let`, `takeIf`)

- **Anti-Pattern (Java Style)**:
    ```kotlin
    val entity = Book()
    entity.title = dto.title
    entity.isbn = dto.isbn
    val saved = bookRepository.save(entity)
    log.info("Saved book id {}", saved.id)
    return saved
    ```
- **Idiomatic Kotlin**:
    ```kotlin
    return bookRepository.save(
        Book().apply {
            title = dto.title
            isbn = dto.isbn
        }
    ).also { log.info("Saved book id {}", it.id) }
    ```

#### 4. Over-Engineered Mappers vs. Extension Functions

- **Anti-Pattern (Java Style)**:
    ```kotlin
    @Component
    class CustomOrderSummaryMapper {
        fun mapToSummary(order: CustomerOrder): OrderSummaryDTO {
            val dto = OrderSummaryDTO()
            dto.orderId = order.id
            dto.total = order.totalAmount
            return dto
        }
    }
    ```
- **Idiomatic Kotlin**:
    ```kotlin
    fun CustomerOrder.toSummaryDto() = OrderSummaryDTO(
        orderId = id,
        total = totalAmount
    )
    ```

---

## 4. Automated PR Review Prompt Template

Integrate this prompt into your CI review bots (GitHub Actions, Claude, Cursor, or Windsurf PR reviews) to review Kotlin diffs automatically:

```markdown
You are a Staff Kotlin & Spring Boot engineer conducting a strict pull request code review.
Review the provided Kotlin code diff specifically for Kotlin idioms and architectural simplicity.

Review Checklist:

1. Kotlin Standard Library Collections:

    - Flag any imperative `for` or `while` loops that can be expressed cleanly with `map`, `filter`, `mapNotNull`, `associateBy`, `groupBy`, or `flatMap`.
    - Prevent unnecessary `mutableListOf()` / `mutableMapOf()` when standard read-only collections suffice.

2. Null Safety:

    - Flag manual `if (x != null)` checks where safe call (`?.`), Elvis (`?:`), or `let` should be used.
    - Reject double-bang operators (`!!`) unless an absolute invariant is documented.

3. Scope Functions:

    - Suggest `apply` for object initialization.
    - Suggest `let` for executing blocks on non-null values.
    - Suggest `also` for side effects (e.g. logging) during return statements.
    - Suggest `takeIf` / `takeUnless` for conditional filtering.

4. Immutability:

    - Flag any `var` that is never reassigned; enforce `val`.
    - Prefer data classes with `copy()` over mutable setters.

5. Architecture & Anti-Bloat:
    - Flag over-engineered abstractions (e.g. single-use helper classes or boilerplate mappers where Kotlin extension functions or MapStruct interfaces are idiomatic).
    - Ensure KHipster generator conventions are respected (do not modify Liquibase changelogs manually).

Provide your feedback concisely, referencing specific line numbers with concrete before/after code snippets.
```

---

## Combining AI Reviews with Static Analysis

Automated AI review prompts work hand-in-hand with KHipster's built-in static analysis tools:

```sh
# Run ktlint to verify Kotlin formatting and style
./gradlew ktlintCheck

# Automatically format Kotlin files with ktlint
./gradlew ktlintFormat

# Run detekt static analysis for code smells and complexity
./gradlew detekt
```
