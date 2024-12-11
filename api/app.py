import sqlite3
import time
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


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
@cross_origin()
def index():
    return jsonify({'message': 'you silly goober, you need to supply an actual route'}), 400


@app.route('/nexulien/heartbeat', methods=['OPTIONS'])
@cross_origin()
def nexulien_heartbeat_options():
    return jsonify({}), 200


@app.route('/nexulien/heartbeat', methods=['POST'])
@cross_origin()
def nexulien_heartbeat():
    content = request.get_data(as_text=True).strip()
    try:
        user_id, user_name = content.split(',')
    except:
        return "you silly goober, you need to supply user data", 400

    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute('SELECT * FROM users')
            users = c.fetchall()
            now = time.time()
            for user in users:
                if now - user['timestamp'] > 604800:
                    c.execute('DELETE FROM users WHERE user = ?',
                              (user['user'],))

            c.execute('SELECT * FROM users WHERE user = ?', (user_id,))
            if c.fetchone():
                c.execute('UPDATE users SET timestamp = ?, name = ? WHERE user = ?',
                          (time.time(), user_name, user_id))
            else:
                c.execute('INSERT INTO users VALUES (?, ?, ?)',
                          (user_id, user_name, time.time()))
    except sqlite3.Error as e:
        return str(e), 500

    return "success", 200


@app.route('/nexulien/users', methods=['GET'])
@cross_origin()
def nexulien_users():
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute('SELECT * FROM users')
            users = c.fetchall()
            return jsonify({'users': [{'user': user['user'], 'name': user['name']} for user in users]}), 200
    except sqlite3.Error as e:
        pass


if __name__ == '__main__':
    from waitress import serve
    serve(app, host='0.0.0.0', port=5000)
