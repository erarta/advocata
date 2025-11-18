# Yandex Maps Integration Setup Guide

## Overview

This guide explains how to integrate Yandex MapKit into the Advocata mobile app. Yandex Maps is used instead of Google Maps for better Russia market compliance and superior local mapping data.

## Why Yandex Maps?

1. **Russia Compliance**: Better compliance with Russian data localization laws (152-ФЗ)
2. **Superior Coverage**: Excellent mapping data for Russia and CIS countries
3. **Local Features**: Better address search and geocoding for Russian addresses
4. **Cost**: More competitive pricing for Russian market

## Prerequisites

- Flutter SDK 3.2.0 or higher
- Yandex Developer Account
- Android Studio / Xcode for native configuration

## Step 1: Get Yandex MapKit API Key

### 1.1 Create Developer Account

1. Go to [Yandex Developer Console](https://developer.tech.yandex.ru/)
2. Sign in with Yandex account (create one if needed)
3. Accept terms of service

### 1.2 Create Application

1. Click "Create App" or "Создать приложение"
2. Fill in application details:
   - **Name**: Advocata Mobile App
   - **Description**: Legal services marketplace mobile application
   - **Platform**: Select "Mobile" / "Android & iOS"

### 1.3 Get API Keys

1. Navigate to "MapKit" section
2. Enable MapKit API
3. Generate API keys:
   - **Android**: Generate key and note it down
   - **iOS**: Generate separate key for iOS

**Important**: Keep these keys secure and never commit them to version control.

## Step 2: Install Yandex MapKit Package

### 2.1 Update pubspec.yaml

```yaml
dependencies:
  flutter:
    sdk: flutter

  # Maps - Yandex MapKit for Russia
  yandex_mapkit: ^4.0.0

  # Location services
  geolocator: ^10.1.0
  geocoding: ^3.0.0
```

### 2.2 Install Dependencies

```bash
cd apps/mobile
flutter pub get
```

## Step 3: Android Configuration

### 3.1 Update AndroidManifest.xml

Location: `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.erarta.advocata">

    <!-- Permissions for location and maps -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>

    <application
        android:label="Advocata"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher">

        <!-- Add Yandex MapKit API key -->
        <meta-data
            android:name="com.yandex.mapkit.ApiKey"
            android:value="YOUR_ANDROID_API_KEY_HERE"/>

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">

            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme"/>

            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>

        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>
```

### 3.2 Update build.gradle

Location: `android/app/build.gradle`

```gradle
android {
    compileSdkVersion 34

    defaultConfig {
        applicationId "com.erarta.advocata"
        minSdkVersion 21  // Yandex MapKit requires min SDK 21
        targetSdkVersion 34
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
        multiDexEnabled true  // Required for Yandex MapKit
    }

    buildTypes {
        release {
            signingConfig signingConfigs.debug
            minifyEnabled false
        }
    }
}

dependencies {
    implementation 'androidx.multidex:multidex:2.0.1'
}
```

### 3.3 Update MainActivity

Location: `android/app/src/main/kotlin/com/erarta/advocata/MainActivity.kt`

```kotlin
package com.erarta.advocata

import io.flutter.embedding.android.FlutterActivity
import com.yandex.mapkit.MapKitFactory

class MainActivity: FlutterActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        MapKitFactory.setApiKey("YOUR_ANDROID_API_KEY_HERE")
    }
}
```

## Step 4: iOS Configuration

### 4.1 Update Info.plist

Location: `ios/Runner/Info.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Existing keys... -->

    <!-- Location permissions -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Advocata needs your location to find nearby lawyers for emergency calls</string>

    <key>NSLocationAlwaysUsageDescription</key>
    <string>Advocata needs your location to provide emergency legal assistance</string>

    <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
    <string>Advocata needs your location to find nearby lawyers</string>

    <!-- Yandex MapKit API key -->
    <key>YandexMapKitAPIKey</key>
    <string>YOUR_IOS_API_KEY_HERE</string>
</dict>
</plist>
```

### 4.2 Update Podfile

Location: `ios/Podfile`

```ruby
platform :ios, '13.0'

target 'Runner' do
  use_frameworks!
  use_modular_headers!

  flutter_install_all_ios_pods File.dirname(File.realpath(__FILE__))

  # Yandex MapKit
  pod 'YandexMapsMobile', '4.0.0'
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)

    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
    end
  end
end
```

### 4.3 Install Pods

```bash
cd ios
pod install
cd ..
```

### 4.4 Update AppDelegate

Location: `ios/Runner/AppDelegate.swift`

```swift
import UIKit
import Flutter
import YandexMapsMobile

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {

    // Initialize Yandex MapKit
    if let apiKey = Bundle.main.object(forInfoDictionaryKey: "YandexMapKitAPIKey") as? String {
      YMKMapKit.setApiKey(apiKey)
    }

    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

## Step 5: Environment Variables

### 5.1 Create .env File

Location: `apps/mobile/.env`

```bash
# Yandex MapKit API Keys
YANDEX_MAPKIT_ANDROID_KEY=your_android_api_key_here
YANDEX_MAPKIT_IOS_KEY=your_ios_api_key_here

# Yandex Geocoder API Key (for address search)
YANDEX_GEOCODER_API_KEY=your_geocoder_api_key_here

# Backend API
API_BASE_URL=http://localhost:3000
```

### 5.2 Update .gitignore

```
# Environment files
.env
.env.local
.env.*.local

# API keys (DO NOT COMMIT)
**/apikeys.properties
```

## Step 6: Initialize MapKit in App

Location: `apps/mobile/lib/main.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:yandex_mapkit/yandex_mapkit.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables
  await dotenv.load(fileName: ".env");

  // Initialize Yandex MapKit
  AndroidYandexMap.useAndroidViewSurface = false; // Better performance

  runApp(
    const ProviderScope(
      child: AdvocataApp(),
    ),
  );
}

