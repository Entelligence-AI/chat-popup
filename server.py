from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys
import os
import json
from urllib.parse import unquote

class FileBrowserHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def list_directory(self, path):
        try:
            entries = os.scandir(path)
            files = []
            for entry in entries:
                file_info = {
                    'name': entry.name,
                    'is_dir': entry.is_dir(),
                    'size': os.path.getsize(entry.path) if not entry.is_dir() else 0,
                    'modified': os.path.getmtime(entry.path)
                }
                files.append(file_info)
            
            # Sort directories first, then files
            files.sort(key=lambda x: (not x['is_dir'], x['name'].lower()))
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(files).encode())
            return None
            
        except OSError:
            self.send_error(404, "Directory not found")
            return None

    def do_GET(self):
        path = unquote(self.path[1:])  # Remove leading slash
        if not path:
            path = '.'
            
        if os.path.isdir(path):
            self.list_directory(path)
        else:
            return SimpleHTTPRequestHandler.do_GET(self)

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, FileBrowserHandler)
    print(f"File browser running at http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()
        sys.exit(0)

if __name__ == '__main__':
    run_server()