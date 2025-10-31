def get_safety_recommendation(flood_params, flood_occurred):
    tips = []
    if flood_occurred:
        tips.append("Evacuate to the nearest safe zone immediately.")
        tips.append("Call emergency services and follow instructions of local authorities.")
        tips.append("Avoid bridges and low-lying areas.")
        if flood_params.get("rainfall_mm", 0) > 200:
            tips.append("Heavy rainfall detected: Take extra caution regarding flash floods.")
        if flood_params.get("river_discharge_m3s", 0) > 3000:
            tips.append("River discharge is dangerously high: Avoid riversides.")
        if flood_params.get("population_density", 0) > 5000:
            tips.append("Dense population: Maintain calm in crowds and avoid panic.")
        if flood_params.get("temperature_C", 0) > 40:
            tips.append("High temperatures: Carry water, prevent dehydration during evacuation.")
        tips.append("Prepare emergency kit (medicine, food, water, documents).")
    else:
        tips.append("No flood predicted: Stay alert, but no immediate action required.")
    return {
        "recommendations": tips,
        "advice_source": "Based on flood parameters and AI prediction."
    }