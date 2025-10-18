#!/bin/bash

echo "🚀 Deploying PixelVerse Beta Testing Environment"
echo "================================================"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

echo "✅ Docker found"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker Compose found"
echo ""

# Build and start services
echo "📦 Building and starting services..."
cd deployment
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access Points:"
echo "  - Game Server: http://localhost:8080"
echo "  - Grafana Dashboard: http://localhost:3000 (admin/admin)"
echo "  - Prometheus: http://localhost:9090"
echo ""
echo "📋 Next Steps:"
echo "  1. Open Grafana and import dashboard: grafana_dashboard.json"
echo "  2. Configure alert channels in Grafana"
echo "  3. Test the game: open pixelprodigy.html"
echo "  4. Monitor performance in Grafana"
echo ""
echo "🛑 To stop services: cd deployment && docker-compose down"
