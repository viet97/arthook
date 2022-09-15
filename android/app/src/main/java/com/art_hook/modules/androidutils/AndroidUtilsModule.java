package com.art_hook.modules.androidutils;

import android.os.Build;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import com.art_hook.MainActivity;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.FileNotFoundException;
import java.io.IOException;
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
    public void showToast(String message, Promise promise) {
        Toast.makeText(MainActivity.getInstance(), message, Toast.LENGTH_LONG).show();
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    @ReactMethod
    public void generateGif(String pathsString, String fileName, Promise promise) throws IOException {
        AndroidUtilsManager.getInstance().generateGif(pathsString, fileName, promise);
    }
}

