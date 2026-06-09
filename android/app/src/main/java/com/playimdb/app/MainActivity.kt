package com.playimdb.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var fullscreenView: View? = null
    private var fullscreenCallback: WebChromeClient.CustomViewCallback? = null

    companion object {
        const val SITE_URL = "https://imdfree.netlify.app/"

        // Maps Android D-pad keycodes to the JS key names our useTvNav hook expects
        val DPAD_TO_JS = mapOf(
            KeyEvent.KEYCODE_DPAD_LEFT   to "ArrowLeft",
            KeyEvent.KEYCODE_DPAD_RIGHT  to "ArrowRight",
            KeyEvent.KEYCODE_DPAD_UP     to "ArrowUp",
            KeyEvent.KEYCODE_DPAD_DOWN   to "ArrowDown",
            KeyEvent.KEYCODE_DPAD_CENTER to "Enter",
            KeyEvent.KEYCODE_ENTER       to "Enter"
        )
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            with(settings) {
                javaScriptEnabled = true
                domStorageEnabled = true
                loadWithOverviewMode = true
                useWideViewPort = true
                cacheMode = WebSettings.LOAD_DEFAULT
                mediaPlaybackRequiresUserGesture = false
            }

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView,
                    request: WebResourceRequest
                ): Boolean {
                    view.loadUrl(request.url.toString())
                    return true
                }
            }

            // Required for video frames to render
            webChromeClient = object : WebChromeClient() {
                override fun onShowCustomView(view: View, callback: CustomViewCallback) {
                    fullscreenView = view
                    fullscreenCallback = callback
                    setContentView(view)
                    hideSystemUI()
                }

                override fun onHideCustomView() {
                    fullscreenCallback?.onCustomViewHidden()
                    fullscreenView = null
                    fullscreenCallback = null
                    setContentView(webView)
                    hideSystemUI()
                }
            }

            isFocusable = true
            isFocusableInTouchMode = true

            loadUrl(SITE_URL)
        }

        setContentView(webView)
        hideSystemUI()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) hideSystemUI()
    }

    // Back button: exit fullscreen video first, then web history, then exit app
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            if (fullscreenView != null) {
                webView.webChromeClient?.onHideCustomView()
                return true
            }
            if (webView.canGoBack()) {
                webView.goBack()
                return true
            }
        }
        return super.onKeyDown(keyCode, event)
    }

    // Intercept D-pad events and inject them as JS KeyboardEvents so useTvNav
    // receives proper ArrowKey events instead of WebView consuming them natively.
    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (event.action == KeyEvent.ACTION_DOWN) {
            val jsKey = DPAD_TO_JS[event.keyCode]
            if (jsKey != null) {
                webView.evaluateJavascript(
                    "window.dispatchEvent(new KeyboardEvent('keydown'," +
                    "{key:'$jsKey',bubbles:true,cancelable:true}))",
                    null
                )
                return true
            }
        }
        return super.dispatchKeyEvent(event)
    }

    private fun hideSystemUI() {
        @Suppress("DEPRECATION")
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_FULLSCREEN
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        )
    }
}
