import CameraRoll from "@react-native-community/cameraroll";
import { NativeModules, PermissionsAndroid } from "react-native"

const NO_GALLERY_PERMISSION_ERROR = "EUNSPECIFIED"

const hasAndroidWriteFilePermission = async () => {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
        return true
    }

    const status = await PermissionsAndroid.request(permission)
    return status === 'granted'
}

export const checkWriteFilePermission = async () => {
    const isAndroidPermissionGranted = await hasAndroidWriteFilePermission()
    if (!isAndroidPermissionGranted) {
        NativeModules.AndroidUtils.showToast("No permission allow");
        return false
    }
    return true
}

export const savePhotoToAlbum = (path, onSuccess, onFailed) => {
    console.log("savePhotoToAlbum", path)
    CameraRoll.save(path, { type: "photo", album: "Arthook" })
        .then(() => {
            onSuccess && onSuccess(path)
            console.log("savePhotoToAlbum success")
        })
        .catch(async (e) => {
            console.error("savePhotoToAlbum error", e)
            onFailed && onFailed()
            const code = getValueFromObjectByKeys(e, ["code"])
            if (code === NO_GALLERY_PERMISSION_ERROR) {
                NativeModules.AndroidUtils.showToast("No permission allow");
            }
        })
}