#!/usr/bin/env node

const { basename, dirname, join } = require('path');

const { bin, version } = require('../package.json');

// Get package name to use as namespace.
// Allows blueprints to be aliased.
const packagePath = dirname(__dirname);
const packageFolderName = basename(packagePath);
const devBlueprintPath = join(packagePath, '.blueprint');
const blueprint = packageFolderName.startsWith('jhipster-') ? `generator-${packageFolderName}` : packageFolderName;

(async () => {
    const { runJHipster, done, logger } = await import('generator-jhipster/cli');
    const executableName = Object.keys(bin)[0];

    // generator-jhipster 9.x's spring-boot/languages generators hardcode some *.java needle-edit
    // paths (e.g. MailServiceIT.java) that don't exist in this Kotlin blueprint (MailServiceIT.kt).
    // Most are handled by overriding the relevant task/source hook in generators/spring-boot, but
    // --ignore-needles-error is the upstream-supported escape hatch for the rest, and this blueprint's
    // own test suite already relies on it (see matrix.spec.js). Default it on so `khipster app` works
    // out of the box; still overridable with --no-ignore-needles-error.
    const argv = process.argv.some(arg => arg.includes('ignore-needles-error'))
        ? process.argv
        : [...process.argv, '--ignore-needles-error'];

    runJHipster({
        argv,
        executableName,
        executableVersion: version,
        defaultCommand: 'app',
        devBlueprintPath,
        blueprints: {
            [blueprint]: version,
        },
        printBlueprintLogo: () => {
            console.log('===================== JHipster Kotlin =====================');
            console.log('');
        },
        lookups: [{ packagePaths: [packagePath] }],
        ...require('./cli-customizations.cjs'),
    }).catch(done);

    process.on('unhandledRejection', up => {
        logger.error('Unhandled promise rejection at:');
        logger.fatal(up);
    });
})();
