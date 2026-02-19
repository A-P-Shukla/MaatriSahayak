"""
MaatriSahayak - Get Ambulance Route Lambda Function

Calculates route and ETA for ambulance to patient and hospital.
"""

import json
import os
import requests
from shared import (
    ValidationError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    validate_required_fields,
    validate_coordinates,
    calculate_distance
)
from shared.constants import HTTP_STATUS
from shared.models import RouteModel


def lambda_handler(event, context):
    """
    Get ambulance route with ETA.
    
    Expected Input:
    {
        "origin_lat": float,
        "origin_lon": float,
        "destination_lat": float,
        "destination_lon": float,
        "waypoints": [  (optional)
            {"lat": float, "lon": float}
        ]
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "distance_km": 15.5,
            "estimated_time_minutes": 25,
            "route_points": [...],
            "instructions": [...]
        }
    }
    """
    try:
        log_info("Get ambulance route request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields
        validate_required_fields(body, ['origin_lat', 'origin_lon', 'destination_lat', 'destination_lon'])
        validate_coordinates(body['origin_lat'], body['origin_lon'])
        validate_coordinates(body['destination_lat'], body['destination_lon'])
        
        origin_lat = body['origin_lat']
        origin_lon = body['origin_lon']
        destination_lat = body['destination_lat']
        destination_lon = body['destination_lon']
        waypoints = body.get('waypoints', [])
        
        # Calculate straight-line distance
        straight_distance = calculate_distance(
            origin_lat, origin_lon,
            destination_lat, destination_lon
        )
        
        # Try to get route from external service (Google Maps, Mapbox, etc.)
        # For now, using simple calculation as fallback
        route_data = calculate_simple_route(
            origin_lat, origin_lon,
            destination_lat, destination_lon,
            waypoints
        )
        
        log_info(
            "Route calculated",
            distance_km=route_data['distance_km'],
            estimated_time_minutes=route_data['estimated_time_minutes']
        )
        
        return create_success_response(
            route_data,
            "Route calculated successfully"
        )
    
    except ValidationError as e:
        log_error("Validation error", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except Exception as e:
        log_error("Unexpected error", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "An unexpected error occurred while calculating route",
            {'error': str(e)}
        )


def calculate_simple_route(
    origin_lat: float,
    origin_lon: float,
    destination_lat: float,
    destination_lon: float,
    waypoints: list
) -> dict:
    """
    Calculate simple route with distance and ETA.
    
    This is a simplified calculation. In production, integrate with:
    - Google Maps Directions API
    - Mapbox Directions API
    - OpenStreetMap Routing Service
    
    Args:
        origin_lat: Origin latitude
        origin_lon: Origin longitude
        destination_lat: Destination latitude
        destination_lon: Destination longitude
        waypoints: List of waypoint coordinates
    
    Returns:
        Route data dictionary
    """
    # Calculate total distance
    total_distance = 0
    route_points = []
    
    # Add origin
    route_points.append({'lat': origin_lat, 'lon': origin_lon})
    
    current_lat = origin_lat
    current_lon = origin_lon
    
    # Calculate distance through waypoints
    for waypoint in waypoints:
        wp_lat = waypoint['lat']
        wp_lon = waypoint['lon']
        
        segment_distance = calculate_distance(current_lat, current_lon, wp_lat, wp_lon)
        total_distance += segment_distance
        
        route_points.append({'lat': wp_lat, 'lon': wp_lon})
        
        current_lat = wp_lat
        current_lon = wp_lon
    
    # Calculate distance to destination
    final_distance = calculate_distance(current_lat, current_lon, destination_lat, destination_lon)
    total_distance += final_distance
    
    # Add destination
    route_points.append({'lat': destination_lat, 'lon': destination_lon})
    
    # Apply road factor (roads are typically 1.3x straight-line distance)
    road_distance = round(total_distance * 1.3, 2)
    
    # Calculate ETA (assuming average speed of 40 km/h for emergency vehicles)
    average_speed_kmh = 40
    estimated_time_minutes = int((road_distance / average_speed_kmh) * 60)
    
    # Generate simple instructions
    instructions = [
        {
            'step': 1,
            'instruction': f'Head towards destination',
            'distance_km': road_distance
        },
        {
            'step': 2,
            'instruction': f'Arrive at destination',
            'distance_km': 0
        }
    ]
    
    return {
        'distance_km': road_distance,
        'estimated_time_minutes': estimated_time_minutes,
        'straight_line_distance_km': round(total_distance, 2),
        'route_points': route_points,
        'instructions': instructions,
        'average_speed_kmh': average_speed_kmh
    }


def get_route_from_google_maps(
    origin_lat: float,
    origin_lon: float,
    destination_lat: float,
    destination_lon: float,
    waypoints: list
) -> dict:
    """
    Get route from Google Maps Directions API.
    
    Note: Requires GOOGLE_MAPS_API_KEY environment variable.
    This is a placeholder for production implementation.
    
    Args:
        origin_lat: Origin latitude
        origin_lon: Origin longitude
        destination_lat: Destination latitude
        destination_lon: Destination longitude
        waypoints: List of waypoint coordinates
    
    Returns:
        Route data from Google Maps
    """
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    
    if not api_key:
        raise ValueError("Google Maps API key not configured")
    
    # Build request URL
    origin = f"{origin_lat},{origin_lon}"
    destination = f"{destination_lat},{destination_lon}"
    
    url = f"https://maps.googleapis.com/maps/api/directions/json"
    params = {
        'origin': origin,
        'destination': destination,
        'key': api_key,
        'mode': 'driving',
        'alternatives': 'false'
    }
    
    # Add waypoints if provided
    if waypoints:
        waypoints_str = '|'.join([f"{wp['lat']},{wp['lon']}" for wp in waypoints])
        params['waypoints'] = waypoints_str
    
    # Make API request
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    
    data = response.json()
    
    if data['status'] != 'OK':
        raise ValueError(f"Google Maps API error: {data['status']}")
    
    # Parse response
    route = data['routes'][0]
    leg = route['legs'][0]
    
    # Extract route points from polyline
    polyline = route['overview_polyline']['points']
    route_points = decode_polyline(polyline)
    
    # Extract instructions
    instructions = []
    for i, step in enumerate(leg['steps']):
        instructions.append({
            'step': i + 1,
            'instruction': step['html_instructions'],
            'distance_km': step['distance']['value'] / 1000,
            'duration_minutes': step['duration']['value'] / 60
        })
    
    return {
        'distance_km': leg['distance']['value'] / 1000,
        'estimated_time_minutes': leg['duration']['value'] / 60,
        'route_points': route_points,
        'instructions': instructions
    }


def decode_polyline(polyline_str: str) -> list:
    """
    Decode Google Maps polyline string to coordinates.
    
    Args:
        polyline_str: Encoded polyline string
    
    Returns:
        List of coordinate dictionaries
    """
    # Simplified polyline decoding
    # In production, use a proper polyline decoding library
    coordinates = []
    index = 0
    lat = 0
    lng = 0
    
    while index < len(polyline_str):
        b = 0
        shift = 0
        result = 0
        
        while True:
            b = ord(polyline_str[index]) - 63
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5
            if b < 0x20:
                break
        
        dlat = ~(result >> 1) if result & 1 else result >> 1
        lat += dlat
        
        shift = 0
        result = 0
        
        while True:
            b = ord(polyline_str[index]) - 63
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5
            if b < 0x20:
                break
        
        dlng = ~(result >> 1) if result & 1 else result >> 1
        lng += dlng
        
        coordinates.append({
            'lat': lat / 1e5,
            'lon': lng / 1e5
        })
    
    return coordinates
