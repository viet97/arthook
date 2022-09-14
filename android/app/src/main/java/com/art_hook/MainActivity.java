package com.art_hook;

import android.os.Bundle;
import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  private static MainActivity instance;

  public static MainActivity getInstance() {
    return instance;
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    instance = this;
  }

  @Override
  protected void onDestroy() {
    super.onDestroy();
    instance = null;
  }

  @Override
  protected String getMainComponentName() {
    return "art_hook";
  }
}
