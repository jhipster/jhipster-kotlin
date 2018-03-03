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
package <%=packageName%>.repository

import org.springframework.social.connect.*

class CustomSocialUsersConnectionRepository(private val socialUserConnectionRepository: SocialUserConnectionRepository, private val connectionFactoryLocator: ConnectionFactoryLocator) : UsersConnectionRepository {

    override fun findUserIdsWithConnection(connection: Connection<*>): List<String> {
        val key = connection.key
        val socialUserConnections = socialUserConnectionRepository.findAllByProviderIdAndProviderUserId(key.providerId, key.providerUserId)
        return socialUserConnections
            .map { it.userId }
            .toList()
    }

    override fun findUserIdsConnectedTo(providerId: String, providerUserIds: Set<String>): Set<String> {
        val socialUserConnections = socialUserConnectionRepository.findAllByProviderIdAndProviderUserIdIn(providerId, providerUserIds)
        return socialUserConnections
            .map { it.userId }
            .toSet()
    }

    override fun createConnectionRepository(userId: String?): ConnectionRepository {
        if (userId == null) {
            throw IllegalArgumentException("userId cannot be null")
        }
        return CustomSocialConnectionRepository(userId, socialUserConnectionRepository, connectionFactoryLocator)
    }
}
