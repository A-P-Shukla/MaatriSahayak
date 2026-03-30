"""
MaatriSahayak - Update Emergency Status Lambda Function

Update an emergency's status (used by dashboard workflows).
"""

from shared import (
    ValidationError,
    DatabaseError,
    NotFoundError,
    create_success_response,
    create_error_response,
    log_info,
    log_error,
    parse_event_body,
    get_item,
    update_item,
    get_current_timestamp,
)
from shared.constants import TABLE_NAMES, HTTP_STATUS, EMERGENCY_STATUS


def lambda_handler(event, context):
    """
    Update emergency status.

    Path Parameters:
    - emergency_id: Emergency ID

    Body:
    {
      "status": "DISPATCHED" | "IN_TRANSIT" | "ARRIVED" | "COMPLETED" | "CANCELLED" | ...
    }
    """
    try:
        log_info("Update emergency status request received")

        path_params = event.get("pathParameters") or {}
        emergency_id = path_params.get("emergency_id") or path_params.get("id")
        if not emergency_id:
            raise ValidationError("Missing required parameter: emergency_id", field="emergency_id")

        body = parse_event_body(event)
        status = body.get("status")
        if not status or not isinstance(status, str):
            raise ValidationError("Missing required field: status", field="status")

        status = status.strip().upper()

        # Keep validation permissive but still guide callers to known states
        if status not in EMERGENCY_STATUS:
            raise ValidationError(
                f"Invalid status. Must be one of: {', '.join(EMERGENCY_STATUS.keys())}",
                field="status",
            )

        # Ensure emergency exists
        existing = get_item(TABLE_NAMES["EMERGENCY_EVENTS"], {"id": emergency_id})
        if not existing:
            raise NotFoundError(f"Emergency with ID {emergency_id} not found")

        updates = {
            "status": status,
            "last_updated": get_current_timestamp(),
        }

        # Add a few commonly used timestamps when transitioning
        now = get_current_timestamp()
        if status == "DISPATCHED" and not existing.get("dispatched_at"):
            updates["dispatched_at"] = now
        if status == "ARRIVED" and not existing.get("arrived_at"):
            updates["arrived_at"] = now
        if status == "COMPLETED" and not existing.get("completed_at"):
            updates["completed_at"] = now

        updated = update_item(TABLE_NAMES["EMERGENCY_EVENTS"], {"id": emergency_id}, updates)

        log_info("Emergency status updated", emergency_id=emergency_id, status=status)
        return create_success_response(updated, "Emergency status updated successfully")

    except ValidationError as e:
        log_error("Validation error", e)
        return create_error_response(e.status_code, e.__class__.__name__, e.message, e.details)

    except NotFoundError as e:
        log_error("Emergency not found", e)
        return create_error_response(e.status_code, e.__class__.__name__, e.message, e.details)

    except DatabaseError as e:
        log_error("Database error", e)
        return create_error_response(e.status_code, e.__class__.__name__, e.message, e.details)

    except Exception as e:
        log_error("Unexpected error", e)
        return create_error_response(
            HTTP_STATUS["INTERNAL_ERROR"],
            "InternalServerError",
            "An unexpected error occurred while updating emergency status",
            {"error": str(e)},
        )

