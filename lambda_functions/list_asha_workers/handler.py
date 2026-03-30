"""
MaatriSahayak - List ASHA Workers Lambda
GET /asha
"""

from shared import (
    create_success_response,
    create_error_response,
    log_info,
    log_error,
    scan_items,
)
from shared.constants import TABLE_NAMES, HTTP_STATUS


def lambda_handler(event, context):
    try:
        query_params = event.get('queryStringParameters') or {}
        district = query_params.get('district')
        search = query_params.get('search', '').lower()

        workers = scan_items(TABLE_NAMES.get('ASHA_WORKERS', 'maatrisahayak-asha-workers-dev'))

        if district:
            workers = [w for w in workers if w.get('district', '').lower() == district.lower()]

        if search:
            workers = [
                w for w in workers
                if search in w.get('name', '').lower()
                or search in w.get('phone', '')
                or search in w.get('district', '').lower()
                or search in w.get('village', '').lower()
            ]

        log_info("ASHA workers listed", count=len(workers))
        return create_success_response({'workers': workers}, f"Found {len(workers)} ASHA worker(s)")

    except Exception as e:
        log_error("Error listing ASHA workers", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "Failed to list ASHA workers",
            {'error': str(e)}
        )
