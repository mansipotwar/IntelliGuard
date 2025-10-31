from fastapi import APIRouter, Query
import networkx as nx

router = APIRouter()

# ---- Demo graph: replace/add with live map data as needed ----
G = nx.Graph()
G.add_node(1, latitude=28.6, longitude=77.2, label="User Location")
G.add_node(2, latitude=28.7, longitude=77.3, label="Shelter A")
G.add_node(3, latitude=28.65, longitude=77.25, label="Junction 1")
G.add_node(4, latitude=28.55, longitude=77.1, label="Shelter B")

# Always keep edge weights real (never complex!)
def euclidean_dist(n1, n2):
    lat1, lon1 = G.nodes[n1]['latitude'], G.nodes[n1]['longitude']
    lat2, lon2 = G.nodes[n2]['latitude'], G.nodes[n2]['longitude']
    dist = ((lat1-lat2)*2 + (lon1-lon2)*2) ** 0.5
    # Ensure we never pass a complex number
    if isinstance(dist, complex):
        dist = abs(dist)
    return float(dist)

G.add_edge(1, 2, weight=euclidean_dist(1, 2))
G.add_edge(2, 3, weight=euclidean_dist(2, 3))
G.add_edge(3, 4, weight=euclidean_dist(3, 4))
G.add_edge(1, 4, weight=euclidean_dist(1, 4))

@router.get('/evacuation-route')
def evacuation_route(
    start_node: int = Query(..., description="Start node (user's location)"),
    end_node: int = Query(..., description="End node (shelter)"),
):
    try:
        path = nx.dijkstra_path(G, source=start_node, target=end_node, weight='weight')
        path_length = nx.dijkstra_path_length(G, source=start_node, target=end_node, weight='weight')
        detailed_path = [
            {
                "node": node,
                "latitude": G.nodes[node]["latitude"],
                "longitude": G.nodes[node]["longitude"],
                "label": G.nodes[node].get("label", f"Point {node}")
            }
            for node in path
        ]
        return {"path": detailed_path, "distance": path_length}
    except nx.NetworkXNoPath:
        return {"error": "No path found between given locations."}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"} 