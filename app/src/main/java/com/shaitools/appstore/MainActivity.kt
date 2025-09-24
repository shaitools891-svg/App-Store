package com.shaitools.appstore

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import android.app.DownloadManager
import android.net.Uri
import android.os.Environment
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Toast
import com.google.android.material.bottomnavigation.BottomNavigationView

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val profileButton: ImageButton = findViewById(R.id.profileButton)
        val searchEditText: EditText = findViewById(R.id.searchEditText)
        val featuredRecyclerView: RecyclerView = findViewById(R.id.featuredRecyclerView)
        val newReleasesRecyclerView: RecyclerView = findViewById(R.id.newReleasesRecyclerView)
        val myAppsRecyclerView: RecyclerView = findViewById(R.id.myAppsRecyclerView)
        val bottomNavigation: BottomNavigationView = findViewById(R.id.bottomNavigation)

        // Set up horizontal layout managers
        featuredRecyclerView.layoutManager = LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)
        newReleasesRecyclerView.layoutManager = LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)
        myAppsRecyclerView.layoutManager = LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)

        // Sample data
        val featuredApps = listOf(
            App("App Name 1", "Description of App 1", "https://example.com/app1.apk"),
            App("App Name 2", "Description of App 2", "https://example.com/app2.apk"),
            App("App Name 3", "Description of App 3", "https://example.com/app3.apk")
        )
        val newReleasesApps = listOf(
            App("App Name 4", "Category", "https://example.com/app4.apk"),
            App("App Name 5", "Category", "https://example.com/app5.apk"),
            App("App Name 6", "Category", "https://example.com/app6.apk"),
            App("App Name 7", "Category", "https://example.com/app7.apk")
        )
        val myApps = listOf(
            App("App Name 8", "Category", "https://example.com/app8.apk"),
            App("App Name 9", "Category", "https://example.com/app9.apk"),
            App("App Name 10", "Category", "https://example.com/app10.apk")
        )

        // Adapters
        val featuredAdapter = FeaturedAdapter(featuredApps) { app ->
            downloadApk(app)
        }
        featuredRecyclerView.adapter = featuredAdapter

        val appAdapter = AppAdapter(newReleasesApps) { app ->
            downloadApk(app)
        }
        newReleasesRecyclerView.adapter = appAdapter

        val myAppAdapter = AppAdapter(myApps) { app ->
            downloadApk(app)
        }
        myAppsRecyclerView.adapter = myAppAdapter

        // Bottom navigation
        bottomNavigation.setOnNavigationItemSelectedListener { item ->
            when (item.itemId) {
                R.id.navigation_home -> {
                    // Already home
                    true
                }
                R.id.navigation_my_apps -> {
                    // Navigate to my apps
                    true
                }
                R.id.navigation_search -> {
                    // Navigate to search
                    true
                }
                R.id.navigation_updates -> {
                    // Navigate to updates
                    true
                }
                else -> false
            }
        }
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