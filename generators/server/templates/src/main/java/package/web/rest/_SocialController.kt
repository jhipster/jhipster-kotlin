<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License")
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

import <%=packageName%>.config.Constants
import <%=packageName%>.service.SocialService

import org.slf4j.LoggerFactory

import org.springframework.social.connect.web.ProviderSignInUtils
import org.springframework.social.support.URIBuilder
import org.springframework.web.bind.annotation.*
import org.springframework.web.context.request.WebRequest
import org.springframework.web.servlet.view.RedirectView

@RestController
@RequestMapping("/social")
class SocialController(private val socialService: SocialService, private val providerSignInUtils: ProviderSignInUtils){

    private val log = LoggerFactory.getLogger(SocialController::class.java)

    @GetMapping("/signup")
    fun signUp(webRequest: WebRequest, @CookieValue(name = "NG_TRANSLATE_LANG_KEY", required = false, defaultValue = Constants.DEFAULT_LANGUAGE) langKey: String): RedirectView {
        try {
            val connection = providerSignInUtils.getConnectionFromSession(webRequest)
            socialService.createSocialUser(connection, langKey.replace("\"", ""))
            return RedirectView(URIBuilder.fromUri("/#/social-register/" + connection.key.providerId)
                .queryParam("success", "true")
                .build().toString(), true)
        } catch (e: Exception) {
            log.error("Exception creating social user: ", e)
            return RedirectView(URIBuilder.fromUri("/#/social-register/no-provider")
                .queryParam("success", "false")
                .build().toString(), true)
        }

    }
}