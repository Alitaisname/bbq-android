package com.yidiandian.shellv2

object AppConfig {
    const val LOCAL_WEB_BASE_URL: String = BuildConfig.LOCAL_WEB_BASE_URL
    const val LOCAL_HEALTH_URL: String = BuildConfig.LOCAL_HEALTH_URL
    const val KLS_API_BASE: String = BuildConfig.KLS_API_BASE
    const val BACKEND_BOOT_MODE: String = BuildConfig.BACKEND_BOOT_MODE
    const val BACKEND_START_COMMAND: String = BuildConfig.BACKEND_START_COMMAND
    const val BACKEND_WORK_DIR: String = BuildConfig.BACKEND_WORK_DIR
    const val BACKEND_HEALTH_TIMEOUT_MS: Int = BuildConfig.BACKEND_HEALTH_TIMEOUT_MS
    const val BACKEND_HEALTH_POLL_INTERVAL_MS: Int = BuildConfig.BACKEND_HEALTH_POLL_INTERVAL_MS
    const val DEV_AUTH_INJECT_ENABLED: Boolean = BuildConfig.DEV_AUTH_INJECT_ENABLED
    const val DEV_INJECT_ACCESS_TOKEN: String = BuildConfig.DEV_INJECT_ACCESS_TOKEN
    const val DEV_INJECT_REFRESH_TOKEN: String = BuildConfig.DEV_INJECT_REFRESH_TOKEN
    const val DEV_INJECT_ROLE: String = BuildConfig.DEV_INJECT_ROLE
}
