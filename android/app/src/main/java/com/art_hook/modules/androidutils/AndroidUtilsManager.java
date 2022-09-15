package com.art_hook.modules.androidutils;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Environment;
import android.util.Log;

import androidx.annotation.RequiresApi;

import com.art_hook.MainActivity;
import com.facebook.react.bridge.Promise;
import com.squareup.gifencoder.GifEncoder;
import com.squareup.gifencoder.ImageOptions;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.concurrent.TimeUnit;

public class AndroidUtilsManager {
    private static final AndroidUtilsManager instance = new AndroidUtilsManager();
    private String TAG = "AndroidUtilsManager";
    public static AndroidUtilsManager getInstance() {
        return instance;
    }
    private int MAX_RESOLUTION = 720;
    ArrayList<int[][]> rgbFrameArray = new ArrayList<>();
    private int pathsSize = 0;

    @RequiresApi(api = Build.VERSION_CODES.N)
    public void generateGif(String pathsString, String fileName, Promise promise) throws IOException {
        rgbFrameArray.clear();
        String[] paths = pathsString.split(",");

        pathsSize = paths.length;

        for (String path: paths){
            boolean needInvert = false;
            Bitmap bitmap;
            if(path.contains("file://")){
                //from camera
                Log.d(TAG, "generateGif path: "+ path.substring(6));
                bitmap = BitmapFactory.decodeFile(path.substring(6));
                needInvert = true;
            }else{
                //from picker
                InputStream ims = MainActivity.getInstance().getContentResolver().openInputStream(Uri.parse(path));
                bitmap = BitmapFactory.decodeStream(ims);
            }

            Log.d(TAG, "generateGif bitmap: " + bitmap);

            if (bitmap == null) {
                promise.reject("Failed to decode. Path is incorrect or image is corrupted");
                continue;
            }

//            if(bitmapWidth == 0 || bitmapHeight == 0){
//                int width = bitmap.getWidth();
//                int height = bitmap.getHeight();
//                if(width > height){
//                    bitmapWidth = MAX_RESOLUTION;
//                    bitmapHeight = (int) Math.floor(height * bitmapWidth/width);
//                }else{
//                    bitmapHeight = MAX_RESOLUTION;
//                    bitmapWidth = (int) Math.floor(width * bitmapHeight/height);
//                }
//            }

            RGBAsyncTask rgbAsyncTask = new RGBAsyncTask(this.pathsSize,fileName,needInvert, promise);
            rgbAsyncTask.execute(bitmap);
        }
    }

    public class RGBAsyncTask extends AsyncTask<Bitmap, Void, Void> {
        private int totalSize;
        Promise promise;
        String fileName;
        Boolean needInvert;
        public RGBAsyncTask(int totalSize,String fileName, Boolean needInvert, Promise promise){
            this.totalSize = totalSize;
            this.promise = promise;
            this.fileName= fileName;
            this.needInvert = needInvert;
        }

        @RequiresApi(api = Build.VERSION_CODES.N)
        @Override
        protected Void doInBackground(Bitmap... bitmaps) {
            Bitmap bitmap = bitmaps[0];
            bitmap = Bitmap.createScaledBitmap(bitmap, MAX_RESOLUTION, MAX_RESOLUTION, true);
            ArrayList<ArrayList<Integer>> rgbFramesForImage = new ArrayList<>();

            if(needInvert){
                for (int x =0; x < MAX_RESOLUTION; x++) {
                    ArrayList<Integer> rgbFrame = new ArrayList<>();
                    for (int y = 0; y < MAX_RESOLUTION; y++) {
                        int color = bitmap.getPixel(x, y);
                        rgbFrame.add(color);
                    }
                    rgbFramesForImage.add(rgbFrame);
                }

                int [][] rgbFramesForImageInts = rgbFramesForImage.stream().map(u -> u.stream().mapToInt(i->i).toArray()  ).toArray(int[][]::new);

                int[][] pivot = new int[rgbFramesForImageInts[0].length][];
                for (int row = 0; row < rgbFramesForImageInts[0].length; row++)
                    pivot[row] = new int[rgbFramesForImageInts.length];

                for (int row = 0; row < rgbFramesForImageInts.length; row++)
                    for (int col = 0; col < rgbFramesForImageInts[row].length; col++)
                        pivot[col][row] = rgbFramesForImageInts[row][col];

                rgbFrameArray.add(pivot);
            }else{
                for (int x = 0; x < MAX_RESOLUTION; x++) {
                    ArrayList<Integer> rgbFrame = new ArrayList<>();
                    for (int y = MAX_RESOLUTION - 1; y >= 0; y--) {
                        int color = bitmap.getPixel(x, y);
                        rgbFrame.add(color);
                    }
                    rgbFramesForImage.add(rgbFrame);
                }
                rgbFrameArray.add(rgbFramesForImage.stream().map(u -> u.stream().mapToInt(i->i).toArray()  ).toArray(int[][]::new));
            }

            Log.d(TAG, "doInBackground: " + rgbFrameArray.size());
            if(rgbFrameArray.size() == this.totalSize){
                File file = new File(Environment.getExternalStoragePublicDirectory(
                        Environment.DIRECTORY_DOWNLOADS), this.fileName);
                OutputStream outputStream = null;
                try {
                    outputStream = new FileOutputStream(file);
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                    promise.reject(new Throwable(e.getMessage()));
                }
                if(outputStream == null) return null;

                ImageOptions options = new ImageOptions();
                options.setDelay(1, TimeUnit.SECONDS);
                GifEncoder gifEncoder = null;
                try {
                  gifEncoder = new GifEncoder(outputStream, MAX_RESOLUTION, MAX_RESOLUTION, 0);
                } catch (IOException e) {
                    e.printStackTrace();
                    promise.reject(new Throwable(e.getMessage()));
                }
                if(gifEncoder == null) return null;
                for (int[][] rgbFrame : rgbFrameArray){
                    try {
                        gifEncoder.addImage(rgbFrame, options);
                    } catch (IOException e) {
                        e.printStackTrace();
                        promise.reject(new Throwable(e.getMessage()));
                    }
                }
                try {
                    gifEncoder.finishEncoding();
                    outputStream.close();
                    promise.resolve("file://"+file.getPath());
                } catch (IOException e) {
                    e.printStackTrace();
                    promise.reject(new Throwable(e.getMessage()));
                }
            }
            return null;
        }

        @Override
        protected void onPostExecute(Void unused) {
            super.onPostExecute(unused);
            Log.d(TAG, "onPostExecute: ");
        }
    }
}
