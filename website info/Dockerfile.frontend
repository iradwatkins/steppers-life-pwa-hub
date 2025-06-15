# PWA Self-Hosting Dockerfile
FROM nginx:alpine

# Copy built PWA files
COPY dist/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx-pwa.conf /etc/nginx/conf.d/default.conf

# PWA requires proper MIME types
RUN echo 'application/manifest+json webmanifest;' >> /etc/nginx/mime.types

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 