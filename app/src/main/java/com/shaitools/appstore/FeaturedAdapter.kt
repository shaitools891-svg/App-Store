import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class FeaturedAdapter(private val apps: List<App>, private val onAppClick: (App) -> Unit) : RecyclerView.Adapter<FeaturedAdapter.FeaturedViewHolder>() {

    class FeaturedViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val appImage: ImageView = itemView.findViewById(R.id.appImage)
        val appName: TextView = itemView.findViewById(R.id.appName)
        val appDescription: TextView = itemView.findViewById(R.id.appDescription)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FeaturedViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_featured, parent, false)
        return FeaturedViewHolder(view)
    }

    override fun onBindViewHolder(holder: FeaturedViewHolder, position: Int) {
        val app = apps[position]
        holder.appName.text = app.name
        holder.appDescription.text = app.description
        holder.itemView.setOnClickListener { onAppClick(app) }
    }

    override fun getItemCount() = apps.size
}