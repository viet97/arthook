package com.art_hook.modules.androidutils;


public class AndroidUtilsManager {
    private static final AndroidUtilsManager instance = new AndroidUtilsManager();
    private String TAG = "AndroidUtilsManager";

    public static AndroidUtilsManager getInstance() {
        return instance;
    }

}