class AdvocataApp extends StatelessWidget {
  const AdvocataApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Advocata',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
```

## Step 7: Basic Map Implementation

### 7.1 Simple Map Widget

```dart
import 'package:flutter/material.dart';
import 'package:yandex_mapkit/yandex_mapkit.dart';

class SimpleMapScreen extends StatefulWidget {
  const SimpleMapScreen({super.key});

  @override
  State<SimpleMapScreen> createState() => _SimpleMapScreenState();
}

class _SimpleMapScreenState extends State<SimpleMapScreen> {
  late YandexMapController _mapController;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Yandex Map')),
      body: YandexMap(
        onMapCreated: (controller) {
          _mapController = controller;

          // Move camera to St. Petersburg
          _mapController.moveCamera(
            CameraUpdate.newCameraPosition(
              const CameraPosition(
                target: Point(latitude: 59.9311, longitude: 30.3609),
                zoom: 12,
              ),
            ),
          );
        },
        mapObjects: [
          PlacemarkMapObject(
            mapId: const MapObjectId('user_location'),
            point: const Point(latitude: 59.9311, longitude: 30.3609),
            icon: PlacemarkIcon.single(
              PlacemarkIconStyle(
                image: BitmapDescriptor.fromAssetImage('assets/icons/marker.png'),
                scale: 0.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

## Step 8: Testing

### 8.1 Test on Android

```bash
flutter run -d <android_device_id>
```

### 8.2 Test on iOS

```bash
flutter run -d <ios_device_id>
```

### 8.3 Check Map Loads

1. App should request location permission
2. Map should display with markers
3. Tap on map should register
4. Zoom controls should work

## Common Issues & Solutions

### Issue 1: "Invalid API Key"

**Solution:**
- Double-check API key in AndroidManifest.xml / Info.plist
- Ensure key is for correct platform (Android/iOS)
- Verify key is enabled in Yandex Console

### Issue 2: Map Not Displaying

**Solution:**
```dart
// Add this to MainActivity.kt
MapKitFactory.setLocale("ru_RU")  // Set locale
```

### Issue 3: Location Permission Denied

**Solution:**
```dart
// Request permissions explicitly
import 'package:geolocator/geolocator.dart';

Future<void> requestPermission() async {
  LocationPermission permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) {
    permission = await Geolocator.requestPermission();
  }
}
```

### Issue 4: Build Errors on iOS

**Solution:**
```bash
cd ios
pod deintegrate
pod install
cd ..
flutter clean
flutter pub get
flutter run
```

## API Limits

### Free Tier Limits
- **Map Views**: 25,000 per day
- **Geocoding**: 25,000 requests per day
- **Routing**: 25,000 requests per day

### Paid Tier
- Contact Yandex for enterprise pricing
- Higher limits
- SLA guarantees

## Best Practices

1. **Cache Map Tiles**: Cache tiles for offline use
2. **Optimize Markers**: Use clustering for many markers
3. **Lazy Load**: Only load map when needed
4. **Rate Limiting**: Implement request throttling
5. **Error Handling**: Always handle API errors gracefully

## Security

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Implement key rotation** periodically
4. **Monitor usage** for unusual patterns
5. **Use ProGuard** (Android) to obfuscate keys

## Additional Resources

- [Yandex MapKit Documentation](https://yandex.ru/dev/maps/mapkit/)
- [Flutter Yandex MapKit Package](https://pub.dev/packages/yandex_mapkit)
- [Yandex Geocoding API](https://yandex.ru/dev/maps/geocoder/)
- [Sample Projects](https://github.com/Unact/yandex_mapkit)

## Support

For issues:
- Yandex Support: https://yandex.ru/support/maps/
- Flutter Package Issues: https://github.com/Unact/yandex_mapkit/issues
- Advocata Team: modera@erarta.ai

---

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: Production Ready
