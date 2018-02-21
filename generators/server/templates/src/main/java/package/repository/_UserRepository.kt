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
// TODO: cacheconfiguration needs to be completed before using this.
<%_
let cacheManagerIsAvailable = false;
if (['ehcache', 'hazelcast', 'infinispan'].includes(cacheProvider) || applicationType === 'gateway') {
    cacheManagerIsAvailable = true;
}
_%>
package <%=packageName%>.repository
<%_ if (databaseType === 'cassandra') { _%>

import com.datastax.driver.core.*
import com.datastax.driver.mapping.Mapper
import com.datastax.driver.mapping.MappingManager
<%_ } _%>

import <%=packageName%>.domain.User

<%_ if (cacheManagerIsAvailable === true) { _%>
import org.springframework.cache.annotation.Cacheable
<%_ } _%>
<%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
<%_ } _%>
<%_ if (databaseType === 'sql') { _%>
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
<%_ } _%>
<%_ if (databaseType === 'mongodb') { _%>
import org.springframework.data.mongodb.repository.MongoRepository
<%_ } _%>
import org.springframework.stereotype.Repository
<%_ if (databaseType === 'cassandra') { _%>
import org.springframework.util.StringUtils

import javax.validation.ConstraintViolation
import javax.validation.ConstraintViolationException
import javax.validation.Validator
<%_ } _%>
import java.util.List
import java.util.Optional
<%_ if (databaseType === 'cassandra') { _%>
import java.util.Set
<%_ } _%>
<%_ if (databaseType !== 'cassandra') { _%>
import java.time.Instant
<%_ } _%>
<% if (databaseType === 'couchbase') { %>
import static <%=packageName%>.config.Constants.ID_DELIMITER
<% } %>
<%_ if (databaseType === 'sql') { _%>
/**
 * Spring Data JPA repository for the User entity.
 */
<%_ } _%>
<%_ if (databaseType === 'mongodb') { _%>
/**
 * Spring Data MongoDB repository for the User entity.
 */
<%_ } _%>
<%_ if (databaseType === 'couchbase') { _%>
/**
 * Spring Data Couchbase repository for the User entity.
 */
<%_ } _%>
<%_ if (databaseType === 'cassandra') { _%>
/**
 * Cassandra repository for the User entity.
 */
<%_ } _%>
<%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
@Repository
interface UserRepository : <% if (databaseType === 'sql') { %>JpaRepository<User, Long><% } %><% if (databaseType === 'mongodb') { %>MongoRepository<User, String><% } %><% if (databaseType === 'couchbase') { %>N1qlCouchbaseRepository<User, String><% } %> {
    <%_ if (cacheManagerIsAvailable) { _%>

    companion object {

       const val USERS_BY_LOGIN_CACHE = "usersByLogin"

       const val USERS_BY_EMAIL_CACHE = "usersByEmail"
    }
    <%_ } _%>
    <%_ if (authenticationType !== 'oauth2') { _%>

    fun findOneByActivationKey(activationKey: String): Optional<User>
    <%_ } _%>

    fun findAllByActivatedIsFalseAndCreatedDateBefore(dateTime: Instant): List<User>
    <%_ if (authenticationType !== 'oauth2') { _%>

    fun findOneByResetKey(resetKey: String): Optional<User>
    <%_ } _%>

    <%_ if (databaseType === 'couchbase' || databaseType === 'mongodb') { _%>
        <%_ if (cacheManagerIsAvailable === true) { _%>
    @Cacheable(cacheNames = [USERS_BY_EMAIL_CACHE])
        <%_ } _%>
    <%_ } _%>
    fun findOneByEmailIgnoreCase(email: String): Optional<User>

    <%_ if (databaseType === 'couchbase') { _%>
        <%_ if (cacheManagerIsAvailable === true) { _%>
    @Cacheable(cacheNames = [USERS_BY_LOGIN_CACHE])
        <%_ } _%>        
    fun findOneByLogin(login: String): Optional<User>{
        return findById(User.PREFIX + ID_DELIMITER + login);
    }

    fun findById(login: String): Optional<User>
    <%_ } else if (databaseType === 'mongodb') { _%>
        <%_ if (cacheManagerIsAvailable === true) { _%>
    @Cacheable(cacheNames = [USERS_BY_LOGIN_CACHE])
        <%_ } _%>
    fun findOneByLogin(login: String): Optional<User>
    <%_ } else { _%>
    fun findOneByLogin(login: String): Optional<User>
    <%_ } _%>
    <%_ if (databaseType === 'sql') { _%>

    @EntityGraph(attributePaths = ["authorities"])
    fun findOneWithAuthoritiesById(id: <%= pkType %> ): Optional<User> 

    @EntityGraph(attributePaths = ["authorities"])
    <%_ if (cacheManagerIsAvailable === true) { _%>
    @Cacheable(cacheNames = [USERS_BY_LOGIN_CACHE])
    <%_ } _%>
    fun findOneWithAuthoritiesByLogin(login: String): Optional<User>

    @EntityGraph(attributePaths = ["authorities"])
    <%_ if (cacheManagerIsAvailable === true) { _%>
    @Cacheable(cacheNames = [USERS_BY_EMAIL_CACHE])
    <%_ } _%>
    fun findOneWithAuthoritiesByEmail(email: String): Optional<User>
    <%_ } _%>

    fun findAllByLoginNot(pageable: Pageable, login: String): Page<User>
}
<%_ } _%>
