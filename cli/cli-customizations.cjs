// This file will not be overwritten by generate-blueprint
module.exports = {
    printLogo: async () => {
        const { printLogo } = await import('./logo.mjs');
        return printLogo();
    },
    printBlueprintLogo: () => {},
};
