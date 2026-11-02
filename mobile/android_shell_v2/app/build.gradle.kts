plugins {
    id("com.android.application")
    id("com.chaquo.python")
    id("org.jetbrains.kotlin.android")
}

fun escBuildConfigString(raw: String): String {
    return raw.replace("\\", "\\\\").replace("\"", "\\\"")
}

android {
    namespace = "com.yidiandian.shellv2"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.yidiandian.shellv2"
        minSdk = 26
        targetSdk = 35
        versionCode = 122
        versionName = "v122"
        ndk {
            abiFilters += listOf("arm64-v8a", "armeabi-v7a", "x86_64", "x86")
        }

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        buildConfigField("String", "LOCAL_WEB_BASE_URL", "\"http://127.0.0.1:8000/\"")
        buildConfigField("String", "LOCAL_HEALTH_URL", "\"http://127.0.0.1:8000/\"")
        val klsApiBase = (project.findProperty("KLS_API_BASE") as String?) ?: "https://your-kls.example.com"
        buildConfigField("String", "KLS_API_BASE", "\"${escBuildConfigString(klsApiBase)}\"")
        buildConfigField("String", "BACKEND_BOOT_MODE", "\"EMBEDDED_PYTHON\"")
        buildConfigField("String", "BACKEND_START_COMMAND", "\"\"")
        buildConfigField("String", "BACKEND_WORK_DIR", "\"\"")
        buildConfigField("int", "BACKEND_HEALTH_TIMEOUT_MS", "12000")
        buildConfigField("int", "BACKEND_HEALTH_POLL_INTERVAL_MS", "350")
        val devAuthInjectEnabled = ((project.findProperty("DEV_AUTH_INJECT_ENABLED") as String?) ?: "false")
            .trim()
            .equals("true", ignoreCase = true)
        val devInjectAccessToken = if (devAuthInjectEnabled) {
            (project.findProperty("DEV_INJECT_ACCESS_TOKEN") as String?) ?: ""
        } else {
            ""
        }
        val devInjectRefreshToken = if (devAuthInjectEnabled) {
            (project.findProperty("DEV_INJECT_REFRESH_TOKEN") as String?) ?: ""
        } else {
            ""
        }
        val devInjectRole = if (devAuthInjectEnabled) {
            (project.findProperty("DEV_INJECT_ROLE") as String?) ?: ""
        } else {
            ""
        }
        buildConfigField("boolean", "DEV_AUTH_INJECT_ENABLED", devAuthInjectEnabled.toString())
        buildConfigField("String", "DEV_INJECT_ACCESS_TOKEN", "\"${escBuildConfigString(devInjectAccessToken)}\"")
        buildConfigField("String", "DEV_INJECT_REFRESH_TOKEN", "\"${escBuildConfigString(devInjectRefreshToken)}\"")
        buildConfigField("String", "DEV_INJECT_ROLE", "\"${escBuildConfigString(devInjectRole)}\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        buildConfig = true
    }
}

chaquopy {
    defaultConfig {
        version = "3.11"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.0")
    implementation("androidx.webkit:webkit:1.11.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.6")

    testImplementation("junit:junit:4.13.2")
}
