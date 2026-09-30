import { readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { execa } from 'execa';
import { z } from 'zod';

const cliPath = fileURLToPath(new URL('./cli.cjs', import.meta.url));

const JDL_REFERENCE_DOC = `# JHipster Domain Language (JDL) Reference for KHipster (Kotlin)

JDL is the declarative domain modeling language for JHipster and KHipster.
Use this reference to generate clean, valid JDL files rather than writing boilerplate Kotlin code manually.

## 1. Application Configuration (Optional in existing projects)
\`\`\`jdl
application {
    config {
        baseName myApp
        applicationType monolith
        packageName com.mycompany.myapp
        authenticationType jwt
        databaseType sql
        prodDatabaseType postgresql
        devDatabaseType h2Disk
        buildTool gradle
    }
    entities *
}
\`\`\`

## 2. Entities & Fields
\`\`\`jdl
entity Product {
    name String required minlength(2) maxlength(100)
    sku String required unique
    price BigDecimal required min(0)
    stockQuantity Integer required min(0)
    status ProductStatus required
    description TextBlob
    publishedDate LocalDate
    active Boolean
}

enum ProductStatus {
    DRAFT,
    IN_STOCK,
    OUT_OF_STOCK,
    DISCONTINUED
}
\`\`\`

### Supported Field Types:
- Strings: \`String\`, \`TextBlob\`
- Numbers: \`Integer\`, \`Long\`, \`BigDecimal\`, \`Float\`, \`Double\`
- Booleans: \`Boolean\`
- Dates: \`LocalDate\`, \`Instant\`, \`ZonedDateTime\`, \`Duration\`
- Blobs: \`Blob\`, \`AnyBlob\`, \`ImageBlob\`, \`TextBlob\`
- Identifiers: \`UUID\`
- Enums: Defined with \`enum <Name> { VALUE1, VALUE2 }\`

### Supported Validations:
- \`required\`: Field cannot be null
- \`unique\`: Unique database constraint
- \`min(x)\`, \`max(x)\`: Numeric constraints
- \`minlength(x)\`, \`maxlength(x)\`: String length constraints
- \`pattern(/regex/)\`: Regex validation

## 3. Relationships
Relationships connect entities. Syntax:
\`relationship <Type> { <SourceEntity>{<targetField>(<displayField>)} to <DestinationEntity>{<sourceField>} }\`

### Types:
1. **ManyToOne / OneToMany (Parent-Child)**:
\`\`\`jdl
relationship ManyToOne {
    Product{category(name)} to Category{products}
    OrderItem{order} to CustomerOrder{items}
}
\`\`\`

2. **OneToOne**:
\`\`\`jdl
relationship OneToOne {
    UserProfile{user(login)} to User with builtInEntity
}
\`\`\`

3. **ManyToMany**:
\`\`\`jdl
relationship ManyToMany {
    Product{tags(name)} to Tag{products}
}
\`\`\`

## 4. Kotlin & Architecture Options (Crucial for KHipster)
Apply these options to generate clean Spring Boot + Kotlin architecture:
\`\`\`jdl
// Generate MapStruct DTOs and Mappers (Kotlin data classes)
dto * with mapstruct

// Generate a distinct Service layer for business logic
service * with serviceClass

// Configure pagination for REST endpoints
paginate Product with pagination
paginate CustomerOrder with infinite-scroll

// Enable JPA criteria filtering
filter Product
\`\`\`

## 5. Workflow with KHipster
1. AI Agent designs and validates JDL schema.
2. Save to \`domain.jdl\`.
3. Run \`khipster import-jdl domain.jdl --skip-install --skip-git --force\`.
4. KHipster generates Kotlin entities, Repositories, Services, DTOs, Controllers, Liquibase XML migrations, and Integration Tests.
`;

export function createMcpServer() {
    const server = new McpServer(
        {
            name: 'khipster-mcp',
            version: '2.0.0',
        },
        {
            capabilities: {
                tools: {},
                resources: {},
                prompts: {},
            },
        },
    );

    server.resource('jdl-reference', 'jdl://reference', async uri => ({
        contents: [
            {
                uri: uri.href,
                text: JDL_REFERENCE_DOC,
                mimeType: 'text/markdown',
            },
        ],
    }));

    server.prompt(
        'design_jdl',
        {
            requirements: z.string().describe('Natural language description of the business domain, entities, and requirements'),
            baseName: z.string().optional().describe('Optional application base name'),
        },
        async ({ requirements, baseName }) => ({
            description: 'Prompt instructions to design a clean, idiomatic JDL schema for KHipster',
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `You are an expert JHipster/KHipster domain model architect.
Please design a complete, valid JDL (JHipster Domain Language) schema based on these requirements:
"""
${requirements}
"""
${baseName ? `Application baseName: ${baseName}` : ''}

Guidelines:
1. Define entities with appropriate field types and validations (required, min, max, unique).
2. Configure relationships (OneToMany, ManyToOne, ManyToMany) with sensible join fields.
3. Include idiomatic KHipster options:
   - dto * with mapstruct
   - service * with serviceClass
   - paginate where appropriate
4. Return ONLY the JDL code block.
Once the JDL is ready, call the write_jdl_file tool to save it, then call import_jdl to generate the Kotlin Spring Boot backend.`,
                    },
                },
            ],
        }),
    );

    server.tool(
        'get_jdl_reference',
        'Provides the complete JHipster Domain Language (JDL) grammar, field types, relationships, validation rules, and Kotlin-specific application options for KHipster.',
        {
            topic: z.enum(['all', 'types', 'relationships', 'options']).optional().describe('Topic to filter reference on'),
        },
        async ({ topic }) => {
            let content = JDL_REFERENCE_DOC;
            if (topic === 'types') {
                content = JDL_REFERENCE_DOC.slice(
                    JDL_REFERENCE_DOC.indexOf('## 2. Entities & Fields'),
                    JDL_REFERENCE_DOC.indexOf('## 3. Relationships'),
                );
            } else if (topic === 'relationships') {
                content = JDL_REFERENCE_DOC.slice(
                    JDL_REFERENCE_DOC.indexOf('## 3. Relationships'),
                    JDL_REFERENCE_DOC.indexOf('## 4. Kotlin & Architecture Options'),
                );
            } else if (topic === 'options') {
                content = JDL_REFERENCE_DOC.slice(JDL_REFERENCE_DOC.indexOf('## 4. Kotlin & Architecture Options'));
            }
            return {
                content: [{ type: 'text', text: content }],
            };
        },
    );

    server.tool(
        'write_jdl_file',
        'Writes or updates a JDL (JHipster Domain Language) file in the project. Use this before running import_jdl.',
        {
            jdlContent: z.string().describe('The complete JDL content to write'),
            targetFile: z.string().default('domain.jdl').describe('Filename or relative path to the JDL file (defaults to domain.jdl)'),
            projectPath: z.string().optional().describe('Absolute or relative project working directory. Defaults to current directory.'),
        },
        async ({ jdlContent, targetFile, projectPath }) => {
            const root = projectPath ? resolve(projectPath) : process.cwd();
            const filePath = isAbsolute(targetFile) ? targetFile : join(root, targetFile);

            if (!jdlContent || jdlContent.trim().length === 0) {
                return {
                    isError: true,
                    content: [{ type: 'text', text: 'Error: jdlContent cannot be empty.' }],
                };
            }

            try {
                await writeFile(filePath, jdlContent, 'utf8');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Successfully wrote JDL model to ${filePath} (${jdlContent.split('\n').length} lines). You can now invoke import_jdl to generate the Kotlin codebase.`,
                        },
                    ],
                };
            } catch (err) {
                return {
                    isError: true,
                    content: [{ type: 'text', text: `Failed to write JDL file: ${err.message}` }],
                };
            }
        },
    );

    server.tool(
        'import_jdl',
        'Runs "khipster import-jdl" to generate or update the Kotlin Spring Boot backend from a JDL file. Automatically applies non-interactive flags (--skip-install --skip-git --force) for seamless agent execution.',
        {
            jdlFile: z.string().default('domain.jdl').describe('The JDL file to import (e.g. domain.jdl or app.jdl)'),
            projectPath: z.string().optional().describe('Project directory where khipster should run. Defaults to current directory.'),
            skipInstall: z
                .boolean()
                .default(true)
                .describe('Skip dependency installation (npm install/gradle dependencies) for faster iteration'),
            force: z.boolean().default(true).describe('Force overwrite conflicting files without interactive confirmation prompt'),
        },
        async ({ jdlFile, projectPath, skipInstall, force }) => {
            const root = projectPath ? resolve(projectPath) : process.cwd();
            const args = ['import-jdl', jdlFile, '--skip-git'];
            if (skipInstall) args.push('--skip-install');
            if (force) args.push('--force');

            try {
                const { stdout, stderr, exitCode } = await execa(process.execPath, [cliPath, ...args], {
                    cwd: root,
                    reject: false,
                    timeout: 180000,
                });

                if (exitCode !== 0) {
                    return {
                        isError: true,
                        content: [
                            {
                                type: 'text',
                                text: `khipster import-jdl failed with exit code ${exitCode}:\n\n${stderr || stdout}`,
                            },
                        ],
                    };
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: `khipster import-jdl completed successfully!\n\n${stdout.slice(-1500)}`,
                        },
                    ],
                };
            } catch (err) {
                return {
                    isError: true,
                    content: [{ type: 'text', text: `Execution error running khipster import-jdl: ${err.message}` }],
                };
            }
        },
    );

    server.tool(
        'export_jdl',
        'Runs "khipster export-jdl" to export the current project domain model to a JDL file and returns its content. Use this to inspect existing entities and relationships.',
        {
            targetFile: z.string().default('app.jdl').describe('Filename to export the JDL model to'),
            projectPath: z.string().optional().describe('Project directory. Defaults to current directory.'),
        },
        async ({ targetFile, projectPath }) => {
            const root = projectPath ? resolve(projectPath) : process.cwd();
            const filePath = isAbsolute(targetFile) ? targetFile : join(root, targetFile);

            try {
                const { stdout, stderr, exitCode } = await execa(process.execPath, [cliPath, 'export-jdl', targetFile], {
                    cwd: root,
                    reject: false,
                    timeout: 60000,
                });

                if (exitCode !== 0) {
                    return {
                        isError: true,
                        content: [
                            {
                                type: 'text',
                                text: `khipster export-jdl failed with exit code ${exitCode}:\n\n${stderr || stdout}`,
                            },
                        ],
                    };
                }

                const content = await readFile(filePath, 'utf8').catch(() => null);
                return {
                    content: [
                        {
                            type: 'text',
                            text: content
                                ? `Successfully exported JDL to ${targetFile}:\n\n\`\`\`jdl\n${content}\n\`\`\``
                                : `Export command succeeded:\n${stdout}`,
                        },
                    ],
                };
            } catch (err) {
                return {
                    isError: true,
                    content: [{ type: 'text', text: `Execution error running khipster export-jdl: ${err.message}` }],
                };
            }
        },
    );

    return server;
}

export async function startMcpServer() {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[khipster-mcp] KHipster Model Context Protocol server running on stdio');
}
