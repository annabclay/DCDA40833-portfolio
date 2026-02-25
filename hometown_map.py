import folium
import pandas as pd
import requests

# --- Mapbox credentials ---
access_token = "pk.eyJ1IjoiYW5uYWJjbGF5IiwiYSI6ImNtbHRxbngxMDAzNWUzZG9xbnBvZXp4eWoifQ.k7BrVAlR-JiP_Y7yLIp7sw"
mapbox_username = "annabclay"
style_id = "cmm2el98o007701s10r4i2sbh"

# Custom Mapbox tile URL
tiles = f"https://api.mapbox.com/styles/v1/{mapbox_username}/{style_id}/tiles/256/{{z}}/{{x}}/{{y}}@2x?access_token={access_token}"
attr = "Mapbox"

# --- Read CSV file ---
df = pd.read_csv("hometown_locations.csv")
print(f"Loaded {len(df)} locations from CSV")
print(df[["Name", "Type"]].to_string(index=False))

# --- Color mapping for each location type ---
type_colors = {
    "Restaurant": "red",
    "Cultural": "purple",
    "Park": "green",
    "Historical": "darkred",
    "Recreation": "blue",
    "Neighborhood": "orange",
    "Local Business": "cadetblue",
}

# --- Icon mapping for each location type ---
type_icons = {
    "Restaurant": "cutlery",
    "Cultural": "star",
    "Park": "tree-deciduous",
    "Historical": "tower",
    "Recreation": "futbol-o",
    "Neighborhood": "home",
    "Local Business": "shopping-cart",
}


# --- Geocode function using Mapbox Geocoding API ---
def geocode_address(address):
    """Convert an address to latitude/longitude using the Mapbox Geocoding API."""
    geocode_url = f"https://api.mapbox.com/search/geocode/v6/forward?q={address}&access_token={access_token}"
    response = requests.get(geocode_url)
    data = response.json()

    if data.get("features") and len(data["features"]) > 0:
        coords = data["features"][0]["geometry"]["coordinates"]
        # Mapbox returns [longitude, latitude], Folium needs [latitude, longitude]
        return coords[1], coords[0]
    else:
        print(f"  ⚠️  Could not geocode: {address}")
        return None, None


# --- Geocode all locations ---
print("\nGeocoding addresses...")
latitudes = []
longitudes = []

for _, row in df.iterrows():
    lat, lon = geocode_address(row["Address"])
    latitudes.append(lat)
    longitudes.append(lon)
    if lat and lon:
        print(f"  ✅ {row['Name']}: ({lat:.4f}, {lon:.4f})")

df["Latitude"] = latitudes
df["Longitude"] = longitudes

# Drop any rows that failed to geocode
df = df.dropna(subset=["Latitude", "Longitude"])
print(f"\nSuccessfully geocoded {len(df)} locations")

# --- Create the Folium map centered on Lexington, KY ---
center_lat = df["Latitude"].mean()
center_lon = df["Longitude"].mean()

m = folium.Map(
    location=[center_lat, center_lon],
    zoom_start=13,
    tiles=tiles,
    attr=attr,
)

# --- Add markers for each location ---
for _, row in df.iterrows():
    # Get color and icon based on location type
    color = type_colors.get(row["Type"], "gray")
    icon = type_icons.get(row["Type"], "info-sign")

    # Build the popup HTML with name, description, and image
    popup_html = f"""
    <div style="width:280px; font-family:Arial, sans-serif;">
        <h3 style="margin:0 0 8px 0; color:#333;">{row['Name']}</h3>
        <p style="margin:0 0 6px 0; font-size:12px; color:#888;">
            <b>{row['Type']}</b>
        </p>
        <p style="margin:0 0 10px 0; font-size:13px; color:#555;">
            {row['Description']}
        </p>
        <img src="{row['Image_URL']}" alt="{row['Name']}"
             style="width:100%; height:auto; border-radius:6px;"
             onerror="this.style.display='none'">
    </div>
    """

    folium.Marker(
        location=[row["Latitude"], row["Longitude"]],
        popup=folium.Popup(popup_html, max_width=300),
        tooltip=row["Name"],
        icon=folium.Icon(color=color, icon=icon, prefix="glyphicon"),
    ).add_to(m)

# --- Add a legend to the map ---
legend_html = """
<div style="position:fixed; bottom:30px; left:30px; z-index:1000;
     background:white; padding:12px 16px; border-radius:8px;
     box-shadow:0 2px 8px rgba(0,0,0,0.2); font-family:Arial, sans-serif;
     font-size:13px;">
    <b style="font-size:14px;">Location Types</b><br>
    <span style="color:red;">●</span> Restaurant<br>
    <span style="color:purple;">●</span> Cultural<br>
    <span style="color:green;">●</span> Park<br>
    <span style="color:darkred;">●</span> Historical<br>
    <span style="color:blue;">●</span> Recreation<br>
    <span style="color:orange;">●</span> Neighborhood<br>
    <span style="color:cadetblue;">●</span> Local Business
</div>
"""
m.get_root().html.add_child(folium.Element(legend_html))

# --- Save the map as an HTML file ---
output_file = "hometown_map.html"
m.save(output_file)
print(f"\n🗺️  Map saved to {output_file}")
