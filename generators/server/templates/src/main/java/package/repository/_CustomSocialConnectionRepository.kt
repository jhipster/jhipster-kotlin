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

import <%=packageName%>.domain.SocialUserConnection

import org.springframework.social.connect.*
import org.springframework.transaction.annotation.Transactional
import org.springframework.util.LinkedMultiValueMap
import org.springframework.util.MultiValueMap

import java.util.*

open class CustomSocialConnectionRepository(private val userId: String, private val socialUserConnectionRepository: SocialUserConnectionRepository, private val connectionFactoryLocator: ConnectionFactoryLocator) : ConnectionRepository {

    override fun findAllConnections(): MultiValueMap<String, Connection<*>> {
        val socialUserConnections = socialUserConnectionRepository.findAllByUserIdOrderByProviderIdAscRankAsc(userId)
        val connections = socialUserConnectionsToConnections(socialUserConnections)
        val connectionsByProviderId = LinkedMultiValueMap<String, Connection<*>>()
        val registeredProviderIds = connectionFactoryLocator.registeredProviderIds()
        for (registeredProviderId in registeredProviderIds) {
            connectionsByProviderId[registeredProviderId] = emptyList()
        }
        for (connection in connections) {
            val providerId = connection.key.providerId
            if (connectionsByProviderId[providerId]!!.size == 0) {
                connectionsByProviderId[providerId] = LinkedList()
            }
            connectionsByProviderId.add(providerId, connection)
        }
        return connectionsByProviderId
    }

    override fun findConnections(providerId: String): List<Connection<*>> {
        val socialUserConnections = socialUserConnectionRepository.findAllByUserIdAndProviderIdOrderByRankAsc(userId, providerId)
        return socialUserConnectionsToConnections(socialUserConnections)
    }

    override fun <A> findConnections(apiType: Class<A>): List<Connection<A>> {
        val connections = findConnections(getProviderId(apiType))
        return connections as List<Connection<A>>
    }

    override fun findConnectionsToUsers(providerUserIdsByProviderId: MultiValueMap<String, String>?): MultiValueMap<String, Connection<*>> {
        if (providerUserIdsByProviderId == null || providerUserIdsByProviderId.isEmpty()) {
            throw IllegalArgumentException("Unable to execute find: no providerUsers provided")
        }

        val connectionsForUsers = LinkedMultiValueMap<String, Connection<*>>()
        for ((providerId, providerUserIds) in providerUserIdsByProviderId) {
            val connections = providerUserIdsToConnections(providerId, providerUserIds)
            connections.forEach { connection -> connectionsForUsers.add(providerId, connection) }
        }
        return connectionsForUsers
    }

    override fun getConnection(connectionKey: ConnectionKey): Connection<*> {
        val socialUserConnection = socialUserConnectionRepository.findOneByUserIdAndProviderIdAndProviderUserId(userId, connectionKey.providerId, connectionKey.providerUserId)
        return Optional.ofNullable(socialUserConnection)
            .map { this.socialUserConnectionToConnection(it) }
            .orElseThrow { NoSuchConnectionException(connectionKey) }
    }

    override fun <A> getConnection(apiType: Class<A>, providerUserId: String): Connection<A> {
        val providerId = getProviderId(apiType)
        return getConnection(ConnectionKey(providerId, providerUserId)) as Connection<A>
    }

    override fun <A> getPrimaryConnection(apiType: Class<A>): Connection<A> {
        val providerId = getProviderId(apiType)
        return findPrimaryConnection(providerId) as Connection<A>? ?: throw NotConnectedException(providerId)
    }

    override fun <A> findPrimaryConnection(apiType: Class<A>): Connection<A> {
        val providerId = getProviderId(apiType)
        return findPrimaryConnection(providerId) as Connection<A>
    }

    @Transactional
    override fun addConnection(connection: Connection<*>) {
        val rank = getNewMaxRank(connection.key.providerId).toLong()
        val socialUserConnectionToSave = connectionToUserSocialConnection(connection, rank)
        socialUserConnectionRepository.save(socialUserConnectionToSave)
    }

    @Transactional
    override fun updateConnection(connection: Connection<*>) {
        val socialUserConnection = socialUserConnectionRepository.findOneByUserIdAndProviderIdAndProviderUserId(userId, connection.key.providerId, connection.key.providerUserId)
        if (socialUserConnection != null) {
            val socialUserConnectionToUpdate = connectionToUserSocialConnection(connection, socialUserConnection.rank)
            socialUserConnectionToUpdate.id = socialUserConnection.id
            socialUserConnectionRepository.save(socialUserConnectionToUpdate)
        }
    }

    @Transactional
    override fun removeConnections(providerId: String) {
        socialUserConnectionRepository.deleteByUserIdAndProviderId(userId, providerId)
    }

    @Transactional
    override fun removeConnection(connectionKey: ConnectionKey) {
        socialUserConnectionRepository.deleteByUserIdAndProviderIdAndProviderUserId(userId, connectionKey.providerId, connectionKey.providerUserId)
    }

    private fun getNewMaxRank(providerId: String): Double {
        val socialUserConnections = socialUserConnectionRepository.findAllByUserIdAndProviderIdOrderByRankAsc(userId, providerId)
        return socialUserConnections.stream()
            .mapToDouble{ it.rank.toDouble() }
            .max()
            .orElse(0.0) + 1.0
    }

    private fun findPrimaryConnection(providerId: String): Connection<*>? {
        val socialUserConnections = socialUserConnectionRepository.findAllByUserIdAndProviderIdOrderByRankAsc(userId, providerId)
        return if (socialUserConnections.size > 0) {
            socialUserConnectionToConnection(socialUserConnections[0])
        } else {
            null
        }
    }

    private fun connectionToUserSocialConnection(connection: Connection<*>, rank: Long?): SocialUserConnection {
        val connectionData = connection.createData()
        return SocialUserConnection(
            userId,
            connection.key.providerId,
            connection.key.providerUserId,
            rank,
            connection.displayName,
            connection.profileUrl,
            connection.imageUrl,
            connectionData.accessToken,
            connectionData.secret,
            connectionData.refreshToken,
            connectionData.expireTime
        )
    }

    private fun providerUserIdsToConnections(providerId: String, providerUserIds: List<String>): List<Connection<*>> {
        val socialUserConnections = socialUserConnectionRepository.findAllByUserIdAndProviderIdAndProviderUserIdIn(userId, providerId, providerUserIds)
        return socialUserConnectionsToConnections(socialUserConnections)
    }

    private fun socialUserConnectionsToConnections(socialUserConnections: List<SocialUserConnection>): List<Connection<*>> {
        return socialUserConnections
            .map{ this.socialUserConnectionToConnection(it) }
            .toList()
    }

    private fun socialUserConnectionToConnection(socialUserConnection: SocialUserConnection): Connection<*> {
        val connectionData = ConnectionData(socialUserConnection.providerId,
            socialUserConnection.providerUserId,
            socialUserConnection.displayName,
            socialUserConnection.profileURL,
            socialUserConnection.imageURL,
            socialUserConnection.accessToken,
            socialUserConnection.secret,
            socialUserConnection.refreshToken,
            socialUserConnection.expireTime)
        val connectionFactory = connectionFactoryLocator.getConnectionFactory(connectionData.providerId)
        return connectionFactory.createConnection(connectionData)
    }

    private fun <A> getProviderId(apiType: Class<A>): String {
        return connectionFactoryLocator.getConnectionFactory(apiType).providerId
    }
}
