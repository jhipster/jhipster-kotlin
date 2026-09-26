export const convertToKotlinFile = (file, replaceExtension = true) => {
    if (replaceExtension) {
        file = file.replace(/\.java(?=[_.]|$)/, '.kt');
    }
    return file.replaceAll('src/main/java/', 'src/main/kotlin/').replaceAll('src/test/java/', 'src/test/kotlin/');
};
