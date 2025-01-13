// This file will not be overwritten by generate-blueprint
module.exports = {
    printBlueprintLogo: async () => {
        const { printLogo } = await import('./logo.mjs');
        return printLogo();
    },
};
