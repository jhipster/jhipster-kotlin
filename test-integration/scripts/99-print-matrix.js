#!/usr/bin/env node
import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const MATRIX_FILE = 'matrix.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let existing = {};
try {
    existing = JSON.parse(readFileSync(MATRIX_FILE));
} catch (_) {
    console.log(`File ${MATRIX_FILE} not found`);
    existing = { include: [] };
}

writeFileSync(
    MATRIX_FILE,
    JSON.stringify(
        {
            include: [
                ...existing.include,
                ...process.argv
                    .slice(2)
                    .map(file => {
                        try {
                            return JSON.parse(readFileSync(join(__dirname, `../../${file}`)).toString()).include;
                        } catch (_) {
                            console.log(`File ${file} not found`);
                            return [];
                        }
                    })
                    .flat(),
            ],
        },
        null,
        2,
    ),
);
