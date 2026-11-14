package dev.couchtv.ontv

import android.os.Build
import org.json.JSONArray
import org.json.JSONObject

/**
 * Halal TV: cleaning the box. Switches off the maker's telemetry, ad and promo apps with
 * `pm disable-user --user 0`, through the TV's own ADB, and switches them back on again. Nothing is
 * uninstalled.
 *
 * What to switch off comes from CleanYourTV's tested lists (github.com/Gathin23/cleanyourtv, MIT,
 * built into assets www/clean/clean-index.json by scripts/gen-clean-index.py): the list for this
 * model when one matches its model or device code, otherwise only the packages many lists switch off
 * as telemetry or ads. Every package also passes couch-tv's own safety rules (tv-home/tools/apply.sh,
 * needed()): no home screen, setup app, remote, voice, keyboard, TV provider, core Android or
 * persistent process is ever switched off, whatever a list says.
 *
 * What Halal TV switched off is kept (Store "clean.off"), in order, so Restore switches exactly those
 * back on.
 */
object Clean {
    private const val KEY = "clean.off"
    @Volatile private var index: JSONObject? = null

    // tv-home/tools/apply.sh NEVER_OFF and needed(), kept the same here.
    private val NEVER_OFF = setOf("com.google.android.apps.tv.launcherx", "com.google.android.tvlauncher",
        "com.quickplay.android.bellmediaplayer", "com.google.android.tungsten.setupwraith",
        // and Halal TV's own additions: the photo screensaver, which has no replacement here
        "com.google.android.backdrop", "com.google.android.apps.tv.dreamx")
    private val NEEDED = Regex(
        "^(android|app\\.couchtv\\..*|dev\\.couchtv\\..*|com\\.android\\..*|com\\.google\\.android\\.gms|com\\.google\\.android\\.gsf|.*webview.*|" +
        "com\\.google\\.android\\.trichromelibrary|com\\.google\\.android\\.tv\\.remote\\.service|com\\.google\\.android\\.katniss|" +
        "com\\.google\\.android\\.permissioncontroller|com\\.google\\.android\\.packageinstaller|com\\.google\\.android\\.networkstack.*|" +
        "com\\.google\\.android\\.ext\\..*|com\\.google\\.android\\.providers\\..*|com\\.sony\\.dtv\\.sonysystemservice|com\\.sony\\.dtv\\.tvx|" +
        ".*setupwizard.*|.*\\.setup|.*provision.*|.*bluetooth.*|.*pair.*|.*\\.ble.*|.*remote.*|.*rcu.*|.*voice.*|.*assistant.*|.*katniss.*|" +
        ".*vizzini.*|.*cec.*|.*inputmethod.*|.*\\.ime|.*inputdevice.*|.*providers\\.tv.*|.*tvinput.*|.*tvprovider.*|.*listings.*|.*watchnext.*)$")
    // Core parts of Android CleanYourTV refuses too (tools/recovery.py CORE_RE), for the com.android.* cases
    // the pattern above already covers and the vendor ones it does not.
    private val CORE = Regex("^(com\\.cltv\\.mal|com\\.mediatek\\.(tis|tv\\.service|tv\\.agent)|com\\.droidlogic.*|mitv\\.service|com\\.xiaomi\\.android\\.tvsetup\\.partnercustomizer)$")

    private fun index(): JSONObject = index ?: synchronized(this) {
        index ?: JSONObject(Store.context().assets.open("www/clean/clean-index.json").bufferedReader().readText()).also { index = it }
    }

    fun off(): JSONArray = Store.str(KEY)?.let { runCatching { JSONArray(it) }.getOrNull() } ?: JSONArray()

    /** The list for this box: by model or device code, the closest Android version first. */
    private fun match(): JSONObject? {
        val model = Build.MODEL.uppercase(); val device = Build.DEVICE.uppercase(); val ver = Build.VERSION.RELEASE.substringBefore('.').toIntOrNull() ?: 0
        val models = index().getJSONArray("models")
        var best: JSONObject? = null; var bestScore = 0
        for (i in 0 until models.length()) {
            val m = models.getJSONObject(i)
            val tokens = m.optJSONArray("tokens") ?: continue
            var score = 0
            for (j in 0 until tokens.length()) { val t = tokens.optString(j); if (t == model) score += 4; if (t == device) score += 3 }
            if (score == 0) continue
            if (m.optInt("ver") == ver) score += 2
            if (score > bestScore) { bestScore = score; best = m }
        }
        return best
    }

    private fun safe(pkg: String, homes: Set<String>): Boolean =
        pkg !in NEVER_OFF && !NEEDED.matches(pkg) && !CORE.matches(pkg) && pkg !in homes

