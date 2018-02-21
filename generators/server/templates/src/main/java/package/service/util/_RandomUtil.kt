package com.mycompany.myapp.service.util

import org.apache.commons.lang3.RandomStringUtils

/**
 * Utility class for generating random Strings.
 */
object RandomUtil {

    private val DEF_COUNT = 20

    /**
     * Generate a password.
     *
     * @return the generated password
     */
    fun generatePassword(): String {
        return RandomStringUtils.randomAlphanumeric(DEF_COUNT)
    }

    /**
     * Generate an activation key.
     *
     * @return the generated activation key
     */
    @JvmStatic
    fun generateActivationKey(): String {
        return RandomStringUtils.randomNumeric(DEF_COUNT)
    }

    /**
     * Generate a reset key.
     *
     * @return the generated reset key
     */
    @JvmStatic
    fun generateResetKey(): String {
        return RandomStringUtils.randomNumeric(DEF_COUNT)
    }

    <%_ if (authenticationType === 'session') { _%>

    /**
     * Generate a unique series to validate a persistent token, used in the
     * authentication remember-me mechanism.
     *
     * @return the generated series data
     */
    @JvmStatic
    fun generateSeriesData(): String {
        return RandomStringUtils.randomAlphanumeric(DEF_COUNT);
    }

    /**
     * Generate a persistent token, used in the authentication remember-me mechanism.
     *
     * @return the generated token data
     */
    @JvmStatic
    fun generateTokenData(): String {
        return RandomStringUtils.randomAlphanumeric(DEF_COUNT);
    }
    <%_ } _%>
}
