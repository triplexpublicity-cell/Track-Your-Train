package com.trackyourtrain.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import com.google.android.gms.location.LocationServices

class TrainLocationService : Service() {

    private val channelId = "train_location"

    override fun onCreate() {
        super.onCreate()

        val manager =
            getSystemService(NotificationManager::class.java)

        manager.createNotificationChannel(
            NotificationChannel(
                channelId,
                "Train Location",
                NotificationManager.IMPORTANCE_LOW
            )
        )

        val notification = Notification.Builder(this, channelId)
            .setContentTitle("Track Your Train")
            .setContentText("Live train tracking is active")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .build()

        startForeground(1001, notification)

        LocationServices
            .getFusedLocationProviderClient(this)
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int
    ): Int {
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}