    private fun lines(cmd: String): Set<String> = Adb.shell(cmd, 20_000).lineSequence()
        .map { it.trim().removePrefix("package:").trim() }.filter { it.isNotEmpty() }.toSet()

    private fun homes(): Set<String> = Adb.shell("cmd package query-activities --brief -a android.intent.action.MAIN -c android.intent.category.HOME", 15_000)
        .lineSequence().map { it.trim().substringBefore('/') }.filter { it.contains('.') }.toSet()

    private fun persistent(pkg: String): Boolean =
        Regex("(pkgFlags|flags)=\\[[^]]*PERSISTENT").containsMatchIn(Adb.shell("dumpsys package $pkg", 15_000))

    /** What this box has from the matched list (or the common list), grouped, with what is already off. */
    fun info(): JSONObject {
        val out = JSONObject().put("model", Build.MODEL).put("device", Build.DEVICE).put("android", Build.VERSION.RELEASE)
            .put("source", index().optString("source")).put("off", off())
        if (!Adb.connected && !Adb.ensure()) return out.put("adb", false)
        out.put("adb", true)
        val present = lines("pm list packages"); val disabled = lines("pm list packages -d"); val homes = homes()
        val groups = JSONArray()
        val m = match()
        fun addGroup(title: String, kind: String, pkgs: List<Pair<String, String>>) {
            val arr = JSONArray()
            for ((p, note) in pkgs) {
                if (p !in present) continue
                if (!safe(p, homes)) continue
                arr.put(JSONObject().put("pkg", p).put("note", note).put("off", p in disabled))
            }
            if (arr.length() > 0) groups.put(JSONObject().put("title", title).put("kind", kind).put("pkgs", arr))
        }
        if (m != null) {
            out.put("list", JSONObject().put("id", m.optString("id")).put("tv", m.optString("tv")).put("os", m.optString("os")))
            val gs = m.getJSONArray("groups")
            for (i in 0 until gs.length()) {
                val g = gs.getJSONObject(i); if (g.optString("kind") == "skip") continue
                val ps = g.getJSONArray("pkgs")
                addGroup(g.optString("title"), g.optString("kind"), (0 until ps.length()).map { ps.getJSONArray(it).let { a -> a.optString(0) to a.optString(1) } })
            }
        } else {
            val c = index().getJSONArray("common")
            addGroup("Telemetry and ads (common to many TVs)", "track",
                (0 until c.length()).map { c.getJSONArray(it) }.filter { it.optInt(1) >= 10 }.map { it.optString(0) to it.optString(2) })
        }
        return out.put("groups", groups)
    }

    /** Switches off the given packages, in the order given, each checked again first. */
    fun apply(pkgs: JSONArray): JSONObject {
        if (!Adb.connected && !Adb.ensure()) throw ApiError(409, "Connect ADB first (Halal TV app, Connect ADB).")
        val known = HashSet<String>()
        val inf = info().optJSONArray("groups") ?: JSONArray()
        for (i in 0 until inf.length()) inf.getJSONObject(i).getJSONArray("pkgs").let { a -> for (j in 0 until a.length()) known.add(a.getJSONObject(j).getString("pkg")) }
        val homes = homes(); val disabled = lines("pm list packages -d")
        val rec = off(); val already = (0 until rec.length()).map { rec.optString(it) }.toMutableSet()
        val done = JSONArray(); val failed = JSONArray()
        for (i in 0 until pkgs.length()) {
            val p = pkgs.optString(i)
            if (p !in known || !safe(p, homes) || persistent(p)) { failed.put(JSONObject().put("pkg", p).put("why", "refused")); continue }
            if (p in disabled) continue
            val r = Adb.shell("pm disable-user --user 0 $p", 20_000)
            if (r.contains("disabled-user") || r.contains("new state: disabled")) {
                done.put(p); if (already.add(p)) rec.put(p)
            } else failed.put(JSONObject().put("pkg", p).put("why", r.trim().take(160)))
        }
        Store.putStr(KEY, rec.toString())
        return JSONObject().put("done", done).put("failed", failed).put("off", rec)
    }

    /** Switches back on everything Halal TV switched off, last first. */
    fun restore(): JSONObject {
        if (!Adb.connected && !Adb.ensure()) throw ApiError(409, "Connect ADB first (Halal TV app, Connect ADB).")
        val rec = off(); val back = JSONArray(); val left = JSONArray()
        for (i in rec.length() - 1 downTo 0) {
            val p = rec.optString(i)
            val r = Adb.shell("pm enable --user 0 $p", 20_000)
            if (r.contains("enabled")) back.put(p) else left.put(p)
        }
        Store.putStr(KEY, left.toString())
        return JSONObject().put("back", back).put("off", left)
    }
}
