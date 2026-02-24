"""
MaatriSahayak - Export Reports Lambda Function

Generate PDF/Excel reports for download.
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
    scan_items,
    validate_required_fields
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    """
    Export reports in various formats.
    
    Expected Input:
    {
        "report_type": "string" (PREGNANCIES, EMERGENCIES, ANALYTICS),
        "format": "string" (PDF, CSV, EXCEL),
        "filters": {
            "district": "string" (optional),
            "date_from": "string" (optional),
            "date_to": "string" (optional)
        }
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "report_id": "report_xxx",
            "download_url": "https://...",
            "expires_at": "...",
            "format": "PDF"
        },
        "message": "Report generated successfully"
    }
    """
    try:
        log_info("Export report request received")
        
        body = parse_event_body(event)
        
        # Validate required fields
        required_fields = ['report_type', 'format']
        validate_required_fields(body, required_fields)
        
        report_type = body['report_type']
        format_type = body['format']
        filters = body.get('filters', {})
        
        # Validate report type
        valid_report_types = ['PREGNANCIES', 'EMERGENCIES', 'ANALYTICS', 'VITALS']
        if report_type not in valid_report_types:
            raise ValidationError(
                f"Invalid report type. Must be one of: {', '.join(valid_report_types)}",
                field='report_type'
            )
        
        # Validate format
        valid_formats = ['PDF', 'CSV', 'EXCEL']
        if format_type not in valid_formats:
            raise ValidationError(
                f"Invalid format. Must be one of: {', '.join(valid_formats)}",
                field='format'
            )
        
        # Fetch data based on report type
        data = []
        if report_type == 'PREGNANCIES':
            data = scan_items(TABLE_NAMES['PREGNANCIES'])
        elif report_type == 'EMERGENCIES':
            data = scan_items(TABLE_NAMES['EMERGENCY_EVENTS'])
        elif report_type == 'VITALS':
            data = scan_items(TABLE_NAMES['VITAL_SIGNS'])
        
        # Apply filters
        if filters.get('district'):
            data = [item for item in data if item.get('district') == filters['district']]
        
        # TODO: Generate actual report file (PDF/CSV/Excel)
        # This would involve:
        # 1. Formatting data
        # 2. Generating file using appropriate library
        # 3. Uploading to S3
        # 4. Generating presigned URL
        
        from shared import generate_id, get_current_timestamp
        from datetime import datetime, timedelta
        
        report_id = generate_id('report_')
        expires_at = (datetime.utcnow() + timedelta(hours=24)).isoformat() + 'Z'
        
        # Mock download URL (in production, this would be S3 presigned URL)
        download_url = f"https://s3.amazonaws.com/reports/{report_id}.{format_type.lower()}"
        
        response_data = {
            'report_id': report_id,
            'report_type': report_type,
            'format': format_type,
            'download_url': download_url,
            'record_count': len(data),
            'generated_at': get_current_timestamp(),
            'expires_at': expires_at
        }
        
        log_info("Report generated", report_id=report_id, type=report_type, format=format_type, records=len(data))
        
        return create_success_response(
            response_data,
            f"Report generated successfully with {len(data)} record(s)"
        )
    
    except ValidationError as e:
        log_error("Validation error", e)
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
            "An unexpected error occurred while generating report",
            {'error': str(e)}
        )
