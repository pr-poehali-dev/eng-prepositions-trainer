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
            answers_list = body_data['answers']
            answers = json.dumps(answers_list)
            
            cur.execute("""
                INSERT INTO test_results 
                (total_questions, correct_answers, prepositions, score_percentage, answers)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (total_questions, correct_answers, prepositions, score_percentage, answers))
            
            result = cur.fetchone()
            
            for answer in answers_list:
                if 'ruleType' in answer:
                    rule_type = answer['ruleType']
                    preposition = answer['correctAnswer']
                    is_correct = answer['correct']
                    sentence = answer['sentence']
                    
                    cur.execute("""
                        INSERT INTO rule_statistics 
                        (preposition, rule_type, total_attempts, correct_attempts, accuracy_percentage)
                        VALUES (%s, %s, 1, %s, %s)
                        ON CONFLICT (user_session, preposition, rule_type) 
                        DO UPDATE SET 
                            total_attempts = rule_statistics.total_attempts + 1,
                            correct_attempts = rule_statistics.correct_attempts + %s,
                            accuracy_percentage = ROUND((rule_statistics.correct_attempts + %s)::numeric / (rule_statistics.total_attempts + 1) * 100),
                            last_attempt_date = CURRENT_TIMESTAMP
                    """, (preposition, rule_type, 1 if is_correct else 0, 100 if is_correct else 0, 
                          1 if is_correct else 0, 1 if is_correct else 0))
                    
                    if not is_correct:
                        cur.execute("""
                            INSERT INTO error_patterns 
                            (preposition, rule_type, sentence, error_count)
                            VALUES (%s, %s, %s, 1)
                            ON CONFLICT (user_session, preposition, rule_type)
                            DO UPDATE SET 
                                error_count = error_patterns.error_count + 1,
                                sentence = %s,
                                last_error_date = CURRENT_TIMESTAMP
                        """, (preposition, rule_type, sentence, sentence))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'id': result['id'], 'success': True}),
                'isBase64Encoded': False
            }
        
        elif action == 'get_rule_stats' and method == 'GET':
            cur.execute("""
                SELECT preposition, rule_type, total_attempts, correct_attempts, accuracy_percentage
                FROM rule_statistics 
                WHERE user_session = 'default'
                ORDER BY accuracy_percentage ASC, total_attempts DESC
            """)
            results = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(results, default=str),
                'isBase64Encoded': False
            }
        
        elif action == 'get_error_patterns' and method == 'GET':
            cur.execute("""
                SELECT preposition, rule_type, error_count, sentence
                FROM error_patterns 
                WHERE user_session = 'default'
                ORDER BY error_count DESC
                LIMIT 20
            """)
            results = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(results, default=str),
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