package com.mytune.app

import android.content.Intent
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "BackgroundAudio")
class BackgroundAudioPlugin : Plugin() {

    @PluginMethod
    fun play(call: PluginCall) {
        val url = call.getString("url")
        val title = call.getString("title")
        val artist = call.getString("artist")

        if (url != null) {
            val intent = Intent(context, MusicPlayerService::class.java)
            intent.putExtra("url", url)
            intent.putExtra("title", title ?: "MyTune")
            intent.putExtra("artist", artist ?: "")

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
            call.resolve()
        } else {
            call.reject("Must provide a URL")
        }
    }

    @PluginMethod
    fun stop(call: PluginCall) {
        val intent = Intent(context, MusicPlayerService::class.java)
        context.stopService(intent)
        call.resolve()
    }
}
