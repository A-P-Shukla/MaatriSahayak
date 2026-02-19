"""
MaatriSahayak - DynamoDB Helper

Helper functions for DynamoDB operations.
"""

import os
import boto3
from typing import Dict, Any, List, Optional
from decimal import Decimal
from botocore.exceptions import ClientError

from .exceptions import DatabaseError, ResourceNotFoundError
from .utils import log_info, log_error, convert_decimals


# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION', 'ap-south-1'))


def get_table(table_name: str):
    """
    Get DynamoDB table resource.
    
    Args:
        table_name: Name of the table
    
    Returns:
        DynamoDB table resource
    """
    return dynamodb.Table(table_name)


def put_item(table_name: str, item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Put an item into DynamoDB table.
    
    Args:
        table_name: Name of the table
        item: Item to insert
    
    Returns:
        The inserted item
    
    Raises:
        DatabaseError: If operation fails
    """
    try:
        table = get_table(table_name)
        
        # Convert floats to Decimals for DynamoDB
        item_with_decimals = convert_to_decimals(item)
        
        table.put_item(Item=item_with_decimals)
        
        log_info(f"Item inserted into {table_name}", item_id=item.get('id'))
        return item
    
    except ClientError as e:
        log_error(f"Failed to put item in {table_name}", e)
        raise DatabaseError(
            f"Failed to insert item into {table_name}",
            operation='put_item',
            details={'error': str(e)}
        )


def get_item(
    table_name: str,
    key: Dict[str, Any],
    consistent_read: bool = False
) -> Optional[Dict[str, Any]]:
    """
    Get an item from DynamoDB table.
    
    Args:
        table_name: Name of the table
        key: Primary key of the item
        consistent_read: Whether to use consistent read
    
    Returns:
        The item or None if not found
    
    Raises:
        DatabaseError: If operation fails
    """
    try:
        table = get_table(table_name)
        
        response = table.get_item(Key=key, ConsistentRead=consistent_read)
        
        item = response.get('Item')
        if item:
            return convert_decimals(item)
        
        return None
    
    except ClientError as e:
        log_error(f"Failed to get item from {table_name}", e, key=key)
        raise DatabaseError(
            f"Failed to retrieve item from {table_name}",
            operation='get_item',
            details={'error': str(e)}
        )


def update_item(
    table_name: str,
    key: Dict[str, Any],
    updates: Dict[str, Any],
    return_values: str = 'ALL_NEW'
) -> Dict[str, Any]:
    """
    Update an item in DynamoDB table.
    
    Args:
        table_name: Name of the table
        key: Primary key of the item
        updates: Dictionary of attributes to update
        return_values: What to return (ALL_NEW, ALL_OLD, etc.)
    
    Returns:
        Updated item
    
    Raises:
        DatabaseError: If operation fails
    """
    try:
        table = get_table(table_name)
        
        # Build update expression
        update_expression = "SET " + ", ".join(f"#{k} = :{k}" for k in updates.keys())
        expression_attribute_names = {f"#{k}": k for k in updates.keys()}
        expression_attribute_values = {f":{k}": convert_to_decimals(v) for k, v in updates.items()}
        
        response = table.update_item(
            Key=key,
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues=return_values
        )
        
        log_info(f"Item updated in {table_name}", key=key)
        return convert_decimals(response.get('Attributes', {}))
    
    except ClientError as e:
        log_error(f"Failed to update item in {table_name}", e, key=key)
        raise DatabaseError(
            f"Failed to update item in {table_name}",
            operation='update_item',
            details={'error': str(e)}
        )


def delete_item(table_name: str, key: Dict[str, Any]) -> bool:
    """
    Delete an item from DynamoDB table.
    
    Args:
        table_name: Name of the table
        key: Primary key of the item
    
    Returns:
        True if successful
    
    Raises:
        DatabaseError: If operation fails
    """
    try:
        table = get_table(table_name)
        table.delete_item(Key=key)
        
        log_info(f"Item deleted from {table_name}", key=key)
        return True
    
    except ClientError as e:
        log_error(f"Failed to delete item from {table_name}", e, key=key)
        raise DatabaseError(
            f"Failed to delete item from {table_name}",
            operation='delete_item',
            details={'error': str(e)}
        )


def query_items(
    table_name: str,
    key_condition_expression: str,
    expression_attribute_values: Dict[str, Any],
    expression_attribute_names: Optional[Dict[str, str]] = None,
    index_name: Optional[str] = None,
    limit: Optional[int] = None,
    scan_forward: bool = True,
    filter_expression: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Query items from DynamoDB table.
    
    Args:
        table_name: Name of the table
        key_condition_expression: Key condition expression
        expression_attribute_values: Attribute values for the expression
        expression_attribute_names: Attribute names for the expression
        index_name: Name of GSI to query
        limit: Maximum number of items to return
        scan_forward: Sort order (True for ascending)
        filter_expression: Optional filter expression
    
    Returns:
        List of items
    
    Raises:
        DatabaseError: If operation fails
    """
    try:
        table = get_table(table_name)
        
        query_params = {
            'KeyConditionExpression': key_condition_expression,
            'ExpressionAttributeValues': {k: convert_to_decimals(v) for k, v in expression_attribute_values.items()},
            'ScanIndexForward': scan_forward
        }
        
        if expression_attribute_names:
            query_params['ExpressionAttributeNames'] = expression_attribute_names
        
        if index_name:
            query_params['IndexName'] = index_name
        
        if limit:
            query_params['Limit'] = limit
        
        if filter_expression:
            query_params['FilterExpression'] = filter_expression
        
        response = table.query(**query_params)
        
        items = response.get('Items', [])
        return [convert_decimals(item) for item in items]
    
    except ClientError as e:
        log_error(f"Failed to query items from {table_name}", e)
        raise DatabaseError(
            f"Failed to query items from {table_name}",
            operation='query',
            details={'error': str(e)}
        )


def scan_items(
    table_name: str,
    filter_expression: Optional[str] = None,
    expression_attribute_values: Optional[Dict[str, Any]] = None,
    expression_attribute_names: Optional[Dict[str, str]] = None,
    limit: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Scan items from DynamoDB table.
    
    Args:
        table_name: Name of the table
        filter_expression: Optional filter expression
        expression_attribute_values: Attribute values for the expression
        expression_attribute_names: Attribute names for the expression
        limit: Maximum number of items to return
    
    Returns:
        List of items
    
    Raises:
        DatabaseError: If operation fails
    """
    try:
        table = get_table(table_name)
        
        scan_params = {}
        
        if filter_expression:
            scan_params['FilterExpression'] = filter_expression
        
        if expression_attribute_values:
            scan_params['ExpressionAttributeValues'] = {
                k: convert_to_decimals(v) for k, v in expression_attribute_values.items()
            }
        
        if expression_attribute_names:
            scan_params['ExpressionAttributeNames'] = expression_attribute_names
        
        if limit:
            scan_params['Limit'] = limit
        
        response = table.scan(**scan_params)
        
        items = response.get('Items', [])
        return [convert_decimals(item) for item in items]
    
    except ClientError as e:
        log_error(f"Failed to scan items from {table_name}", e)
        raise DatabaseError(
            f"Failed to scan items from {table_name}",
            operation='scan',
            details={'error': str(e)}
        )


def batch_write_items(table_name: str, items: List[Dict[str, Any]]) -> bool:
    """
    Batch write items to DynamoDB table.
    
    Args:
        table_name: Name of the table
        items: List of items to write
    
    Returns:
        True if successful
    
    Raises:
        DatabaseError: If operation fails
    """
    try:
        table = get_table(table_name)
        
        with table.batch_writer() as batch:
            for item in items:
                batch.put_item(Item=convert_to_decimals(item))
        
        log_info(f"Batch write completed for {table_name}", count=len(items))
        return True
    
    except ClientError as e:
        log_error(f"Failed to batch write items to {table_name}", e)
        raise DatabaseError(
            f"Failed to batch write items to {table_name}",
            operation='batch_write',
            details={'error': str(e)}
        )


def batch_get_items(table_name: str, keys: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Batch get items from DynamoDB table.
    
    Args:
        table_name: Name of the table
        keys: List of primary keys
    
    Returns:
        List of items
    
    Raises:
        DatabaseError: If operation fails
    """
    try:
        response = dynamodb.batch_get_item(
            RequestItems={
                table_name: {
                    'Keys': keys
                }
            }
        )
        
        items = response.get('Responses', {}).get(table_name, [])
        return [convert_decimals(item) for item in items]
    
    except ClientError as e:
        log_error(f"Failed to batch get items from {table_name}", e)
        raise DatabaseError(
            f"Failed to batch get items from {table_name}",
            operation='batch_get',
            details={'error': str(e)}
        )


def convert_to_decimals(obj: Any) -> Any:
    """
    Recursively convert float objects to Decimal for DynamoDB.
    
    Args:
        obj: Object to convert
    
    Returns:
        Converted object
    """
    if isinstance(obj, list):
        return [convert_to_decimals(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_to_decimals(value) for key, value in obj.items()}
    elif isinstance(obj, float):
        return Decimal(str(obj))
    return obj


def item_exists(table_name: str, key: Dict[str, Any]) -> bool:
    """
    Check if an item exists in DynamoDB table.
    
    Args:
        table_name: Name of the table
        key: Primary key of the item
    
    Returns:
        True if item exists, False otherwise
    """
    item = get_item(table_name, key)
    return item is not None
