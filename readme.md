# 1. Installation

## Install package
```
    npm install --save azstack-react-native
```
## Install peer dependencies

## Linking Android

### android/settings.gradle
```groovy
    ...
    include ':react-native-device-info'
    project(':react-native-device-info').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-device-info/android')
    include ':react-native-fcm'
    project(':react-native-fcm').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-fcm/android')
    include ':react-native-maps'
    project(':react-native-maps').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-maps/lib/android')
    include ':react-native-google-places'
    project(':react-native-google-places').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-google-places/android')
    include ':@terrylinla/react-native-sketch-canvas'
    project(':@terrylinla/react-native-sketch-canvas').projectDir = new File(rootProject.projectDir, '../node_modules/@terrylinla/react-native-sketch-canvas/android')
    include ':react-native-fs'
    project(':react-native-fs').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-fs/android')
    include ':react-native-audio'
    project(':react-native-audio').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-audio/android')
    include ':react-native-image-crop-picker'
    project(':react-native-image-crop-picker').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-image-crop-picker/android')
    include ':react-native-video'
    project(':react-native-video').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-video/android')
    include ':react-native-document-picker'
    project(':react-native-document-picker').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-document-picker/android')
    include ':WebRTCModule', ':app'
    project(':WebRTCModule').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-webrtc/android')
    include ':react-native-maps'
    project(':react-native-maps').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-maps/lib/android')
```

### android/app/build.gradle
```groovy
    ...
    dependencies {
        ...
        compile project(':react-native-device-info')
        compile project(':react-native-fcm')
        compile project(':react-native-maps')
        compile project(':react-native-google-places')
        compile project(':@terrylinla/react-native-sketch-canvas')
        compile project(':react-native-fs')
        compile project(':react-native-audio')
        compile project(':react-native-image-crop-picker')
        compile project(':react-native-video')
        compile project(':react-native-document-picker')
        compile project(':WebRTCModule')
        ...
    }
```

### android/build.gradle
```groovy
    ...
    allprojects {
        repositories {
            maven { 
                url "https://jitpack.io" 
            }
        }
    }
```

### AndroidManifest.xml
```groovy
    ...
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" />
    <uses-feature android:name="android.hardware.camera.autofocus"/>

    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    ...

    ...
    <application>
        ...
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="<Your google api key to send location function>"/>
        <service android:name="com.evollu.react.fcm.MessagingService" android:enabled="true" android:exported="true">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT"/>
            </intent-filter>
        </service>

        <service android:name="com.evollu.react.fcm.InstanceIdService" android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.INSTANCE_ID_EVENT"/>
            </intent-filter>
        </service>
        ...
    </application>
    ...
```

### MainApplication.java
```
    import com.airbnb.android.react.maps.MapsPackage;
    import com.oney.WebRTCModule.WebRTCModulePackage;
    import com.evollu.react.fcm.FIRMessagingPackage;
    import com.learnium.RNDeviceInfo.RNDeviceInfo;
    import com.arttitude360.reactnative.rngoogleplaces.RNGooglePlacesPackage;
    import com.terrylinla.rnsketchcanvas.SketchCanvasPackage;
    import com.rnfs.RNFSPackage;
    import com.rnim.rn.audio.ReactNativeAudioPackage;
    import com.reactnative.ivpusic.imagepicker.PickerPackage;
    import com.brentvatne.react.ReactVideoPackage;
    import com.reactnativedocumentpicker.ReactNativeDocumentPicker;
   ...
   @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new RNDeviceInfo(),
                    new FIRMessagingPackage(),
                    new MapsPackage(),
                    new RNGooglePlacesPackage(),
                    new SketchCanvasPackage(),
                    new RNFSPackage(),
                    new ReactNativeAudioPackage(),
                    new PickerPackage(),
                    new ReactVideoPackage(),
                    new ReactNativeDocumentPicker(),
                    new WebRTCModulePackage()
            );
        }
```
```groovy
    ...
```


## IOS


# 2. Usage