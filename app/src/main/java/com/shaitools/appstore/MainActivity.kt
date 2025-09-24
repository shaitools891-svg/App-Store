package com.shaitools.appstore

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import android.app.DownloadManager
import android.net.Uri
import android.os.Environment
import android.widget.Toast

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val recyclerView: RecyclerView = findViewById(R.id.recyclerView)
        recyclerView.layoutManager = LinearLayoutManager(this)

        val apps = listOf(
            App("Sample App 1", "Description 1", "https://example.com/app1.apk"),
            App("Sample App 2", "Description 2", "https://example.com/app2.apk")
        )

        val adapter = AppAdapter(apps) { app ->
            downloadApk(app)
        }
        recyclerView.adapter = adapter
    }

    private fun downloadApk(app: App) {
        val request = DownloadManager.Request(Uri.parse(app.apkUrl))
        request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "${app.name}.apk")
        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
        val downloadManager = getSystemService(DOWNLOAD_SERVICE) as DownloadManager
        downloadManager.enqueue(request)
        Toast.makeText(this, "Downloading ${app.name}", Toast.LENGTH_SHORT).show()
    }
}