/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const DETEKT_VERSION = '1.21.0';
const KOTLIN_VERSION = '1.6.21';
const KTLINT_MAVEN_VERSION = '1.15.2';
const KTLINT_GRADLE_VERSION = '11.0.0';
const MAPSTRUCT_VERSION = '1.5.3.Final';
const MAVEN_ANTRUN_VERSION = '3.0.0';
const MOCKITO_KOTLIN_VERSION = '4.0.0';

const DETEKT_CONFIG_FILE = 'detekt-config.yml';

const constants = {
    KOTLIN_VERSION,
    MOCKITO_KOTLIN_VERSION,
    KTLINT_MAVEN_VERSION,
    KTLINT_GRADLE_VERSION,
    DETEKT_VERSION,
    MAVEN_ANTRUN_VERSION,
    DETEKT_CONFIG_FILE,
    MAPSTRUCT_VERSION,
};

module.exports = constants;
