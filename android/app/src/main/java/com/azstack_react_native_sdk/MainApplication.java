package com.azstack_react_native_sdk;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.rnziparchive.RNZipArchivePackage;
import com.zxcpoiu.incallmanager.InCallManagerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.arttitude360.reactnative.rngoogleplaces.RNGooglePlacesPackage;
import com.terrylinla.rnsketchcanvas.SketchCanvasPackage;
import com.rnfs.RNFSPackage;
import com.rnim.rn.audio.ReactNativeAudioPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.reactnativedocumentpicker.ReactNativeDocumentPicker;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.oney.WebRTCModule.WebRTCModulePackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.evollu.react.fcm.FIRMessagingPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNZipArchivePackage(),
            new InCallManagerPackage(),
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

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
