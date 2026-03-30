"""
MaatriSahayak - List Ambulances Lambda Function

List ambulances with optional filtering.
"""

from shared import (
    ValidationError,
    DatabaseError,
    create_success_response,
    create_error_response,
    log_info,
    log_error,
    query_items,
    scan_items,
)
from shared.constants import TABLE_NAMES, HTTP_STATUS, GSI_NAMES


def lambda_handler(event, context):
    """
    List ambulances with optional filtering.

    Query Parameters (optional):
    - district: Filter by district
    - status: Filter by ambulance status (AVAILABLE, DISPATCHED, IN_TRANSIT, BUSY, MAINTENANCE, OFFLINE)
    - limit: Maximum results (default: 100, max: 500)

    Returns:
    {
        "success": true,
        "data": {
            "ambulances": [...],
            "count": 10
        },
        "message": "Found 10 ambulance(s)"
    }
    """
    try:
        log_info("List ambulances request received")

        query_params = event.get("queryStringParameters") or {}
        district = query_params.get("district")
        status = query_params.get("status")

        try:
            limit = int(query_params.get("limit", 100))
        except Exception:
            raise ValidationError("Invalid limit parameter", field="limit")

        limit = max(1, min(limit, 500))

        ambulances = []

        # Prefer GSI query when district is provided (and optionally status).
        # Falls back to scan for other filter combinations.
        if district and status:
            try:
                ambulances = query_items(
                    TABLE_NAMES["AMBULANCES"],
                    index_name=GSI_NAMES["DISTRICT_STATUS_INDEX"],
                    key_condition_expression="district = :district AND #status = :status",
                    expression_attribute_values={":district": district, ":status": status},
                    expression_attribute_names={"#status": "status"},
                    limit=limit,
                )
            except Exception:
                ambulances = []
        elif district:
            try:
                ambulances = query_items(
                    TABLE_NAMES["AMBULANCES"],
                    index_name=GSI_NAMES["DISTRICT_STATUS_INDEX"],
                    key_condition_expression="district = :district",
                    expression_attribute_values={":district": district},
                    limit=limit,
                )
            except Exception:
                ambulances = []

        if not ambulances:
            filter_parts = []
            expression_values = {}
            expression_names = {}

            if district:
                filter_parts.append("district = :district")
                expression_values[":district"] = district

            if status:
                filter_parts.append("#status = :status")
                expression_values[":status"] = status
                expression_names["#status"] = "status"

            ambulances = scan_items(
                TABLE_NAMES["AMBULANCES"],
                filter_expression=" AND ".join(filter_parts) if filter_parts else None,
                expression_attribute_values=expression_values if expression_values else None,
                expression_attribute_names=expression_names if expression_names else None,
                limit=limit,
            )

        response_data = {"ambulances": ambulances, "count": len(ambulances)}

        log_info(
            "Ambulances listed",
            count=len(ambulances),
            district=district,
            status=status,
        )

        return create_success_response(response_data, f"Found {len(ambulances)} ambulance(s)")

    except ValidationError as e:
        log_error("Validation error", e)
        return create_error_response(e.status_code, e.__class__.__name__, e.message, e.details)

    except DatabaseError as e:
        log_error("Database error", e)
        return create_error_response(e.status_code, e.__class__.__name__, e.message, e.details)

    except Exception as e:
        log_error("Unexpected error", e)
        return create_error_response(
            HTTP_STATUS["INTERNAL_ERROR"],
            "InternalServerError",
            "An unexpected error occurred while listing ambulances",
            {"error": str(e)},
        )

