const constants = require('./jhipster-constants.cjs');

const { SERVER_MAIN_SRC_DIR, SERVER_TEST_SRC_DIR } = constants;

const SERVER_MAIN_SRC_KOTLIN_DIR = `${constants.MAIN_DIR}kotlin/`;
const SERVER_TEST_SRC_KOTLIN_DIR = `${constants.TEST_DIR}kotlin/`;

const getPath = pathName => {
    if (pathName === SERVER_MAIN_SRC_DIR) return SERVER_MAIN_SRC_KOTLIN_DIR;
    if (pathName === SERVER_TEST_SRC_DIR) return SERVER_TEST_SRC_KOTLIN_DIR;
    return pathName;
};

const convertToKotlinFile = file =>
    file
        .replace('.java', '.kt')
        .replace(SERVER_MAIN_SRC_DIR, SERVER_MAIN_SRC_KOTLIN_DIR)
        .replace(SERVER_TEST_SRC_DIR, SERVER_TEST_SRC_KOTLIN_DIR);

const makeKotlinServerFiles = function (files) {
    const keys = Object.keys(files);
    const out = {};

    keys.forEach(key => {
        out[key] = files[key].map(file => ({
            ...file,
            path: getPath(file.path),
            templates: file.templates
                .filter(template => {
                    const { file = template } = template;
                    if (typeof file === 'string' && (file.includes('package-info') || file.includes('src/main/docker'))) return false;
                    return true;
                })
                .map(template => {
                    if (template.file) {
                        if (typeof template.file !== 'function') {
                            let templateName = template.file;
                            if (template.file.indexOf('.java') !== -1) {
                                templateName = convertToKotlinFile(template.file);
                            }
                            return {
                                ...template,
                                file: templateName,
                                ...(template.renameTo ? { renameTo: (...args) => convertToKotlinFile(template.renameTo(...args)) } : {}),
                            };
                        }
                        return {
                            ...template,
                            file: generator => template.file(generator).replace('.java', '.kt'),
                            ...(template.renameTo ? { renameTo: (...args) => convertToKotlinFile(template.renameTo(...args)) } : {}),
                        };
                    }
                    return template;
                }),
        }));
    });
    return out;
};

module.exports = {
    makeKotlinServerFiles,
};
