import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для сохранения и получения статистики тестов по английскому
    Args: event - dict с httpMethod, body, queryStringParameters (action=get_statistics или action=save_result)
          context - object с request_id
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'get_statistics')
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if action == 'get_statistics' and method == 'GET':
            cur.execute("""
                SELECT id, test_date, total_questions, correct_answers, 
                       prepositions, score_percentage
                FROM test_results 
                ORDER BY test_date DESC 
                LIMIT 50
            """)
            results = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(results, default=str),
                'isBase64Encoded': False
            }
        
        elif action == 'save_result' and method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            total_questions = body_data['total_questions']
            correct_answers = body_data['correct_answers']
            prepositions = body_data['prepositions']
            score_percentage = body_data['score_percentage']
            answers = json.dumps(body_data['answers'])
            
            cur.execute("""
                INSERT INTO test_results 
                (total_questions, correct_answers, prepositions, score_percentage, answers)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (total_questions, correct_answers, prepositions, score_percentage, answers))
            
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'id': result['id'], 'success': True}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Not found'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()