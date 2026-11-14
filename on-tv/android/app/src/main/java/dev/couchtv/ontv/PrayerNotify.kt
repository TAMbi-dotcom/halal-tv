package dev.couchtv.ontv

import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONArray

/**
 * Halal TV: the prayer note over whatever is on screen (YouTube, a film, Settings).
 *
 * The home page works the times out (prayer.js, with the method, madhab and offsets chosen in Home
 * settings) and hands this app the next day's notes through POST /api/prayer: [{at: epoch ms,
 * text}]. BridgeService, which stays running, looks every 15 seconds and shows each note once, for
 * ten seconds, as a small card at the top right, drawn over other apps (the SYSTEM_ALERT_WINDOW
 * permission, which this app gives itself over its own ADB on Connect ADB). While the home itself is
 * on screen the page shows the note, so this stays quiet. No sound.
 */
object PrayerNotify {
    private const val KEY = "prayer.schedule"
    private const val TAG = "halaltv"
    private val main = Handler(Looper.getMainLooper())
    private val fired = HashSet<Long>()
    @Volatile private var started = false

    fun save(items: JSONArray) {
        val clean = JSONArray()
        for (i in 0 until minOf(items.length(), 40)) {
            val o = items.optJSONObject(i) ?: continue
            val at = o.optLong("at"); val text = o.optString("text").take(120)
            if (at > 0 && text.isNotBlank()) clean.put(org.json.JSONObject().put("at", at).put("text", text))
        }
        Store.putStr(KEY, clean.toString())
    }

    fun start(c: Context) {
        if (started) return
        started = true
        val ctx = c.applicationContext
        val tick = object : Runnable {
            override fun run() {
                runCatching { check(ctx) }.onFailure { Log.w(TAG, "prayer note", it) }
                main.postDelayed(this, 15_000)
            }
        }
        main.postDelayed(tick, 5_000)
    }

    private fun check(ctx: Context) {
        val list = Store.str(KEY)?.let { runCatching { JSONArray(it) }.getOrNull() } ?: return
        val now = System.currentTimeMillis()
        for (i in 0 until list.length()) {
            val o = list.optJSONObject(i) ?: continue
            val at = o.optLong("at")
            if (now < at || now - at > 90_000 || at in fired) continue
            fired.add(at)
            if (fired.size > 200) fired.clear()
            if (App.inForeground) continue          // the home page shows its own note
            show(ctx, o.optString("text"))
        }
    }

    private fun dp(ctx: Context, v: Float) = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, ctx.resources.displayMetrics).toInt()

    fun show(ctx: Context, text: String) {
        if (!Settings.canDrawOverlays(ctx)) { Log.i(TAG, "prayer note not shown: no permission to draw over apps"); return }
        val wm = ctx.getSystemService(WindowManager::class.java) ?: return
        val card = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(ctx, 18f), dp(ctx, 12f), dp(ctx, 22f), dp(ctx, 12f))
            background = GradientDrawable().apply {
                cornerRadius = dp(ctx, 18f).toFloat()
                setColor(Color.argb(232, 14, 18, 30))
                setStroke(dp(ctx, 1f), Color.argb(150, 236, 201, 128))
            }
            addView(TextView(ctx).apply {
                this.text = "☾"
                setTextColor(Color.rgb(236, 201, 128))
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 22f)
                setPadding(0, 0, dp(ctx, 12f), 0)
            })
            addView(TextView(ctx).apply {
                this.text = text
                setTextColor(Color.WHITE)
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f)
                textDirection = View.TEXT_DIRECTION_FIRST_STRONG
            })
        }
        @Suppress("DEPRECATION")
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else WindowManager.LayoutParams.TYPE_PHONE
        val lp = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT, WindowManager.LayoutParams.WRAP_CONTENT, type,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.END
            x = dp(ctx, 32f); y = dp(ctx, 28f)
        }
        main.post {
            runCatching {
                wm.addView(card, lp)
                main.postDelayed({ runCatching { wm.removeView(card) } }, 10_000)
            }.onFailure { Log.w(TAG, "prayer note", it) }
        }
    }
}
