import base64
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).parent
PORT = int(os.getenv('PORT', '3000'))


def load_env():
    env_path = ROOT / '.env'
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def classify_waste(image):
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise RuntimeError('OPENAI_API_KEY is not configured in .env.')

    prompt = (
        'You are an AI Waste Classification Assistant. Inspect only objects visibly present in the image. '
        'Classify every visible waste item into exactly one category: Wet/Organic Waste, '
        'Dry/Recyclable Waste, E-Waste, or Hazardous Waste. Prioritize Hazardous Waste when an item '
        'contains hazardous chemicals. If unclear, return an empty items array and the message '
        '"Unable to identify confidently". Never guess. Return only valid JSON with this shape: '
        '{"items":[{"item_name":"string","category":"Wet/Organic Waste | Dry/Recyclable Waste | '
        'E-Waste | Hazardous Waste","confidence":0,"reason":"string","disposal":"string"}],'
        '"message":"optional string"}. Use safe disposal advice.'
    )
    request_body = {
        'model': os.getenv('OPENAI_MODEL', 'gpt-4o-mini'),
        'temperature': 0,
        'response_format': {'type': 'json_object'},
        'messages': [
            {'role': 'system', 'content': prompt},
            {'role': 'user', 'content': [
                {'type': 'text', 'text': 'Analyze this waste image.'},
                {'type': 'image_url', 'image_url': {'url': image}},
            ]},
        ],
    }
    request = Request(
        'https://api.openai.com/v1/chat/completions',
        data=json.dumps(request_body).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {api_key}'},
        method='POST',
    )
    try:
        with urlopen(request, timeout=90) as response:
            payload = json.loads(response.read().decode('utf-8'))
    except HTTPError as error:
        details = error.read().decode('utf-8', errors='replace')
        try:
            details = json.loads(details).get('error', {}).get('message', details)
        except json.JSONDecodeError:
            pass
        raise RuntimeError(details) from error
    except URLError as error:
        raise RuntimeError(f'Vision API connection failed: {error.reason}') from error

    return json.loads(payload['choices'][0]['message']['content'])


class WasteWiseHandler(BaseHTTPRequestHandler):
    def send_json(self, status, payload):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != '/api/classify-waste':
            self.send_json(404, {'error': 'Not found'})
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if length > 15 * 1024 * 1024:
                self.send_json(413, {'error': 'Image request is too large.'})
                return
            payload = json.loads(self.rfile.read(length).decode('utf-8'))
            image = payload.get('image', '')
            if not isinstance(image, str) or not image.startswith('data:image/'):
                self.send_json(400, {'error': 'A base64 image is required.'})
                return
            self.send_json(200, classify_waste(image))
        except (json.JSONDecodeError, ValueError):
            self.send_json(400, {'error': 'Invalid JSON request.'})
        except Exception as error:
            self.send_json(502, {'error': str(error)})

    def do_GET(self):
        if self.path == '/api/health':
            self.send_json(200, {'status': 'ok', 'message': 'WasteWise Python server is running'})
            return
        requested = self.path.split('?', 1)[0].lstrip('/') or 'index.html'
        file_path = (ROOT / requested).resolve()
        if ROOT not in file_path.parents or not file_path.is_file():
            file_path = ROOT / 'index.html'
        content_type = 'text/html; charset=utf-8'
        if file_path.suffix == '.js':
            content_type = 'application/javascript; charset=utf-8'
        elif file_path.suffix == '.css':
            content_type = 'text/css; charset=utf-8'
        elif file_path.suffix == '.json':
            content_type = 'application/json; charset=utf-8'
        body = file_path.read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        print(f'[{self.log_date_time_string()}] {format % args}')


if __name__ == '__main__':
    load_env()
    print(f'WasteWise server running at http://localhost:{PORT}')
    ThreadingHTTPServer(('localhost', PORT), WasteWiseHandler).serve_forever()
