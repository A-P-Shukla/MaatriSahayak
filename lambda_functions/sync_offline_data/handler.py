"""
MaatriSahayak - Sync Offline Data Lambda Function

Handle bulk sync from mobile offline queue.
"""

import json
from shared import (
    ValidationError,
    DatabaseError,
    create_success_response,
    create_error_response,
    parse_event_body,
    log_info,
    log_error,
    put_item,
    validate_required_fields
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Sync offline data from mobile app.
    
    Expected Input:
    {
        "device_id": "string",
        "sync_timestamp": "string",
        "data": {
            "vitals": [...],
            "anc_visits": [...],
            "pregnancies": [...]
        }
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "synced_items": 15,
            "failed_items": 0,
            "sync_id": "sync_xxx"
        },
        "message": "Data synced successfully"
    }
    """
    try:
        log_info("Sync offline data request received")
        
        body = parse_event_body(event)
        
        # Validate required fields
        required_fields = ['device_id', 'sync_timestamp', 'data']
        validate_required_fields(body, required_fields)
        
        device_id = body['device_id']
        data = body['data']
        
        synced_count = 0
        failed_count = 0
        errors = []
        
        # Sync vitals
        if 'vitals' in data:
            for vital in data['vitals']:
                try:
                    put_item(TABLE_NAMES['VITAL_SIGNS'], vital)
                    synced_count += 1
                except Exception as e:
                    failed_count += 1
                    errors.append({'type': 'vital', 'id': vital.get('id'), 'error': str(e)})
        
        # Sync ANC visits
        if 'anc_visits' in data:
            for visit in data['anc_visits']:
                try:
                    put_item(TABLE_NAMES['VITAL_SIGNS'], visit)  # Using VITAL_SIGNS table
                    synced_count += 1
                except Exception as e:
                    failed_count += 1
                    errors.append({'type': 'anc_visit', 'id': visit.get('id'), 'error': str(e)})
        
        # Sync pregnancies
        if 'pregnancies' in data:
            for pregnancy in data['pregnancies']:
                try:
                    put_item(TABLE_NAMES['PREGNANCIES'], pregnancy)
                    synced_count += 1
                except Exception as e:
                    failed_count += 1
                    errors.append({'type': 'pregnancy', 'id': pregnancy.get('id'), 'error': str(e)})
        
        from shared import generate_id, get_current_timestamp
        sync_id = generate_id('sync_')
        
        response_data = {
            'sync_id': sync_id,
            'device_id': device_id,
            'synced_items': synced_count,
            'failed_items': failed_count,
            'errors': errors if errors else None,
            'synced_at': get_current_timestamp()
        }
        
        log_info("Data synced", device_id=device_id, synced=synced_count, failed=failed_count)
        
        return create_success_response(
            response_data,
            f"Synced {synced_count} item(s) successfully"
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
            "An unexpected error occurred during data sync",
            {'error': str(e)}
        )
