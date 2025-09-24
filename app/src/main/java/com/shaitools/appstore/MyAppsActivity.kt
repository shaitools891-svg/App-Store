package com.shaitools.appstore

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import android.widget.ImageButton
import android.content.Intent

class MyAppsActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_my_apps)

        val backButton: ImageButton = findViewById(R.id.backButton)
        val recyclerView: RecyclerView = findViewById(R.id.myAppsRecyclerView)

        backButton.setOnClickListener {
            finish()
        }

        recyclerView.layoutManager = LinearLayoutManager(this)

        val myApps = listOf(
            MyApp("Math ERROR Calculator", "Version 1.0.2", "https://example.com/math.apk"),
            MyApp("Geometry Solver", "Version 2.1.0", "https://example.com/geometry.apk"),
            MyApp("Algebra Tutor", "Version 1.5.3", "https://example.com/algebra.apk")
        )

        val adapter = MyAppAdapter(myApps) { app ->
            shareApp(app)
        }
        recyclerView.adapter = adapter
    }

    private fun shareApp(app: MyApp) {
        val shareIntent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_TEXT, "Check out ${app.name} - ${app.version}")
            type = "text/plain"
        }
        startActivity(Intent.createChooser(shareIntent, "Share via"))
    }
}