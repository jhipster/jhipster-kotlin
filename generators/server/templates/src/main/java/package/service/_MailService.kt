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
package <%=packageName%>.service

import <%=packageName%>.domain.User

import io.github.jhipster.config.JHipsterProperties

import java.nio.charset.StandardCharsets
import java.util.Locale
import javax.mail.internet.MimeMessage

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.context.MessageSource
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.thymeleaf.context.Context
import org.thymeleaf.spring5.SpringTemplateEngine
<%_ if (enableSocialSignIn) { _%>
import org.apache.commons.lang3.StringUtils
<%_ } _%>

/**
 * Service for sending emails.
 * <p>
 * We use the @Async annotation to send emails asynchronously.
 */
@Service
class MailService(private val jHipsterProperties: JHipsterProperties, private val javaMailSender: JavaMailSender,
                  private val messageSource: MessageSource, private val templateEngine: SpringTemplateEngine)  {

    private val log = LoggerFactory.getLogger(MailService::class.java)

    @Async
    fun sendEmail(to: String, subject: String, content: String, isMultipart: Boolean, isHtml: Boolean) {
        log.debug("Send email[multipart '{}' and html '{}'] to '{}' with subject '{}' and content={}",
            isMultipart, isHtml, to, subject, content)

        // Prepare message using a Spring helper
        log.debug("Send email[multipart '{}' and html '{}'] to '{}' with subject '{}' and content={}",
            isMultipart, isHtml, to, subject, content)

        // Prepare message using a Spring helper
        val mimeMessage = javaMailSender.createMimeMessage()
        try {
            val message = MimeMessageHelper(mimeMessage, isMultipart, StandardCharsets.UTF_8.name())
            message.setTo(to)
            message.setFrom(jHipsterProperties.mail.from)
            message.setSubject(subject)
            message.setText(content, isHtml)
            javaMailSender.send(mimeMessage)
            log.debug("Sent email to User '{}'", to)
        } catch (e: Exception) {
            if (log.isDebugEnabled) {
                log.warn("Email could not be sent to user '{}'", to, e)
            } else {
                log.warn("Email could not be sent to user '{}': {}", to, e.message)
            }
        }
    }
    
    @Async
    fun sendEmailFromTemplate(user: User, templateName: String, titleKey: String) {
        val locale = Locale.forLanguageTag(user.langKey)
        val context = Context(locale)
        context.setVariable(USER, user)
        context.setVariable(BASE_URL, jHipsterProperties.mail.baseUrl)
        val content = templateEngine.process(templateName, context)
        val subject = messageSource.getMessage(titleKey, null, locale)
        sendEmail(user.email!!, subject, content, false, true)
    }

    <%_ if (authenticationType !== 'oauth2') { _%>

    @Async
    fun sendActivationEmail(user: User) {
        log.debug("Sending activation email to '{}'", user.email)
        sendEmailFromTemplate(user, "activationEmail", "email.activation.title")
    }

    @Async
    fun sendCreationEmail(user: User) {
        log.debug("Sending creation email to '{}'", user.email)
        sendEmailFromTemplate(user, "creationEmail", "email.activation.title")
    }

    @Async
    fun sendPasswordResetMail(user: User) {
        log.debug("Sending password reset email to '{}'", user.email)
        sendEmailFromTemplate(user, "passwordResetEmail", "email.reset.title")
    }
    <%_ } _%>
    <%_ if (enableSocialSignIn) { _%>

    @Async
    fun sendSocialRegistrationValidationEmail(user: User, provider: String) {
        log.debug("Sending social registration validation email to '{}'", user.email)
        val locale = Locale.forLanguageTag(user.langKey)
        val context = Context(locale)
        context.setVariable(USER, user)
        context.setVariable(BASE_URL, jHipsterProperties.mail.baseUrl)
        context.setVariable("provider", provider.capitalize())
        val content = templateEngine.process("socialRegistrationValidationEmail", context)
        val subject = messageSource.getMessage("email.social.registration.title", null, locale)
        sendEmail(user.email!!, subject, content, false, true)
    }
    <%_ } _%>

    companion object {

        private val USER = "user"

        private val BASE_URL = "baseUrl"
    }
}