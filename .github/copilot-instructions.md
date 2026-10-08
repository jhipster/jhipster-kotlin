# GitHub Copilot & AI Agent Instructions for KHipster

This repository contains KHipster (Kotlin blueprint for JHipster) code and applications.

## General Guidelines

- **Project Identity**: This is a KHipster project (Kotlin + Spring Boot).
- **Language**: Write idiomatic Kotlin (JDK 21+). Never fall back to Java syntax or Lombok annotations.

## Generator Guardrails

- **Liquibase**: Never overwrite or manually edit KHipster-generated Liquibase XML changelogs. Schema updates must be managed via JDL or `khipster entity`.
- **Metadata**: Preserve `.jhipster/*.json` entity models and `.yo-rc.json`.

## Scaffolding & Sub-Generators

- Never generate boilerplate Spring services, controllers, or repositories from scratch.
- Instruct users or CLI to scaffold via `khipster entity <Name>` or `khipster import-jdl <file> --skip-install --skip-git --force` with `service * with serviceClass`.
- Implement custom domain logic inside the generated Kotlin classes or extension functions.

## Kotlin Idioms

- Favor standard library functions (`map`, `filter`, `mapNotNull`, `associateBy`, `groupBy`) over imperative loops.
- Use Kotlin null-safety operators (`?.`, `?:`, `let`) instead of Java-style `if (x != null)`.
- Use scope functions (`apply`, `also`, `let`, `run`, `takeIf`) appropriately.
- Enforce immutability (`val` over `var`, read-only collections).
- Use `data class` for data holders and DTOs.
- Avoid over-engineered architectures; keep solutions concise and idiomatic.
