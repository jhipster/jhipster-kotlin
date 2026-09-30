# KHipster MCP Server (Model Context Protocol)

[Documentation home](../../README.md#documentation)

The KHipster MCP (Model Context Protocol) server enables AI coding agents (such as **Cursor**, **Claude Desktop**, **Windsurf**, **VS Code Copilot**, and **Antigravity**) to design schemas in JDL (JHipster Domain Language) from natural language prompts and automatically generate Kotlin Spring Boot code.

Instead of writing or debugging raw Kotlin boilerplate manually, your AI assistant interacts directly with KHipster via standard MCP tools.

---

## Why JDL-First with MCP?

1. **Eliminate Hallucinated Boilerplate**:
   When instructed to write entities and controllers directly, AI models frequently generate broken JPA annotations, hallucinated Lombok in Kotlin, invalid Liquibase changelogs, or omit Spring Security configurations.
2. **Concise Review Surface**:
   Reviewing a 30-line declarative `.jdl` file takes seconds; reviewing 1,500 lines of generated Kotlin, XML, and TypeScript is slow and error-prone.
3. **Zero Extra API Costs**:
   The MCP server runs locally via standard I/O (\`stdio\`). All LLM reasoning and token generation use your existing client (Cursor, Claude, Windsurf) without requiring separate API keys.

---

## Quick Setup

### 1. Cursor

Add the server to `.cursor/mcp.json` in your project or your global Cursor settings:

\`\`\`json
{
"mcpServers": {
"khipster": {
"command": "npx",
"args": ["-y", "generator-jhipster-kotlin", "mcp"]
}
}
}
\`\`\`

_(If \`generator-jhipster-kotlin\` is installed globally, you can also use \`"command": "khipster-mcp"\`.)_

### 2. Claude Desktop

Add the server to \`claude_desktop_config.json\`:

- **macOS**: \`~/Library/Application Support/Claude/claude_desktop_config.json\`
- **Windows**: \`%APPDATA%\\Claude\\claude_desktop_config.json\`

\`\`\`json
{
"mcpServers": {
"khipster": {
"command": "npx",
"args": ["-y", "generator-jhipster-kotlin", "mcp"]
}
}
}
\`\`\`

### 3. Windsurf

Add the server to \`~/.codeium/windsurf/mcp_config.json\`:

\`\`\`json
{
"mcpServers": {
"khipster": {
"command": "npx",
"args": ["-y", "generator-jhipster-kotlin", "mcp"]
}
}
}
\`\`\`

---

## Available MCP Capabilities

### Tools

| Tool                  | Purpose                                                                                                                    | Parameters                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| \`get_jdl_reference\` | Returns the complete JDL specification, supported field types, relationships, validation rules, and Kotlin best practices. | \`topic\` (optional: \`all\`, \`types\`, \`relationships\`, \`options\`) |
| \`write_jdl_file\`    | Writes or updates a JDL file (defaults to \`domain.jdl\`) in your project.                                                 | \`jdlContent\`, \`targetFile\`, \`projectPath\`                          |
| \`import_jdl\`        | Runs \`khipster import-jdl\` with safe non-interactive flags (\`--skip-install --skip-git --force\`).                      | \`jdlFile\`, \`projectPath\`, \`skipInstall\`, \`force\`                 |
| \`export_jdl\`        | Runs \`khipster export-jdl\` and returns existing domain entities in JDL format.                                           | \`targetFile\`, \`projectPath\`                                          |

### Prompts

- **\`design_jdl\`**: Pre-configured prompt template that instructs the LLM to act as a KHipster domain model architect, convert requirements into JDL, and invoke generation tools.

### Resources

- **\`jdl://reference\`**: Instant in-context JDL specification reference document.

---

## Example Workflow

Once configured, simply open your AI chat and prompt in natural language:

> **User Prompt:**  
> _"Create an e-commerce inventory module with \`Product\`, \`Category\`, and \`StockAlert\`. Use PostgreSQL and generate DTOs with MapStruct."_

**What happens automatically:**

1. The assistant invokes \`get_jdl_reference\` to check valid JDL syntax and Kotlin options.
2. The assistant drafts the JDL and calls \`write_jdl_file\` to save \`domain.jdl\`:
   \`\`\`jdl
   entity Product {
   name String required minlength(2)
   sku String required unique
   price BigDecimal required min(0)
   stock Integer required min(0)
   }

    entity Category {
    name String required unique
    description String
    }

    relationship ManyToOne {
    Product{category(name)} to Category{products}
    }

    dto * with mapstruct
    service * with serviceClass
    paginate Product with pagination
    \`\`\`

3. The assistant invokes \`import_jdl\` with \`jdlFile: "domain.jdl"\`.
4. KHipster generates the Kotlin domain classes, Spring Data JPA repositories, MapStruct DTOs, service layer, REST endpoints, and Liquibase changelogs.
5. The assistant returns a concise summary of the generated components to the user.
