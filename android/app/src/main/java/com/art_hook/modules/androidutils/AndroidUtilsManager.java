package com.art_hook.modules.androidutils;


import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;

import androidx.annotation.RequiresApi;

import com.art_hook.MainActivity;
import com.facebook.react.bridge.Promise;
import com.squareup.gifencoder.GifEncoder;
import com.squareup.gifencoder.Image;
import com.squareup.gifencoder.ImageOptions;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;

public class AndroidUtilsManager {
    private static final AndroidUtilsManager instance = new AndroidUtilsManager();
    private String TAG = "AndroidUtilsManager";
    public static AndroidUtilsManager getInstance() {
        return instance;
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    public void generateGif(String pathsString, Promise promise) throws IOException {
        String[] paths = pathsString.split(",");
        Log.d(TAG, "generateGif: " + paths.length + " : " + pathsString);

        ArrayList<int[][]> rgbFrameArray = new ArrayList<>();
        for (String path: paths){
            ArrayList<ArrayList<Integer>> rgbFramesForImage = new ArrayList();
            InputStream ims = MainActivity.getInstance().getContentResolver().openInputStream(Uri.parse(path));

            Bitmap bitmap = BitmapFactory.decodeStream(ims);
            Log.d(TAG, "generateGif bit map: " +path + " : " + bitmap);

            if (bitmap == null) {
                promise.reject("Failed to decode. Path is incorrect or image is corrupted");
                continue;
            }

            int width = bitmap.getWidth();
            int height = bitmap.getHeight();

            if(width > 720 || height > 720){
                bitmap = Bitmap.createScaledBitmap(bitmap, 720, 720, true);
                width = bitmap.getWidth();
                height = bitmap.getHeight();
            }

            for (int x = 0; x < width; x++) {
                ArrayList<Integer> rgbFrame = new ArrayList<>();
                for (int y = 0; y < height; y++) {
                    int color = bitmap.getPixel(x, y);
                    rgbFrame.add(Math.abs(color));
                }
                rgbFramesForImage.add(rgbFrame);
            }

            int[][] rgbFramesForImageInts =  rgbFramesForImage.stream().map(u -> u.stream().mapToInt(i->i).toArray()  ).toArray(int[][]::new);
            rgbFrameArray.add(rgbFramesForImageInts);
        }


        File file = new File(Environment.getExternalStoragePublicDirectory(
                Environment.DIRECTORY_DOWNLOADS), "test.gif");
        OutputStream outputStream = new FileOutputStream(file);
        ImageOptions options = new ImageOptions();

        Image image = Image.fromRgb(rgbFrameArray.get(0));

        GifEncoder gifEncoder = new GifEncoder(outputStream, 720, 720, 0);
        for (int[][] rgbFrame : rgbFrameArray){
            gifEncoder.addImage(rgbFrame, options);
        }
        gifEncoder.finishEncoding();
        outputStream.close();
        promise.resolve("");

    }
}
