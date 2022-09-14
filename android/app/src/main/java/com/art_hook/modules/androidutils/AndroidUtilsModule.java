package com.art_hook.modules.androidutils;

import android.widget.Toast;

import androidx.annotation.Nullable;

import com.art_hook.MainActivity;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nonnull;

public class AndroidUtilsModule extends ReactContextBaseJavaModule {
    ReactApplicationContext _reactContext;

    public AndroidUtilsModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
        _reactContext = reactContext;
    }

    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        return constants;
    }

    @Nonnull
    @Override
    public String getName() {
        return "AndroidUtils";
    }

    @ReactMethod
    public void showToast(String message) {
        Toast.makeText(MainActivity.getInstance(), message, Toast.LENGTH_LONG).show();
    }
}

