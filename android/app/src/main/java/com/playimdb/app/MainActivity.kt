package com.playimdb.app

import android.annotation.SuppressLint
import android.graphics.Rect
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var container: FrameLayout
    private var fullscreenView: View? = null
    private var fullscreenCallback: WebChromeClient.CustomViewCallback? = null
    private var softKeyboardVisible = false

    companion object {
        const val SITE_URL = "https://imdfree.netlify.app/"

        // Arrow keys — injected as KeyboardEvents so useTvNav can move focus
        val DPAD_ARROWS = mapOf(
            KeyEvent.KEYCODE_DPAD_LEFT  to "ArrowLeft",
            KeyEvent.KEYCODE_DPAD_RIGHT to "ArrowRight",
            KeyEvent.KEYCODE_DPAD_UP    to "ArrowUp",
            KeyEvent.KEYCODE_DPAD_DOWN  to "ArrowDown",
        )

        // Select/Enter — fire .click() so React onClick handlers and links activate.
        // A synthetic KeyboardEvent for Enter does NOT trigger onClick on buttons/anchors.
        val ENTER_KEYS = setOf(KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER)
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
                // Spoof Chrome on Android TV so streaming sites don't block WebView
                userAgentString = "Mozilla/5.0 (Linux; Android 9; AFTMM Build/PS7233) " +
                    "AppleWebKit/537.36 (KHTML, like Gecko) " +
                    "Chrome/120.0.0.0 Mobile Safari/537.36"
            }

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView,
                    request: WebResourceRequest
                ): Boolean {
                    // Load all URLs inside the WebView — media sites included
                    view.loadUrl(request.url.toString())
                    return true
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onShowCustomView(view: View, callback: CustomViewCallback) {
                    fullscreenView = view
                    fullscreenCallback = callback
                    webView.visibility = View.GONE
                    container.addView(view, FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.MATCH_PARENT
                    ))
                    hideSystemUI()
                }

                override fun onHideCustomView() {
                    fullscreenView?.let { container.removeView(it) }
                    fullscreenCallback?.onCustomViewHidden()
                    fullscreenView = null
                    fullscreenCallback = null
                    webView.visibility = View.VISIBLE
                    hideSystemUI()
                }
            }

            isFocusable = true
            isFocusableInTouchMode = true

            loadUrl(SITE_URL)
        }

        container = FrameLayout(this).apply {
            addView(webView, FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            ))
        }

        setContentView(container)
        hideSystemUI()

        // Detect soft keyboard visibility so we don't intercept D-pad while
        // the user is navigating the on-screen keyboard to type in search
        container.viewTreeObserver.addOnGlobalLayoutListener {
            val rect = Rect()
            container.getWindowVisibleDisplayFrame(rect)
            val keypadHeight = container.rootView.height - rect.bottom
            softKeyboardVisible = keypadHeight > container.rootView.height * 0.15
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) hideSystemUI()
    }

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

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (event.action == KeyEvent.ACTION_DOWN && !softKeyboardVisible) {
            // Enter/Select: fire .click() on the focused element.
            // A synthetic KeyboardEvent('keydown', {key:'Enter'}) does NOT trigger
            // onClick on buttons or anchor tags — only a real click does.
            if (event.keyCode in ENTER_KEYS) {
                webView.evaluateJavascript(
                    "(document.activeElement||document.body).click()",
                    null
                )
                return true
            }

            // Arrow keys: inject KeyboardEvent so useTvNav moves focus.
            // Return true to stop WebView consuming them natively (scroll/internal focus).
            val jsKey = DPAD_ARROWS[event.keyCode]
            if (jsKey != null) {
                webView.evaluateJavascript(
                    "(document.activeElement||document.body).dispatchEvent(" +
                    "new KeyboardEvent('keydown',{key:'$jsKey',bubbles:true,cancelable:true}))",
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
