"""
MaatriSahayak - Update Driver Status Lambda Function

Updates driver availability status (AVAILABLE/ON_RIDE/OFFLINE).
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    NotFoundError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    get_item,
    get_current_timestamp
)
from shared.constants import TABLE_NAMES, HTTP_STATUS
from shared.db_helper import update_item


# Valid driver statuses
DRIVER_STATUS = ['AVAILABLE', 'ON_RIDE', 'OFFLINE']


def lambda_handler(event, context):
    """
    Update driver status.
    
    Expected Input:
    {
        "driver_id": "string",
        "status": "AVAILABLE | ON_RIDE | OFFLINE"
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "driver_id": "drv_xxx",
            "status": "AVAILABLE",
            "updated_at": "..."
        },
        "message": "Driver status updated successfully"
    }
    """
    try:
        log_info("Update driver status request received")
        
        # Parse request body
        body = parse_event_body(event)
        
        # Validate required fields
        if 'driver_id' not in body or 'status' not in body:
            raise ValidationError(
                "Missing required fields: driver_id, status",
                details={'required_fields': ['driver_id', 'status']}
            )
        
        driver_id = body['driver_id']
        new_status = body['status']
        
        # Validate status
        if new_status not in DRIVER_STATUS:
            raise ValidationError(
                f"Invalid status. Must be one of: {', '.join(DRIVER_STATUS)}",
                field='status'
            )
        
        # Check if driver exists
        table_name = TABLE_NAMES.get('DRIVERS', 'maatrisahayak-drivers-dev')
        driver = get_item(table_name, {'id': driver_id})
        
        if not driver:
            raise NotFoundError(f"Driver with ID {driver_id} not found")
        
        # Update driver status
        timestamp = get_current_timestamp()
        
        update_item(
            table_name,
            {'id': driver_id},
            "SET #status = :status, updatedAt = :updated_at",
            {
                ':status': new_status,
                ':updated_at': timestamp
            },
            {'#status': 'status'}
        )
        
        # If driver goes OFFLINE, update ambulance status too
        if new_status == 'OFFLINE' and driver.get('ambulanceId'):
            update_item(
                TABLE_NAMES['AMBULANCES'],
                {'id': driver['ambulanceId']},
                "SET #status = :status",
                {':status': 'OFFLINE'},
                {'#status': 'status'}
            )
        
        # If driver goes AVAILABLE, update ambulance status too
        elif new_status == 'AVAILABLE' and driver.get('ambulanceId'):
            update_item(
                TABLE_NAMES['AMBULANCES'],
                {'id': driver['ambulanceId']},
                "SET #status = :status",
                {':status': 'AVAILABLE'},
                {'#status': 'status'}
            )
        
        response_data = {
            'driver_id': driver_id,
            'status': new_status,
            'updated_at': timestamp
        }
        
        log_info("Driver status updated successfully", driver_id=driver_id, status=new_status)
        
        return create_success_response(
            response_data,
            "Driver status updated successfully"
        )
    
    except ValidationError as e:
        log_error("Validation error", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except NotFoundError as e:
        log_error("Driver not found", e)
        return create_error_response(
            e.status_code,
            e.__class__.__name__,
            e.message,
            e.details
        )
    
    except DatabaseError as e:
        log_error("Database error", e)
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
            "An unexpected error occurred while updating driver status",
            {'error': str(e)}
        )
