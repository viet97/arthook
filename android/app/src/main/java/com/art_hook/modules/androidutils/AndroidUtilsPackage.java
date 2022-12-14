package com.art_hook.modules.androidutils;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.annotation.Nonnull;

public class AndroidUtilsPackage implements ReactPackage {
    public AndroidUtilsPackage() {
        super();
    }

    @Nonnull
    @Override
    public List<NativeModule> createNativeModules(@Nonnull ReactApplicationContext reactContext) {
        List<NativeModule> list =new ArrayList<>();
        list.add(new AndroidUtilsModule(reactContext));
        return list;
    }

    @Nonnull
    @Override
    public List<ViewManager> createViewManagers(@Nonnull ReactApplicationContext reactContext) {
        return Arrays.<ViewManager>asList();
    }
}