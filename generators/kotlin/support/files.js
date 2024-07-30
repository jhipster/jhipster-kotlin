export const convertToKotlinFile = file =>
    file.replace('.java', '.kt').replace('src/main/java/', 'src/main/kotlin/').replace('src/test/java/', 'src/test/kotlin/');
