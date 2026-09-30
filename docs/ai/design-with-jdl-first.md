# Design with JDL First

[Documentation home](../../README.md#documentation) | [MCP Server Guide](mcp-server.md)

When building applications with AI coding agents (such as Cursor, Windsurf, Claude Code, or GitHub Copilot), **never let agents write raw Spring Boot and Kotlin boilerplate from scratch.**

Instead, prompt your AI agent to design and iterate on a **JHipster Domain Language (\`.jdl\`)** file. Once the schema is validated, run \`khipster import-jdl\` (or let your agent invoke it via the [KHipster MCP Server](mcp-server.md)) to generate the Kotlin baseline automatically.

---

## The Pitfall: Direct Boilerplate Generation

When asked to "create a blog system with posts and tags", an AI model typically attempts to write:

- JPA entities with Java/Lombok habits instead of idiomatic Kotlin data classes.
- Ad-hoc repositories, DTOs, and REST controllers with inconsistent validation and error handling.
- Handwritten SQL or Liquibase changelogs that break checksums or clash with future migrations.
- Missing configuration in \`.jhipster/\` metadata, preventing future CLI regeneration.

## The Solution: JDL as the AI Architecture Contract

JDL provides a high-level, human-readable domain modeling language.

```jdl
entity Post {
    title String required minlength(3)
    content TextBlob required
    publishedAt Instant
}

entity Tag {
    name String required unique
}

relationship ManyToMany {
    Post{tags(name)} to Tag{posts}
}

dto * with mapstruct
service * with serviceClass
paginate Post with pagination
```

### Why JDL First Works Best with AI:

1. **Compact Context**: A complete application schema fits into 30–50 lines of JDL. The model easily keeps it in its active attention window without truncation or hallucination.
2. **Instant Human Verification**: You can review relationships, constraints, and DTO settings at a glance, or preview them visually in [JDL Studio](https://start.jhipster.tech/jdl-studio/).
3. **Flawless Baseline**: KHipster generates:
    - Idiomatic Kotlin domain entities and repositories.
    - MapStruct Kotlin DTOs and mappers.
    - REST controllers with Swagger/OpenAPI documentation.
    - Tested Liquibase migrations with valid hashes.
    - Integration tests (\`*IT.kt\`).

---

## How to Work with AI Agents

### Method 1: Automated via MCP Server (Recommended)

Configure the [KHipster MCP Server](mcp-server.md) in Cursor, Claude Desktop, or Windsurf.

Your assistant will automatically:

1. Query the JDL reference (\`get_jdl_reference\`).
2. Draft and save your schema (\`write_jdl_file\`).
3. Execute generation non-interactively (\`import_jdl\`).

### Method 2: In-Editor Prompting

If not using MCP, add this instruction to your prompt or \`.cursorrules\`:

> _"Act as a KHipster domain model architect. Do NOT write any Kotlin or Java entity/controller files directly. Instead, design a JDL schema in \`domain.jdl\` with appropriate field types, relationships, \`dto * with mapstruct\`, and \`service * with serviceClass\`."_

Once the agent produces \`domain.jdl\`, execute:

```sh
khipster import-jdl domain.jdl --skip-install --skip-git --force
```
