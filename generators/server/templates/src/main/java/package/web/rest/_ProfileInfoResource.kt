<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.web.rest

import <%=packageName%>.config.DefaultProfileUtil

import io.github.jhipster.config.JHipsterProperties

import org.springframework.core.env.Environment
import org.springframework.web.bind.annotation.*

import java.util.ArrayList
import java.util.Arrays

/**
 * Resource to return information about the currently running Spring profiles.
 */
@RestController
@RequestMapping("/api")
class ProfileInfoResource(private val env: Environment, private val jHipsterProperties: JHipsterProperties) {

    @GetMapping("/profile-info")
    fun getActiveProfiles(): ProfileInfoVM {
        val activeProfiles = DefaultProfileUtil.getActiveProfiles(env)
        return ProfileInfoVM(activeProfiles, getRibbonEnv(activeProfiles))
    }

    private fun getRibbonEnv(activeProfiles: Array<String>): String? {
        val displayOnActiveProfiles = jHipsterProperties.ribbon.displayOnActiveProfiles ?: return null
        val ribbonProfiles = ArrayList(Arrays.asList(*displayOnActiveProfiles))
        val springBootProfiles = Arrays.asList(*activeProfiles)
        ribbonProfiles.retainAll(springBootProfiles)
        return if (!ribbonProfiles.isEmpty()) {
            ribbonProfiles[0]
        } else null
    }
}

class ProfileInfoVM(val activeProfiles: Array<String>, val ribbonEnv: String?)
