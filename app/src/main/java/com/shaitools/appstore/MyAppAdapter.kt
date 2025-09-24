import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class MyAppAdapter(private val apps: List<MyApp>, private val onShareClick: (MyApp) -> Unit) : RecyclerView.Adapter<MyAppAdapter.MyAppViewHolder>() {

    class MyAppViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val appIcon: ImageView = itemView.findViewById(R.id.appIcon)
        val appName: TextView = itemView.findViewById(R.id.appName)
        val appVersion: TextView = itemView.findViewById(R.id.appVersion)
        val shareButton: Button = itemView.findViewById(R.id.shareButton)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyAppViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_my_app, parent, false)
        return MyAppViewHolder(view)
    }

    override fun onBindViewHolder(holder: MyAppViewHolder, position: Int) {
        val app = apps[position]
        holder.appName.text = app.name
        holder.appVersion.text = app.version
        holder.shareButton.setOnClickListener { onShareClick(app) }
    }

    override fun getItemCount() = apps.size
}