"""
MaatriSahayak - List Drivers Lambda

Returns all drivers. Optional query param: ?verificationStatus=PENDING|APPROVED|REJECTED
"""

import os
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
        params = event.get('queryStringParameters') or {}
        verification_status = params.get('verificationStatus')

        table_name = TABLE_NAMES.get('DRIVERS', 'maatrisahayak-drivers-dev')

        if verification_status:
            drivers = scan_items(
                table_name,
                filter_expression='verificationStatus = :vs',
                expression_attribute_values={':vs': verification_status},
            )
        else:
            drivers = scan_items(table_name)

        log_info("Listed drivers", count=len(drivers))
        return create_success_response({'items': drivers, 'count': len(drivers)})

    except Exception as e:
        log_error("Error listing drivers", e)
        return create_error_response(
            HTTP_STATUS['INTERNAL_ERROR'],
            "InternalServerError",
            "Failed to list drivers",
            {'error': str(e)},
        )
