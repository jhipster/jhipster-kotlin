export const convertToKotlinFile = (file, replaceExtension = true) => {
    if (replaceExtension) {
        file = file.replace('.java', '.kt');
    }
    return file.replace('src/main/java/', 'src/main/kotlin/').replace('src/test/java/', 'src/test/kotlin/');
};
