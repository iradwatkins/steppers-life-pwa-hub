#!/usr/bin/env python3
"""
Simple HTTP server for serving React PWA with client-side routing support.
Serves index.html for all routes that don't correspond to actual files.
"""

import http.server
import socketserver
import os
import mimetypes
from urllib.parse import unquote
import sys

class SPAHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler that serves index.html for client-side routes"""
    
    def do_GET(self):
        # Decode URL
        path = unquote(self.path)
        
        # Remove query parameters
        if '?' in path:
            path = path.split('?')[0]
        
        # Remove leading slash and resolve relative to dist directory
        file_path = path.lstrip('/')
        if not file_path:
            file_path = 'index.html'
        
        full_path = os.path.join(os.getcwd(), file_path)
        
        # If the file exists, serve it normally
        if os.path.isfile(full_path):
            return super().do_GET()
        
        # For routes that don't correspond to files, serve index.html
        # This allows React Router to handle client-side routing
        if not '.' in os.path.basename(path):  # Assume routes without extensions are React routes
            self.path = '/index.html'
            return super().do_GET()
        
        # For missing files with extensions, return 404
        return super().do_GET()

def serve_pwa(port=8084, directory='dist'):
    """Start the PWA server"""
    os.chdir(directory)
    
    with socketserver.TCPServer(("", port), SPAHTTPRequestHandler) as httpd:
        print(f"🚀 PWA Server running at:")
        print(f"   Local:   http://localhost:{port}/")
        print(f"   Network: http://192.168.86.40:{port}/")
        print(f"   Staff:   http://192.168.86.40:{port}/staff-install")
        print(f"   PWA:     http://192.168.86.40:{port}/pwa/login")
        print(f"\n📱 Share the Network URL with staff for PWA installation")
        print(f"💡 Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 PWA Server stopped")

if __name__ == "__main__":
    port = 8084
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Invalid port number")
            sys.exit(1)
    
    serve_pwa(port) 