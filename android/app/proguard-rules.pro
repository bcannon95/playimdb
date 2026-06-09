# WebView JS interface — keep if you add @JavascriptInterface methods later
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
