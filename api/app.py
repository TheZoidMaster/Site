import sqlite3
import time
from flask import Flask, jsonify, request

app = Flask(__name__)


def get_db_connection():
    conn = sqlite3.connect('user.db', check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def create_table():
    with get_db_connection() as conn:
        conn.execute(
            'CREATE TABLE IF NOT EXISTS users (user TEXT PRIMARY KEY, name TEXT, timestamp REAL)')


create_table()


@app.route('/')
def index():
    return jsonify({'message': 'you silly goober, you need to supply an actual route'}), 400


@app.route('/nexulien/heartbeat', methods=['OPTIONS'])
def nexulien_heartbeat_options():
    return jsonify({}), 200


@app.route('/nexulien/heartbeat', methods=['POST'])
def nexulien_heartbeat():
    content = request.get_data(as_text=True).strip()
    user_id, user_name = content.split(',')
    if not user_id or not user_name:
        return "you silly goober, you need to supply user data", 400

    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute('SELECT * FROM users')
            users = c.fetchall()
            now = time.time()
            for user in users:
                if now - user['timestamp'] > 86400:
                    c.execute('DELETE FROM users WHERE user = ?',
                              (user['user'],))

            c.execute('SELECT * FROM users WHERE user = ?', (user_id,))
            if c.fetchone():
                c.execute('UPDATE users SET timestamp = ? WHERE user = ?',
                          (time.time(), user_id))
            else:
                c.execute('INSERT INTO users VALUES (?, ?, ?)',
                          (user_id, user_name, time.time()))
    except sqlite3.Error as e:
        return str(e), 500

    return "success", 200


@app.route('/nexulien/users', methods=['GET'])
def nexulien_users():
    get_timestamps = request.args.get('timestamps') == 'true'
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute('SELECT * FROM users')
            users = c.fetchall()
            if get_timestamps:
                return jsonify({'users': [{'user': user['user'], 'name': user['name'], 'last_seen': user['timestamp']} for user in users]}), 200
            else:
                return jsonify({'users': [{'user': user['user'], 'name': user['name']} for user in users]}), 200
    except sqlite3.Error as e:
        pass


if __name__ == '__main__':
    from waitress import serve
    serve(app, host='0.0.0.0', port=5000)
