# Monitoring & Observability Guide

Aptora includes a built-in Prometheus, Grafana, Loki, and Promtail logging/metrics pipeline to ensure high availability and deep performance visibility.

## Architecture

```
[ Pods / Containers ] ──(Metrics)──> [ Prometheus ] ──> [ Grafana ]
         │
      (Logs)
         ▼
    [ Promtail ] ────────(Push)──────> [ Loki ] ─────────> [ Grafana ]
```

- **Prometheus**: Aggregates time-series performance data.
- **Loki**: Horizontally-scalable, metadata-indexed log storage.
- **Promtail**: Log-collector agent forwarding stdout streams to Loki.
- **Grafana**: Unified visualization panel.

## Accessing Dashboards

To launch the monitoring stack locally:

```bash
make monitoring
```

Once running:
- **Prometheus UI**: [http://localhost:9090](http://localhost:9090)
- **Grafana UI**: [http://localhost:3001](http://localhost:3001) (Default credentials: `admin` / `admin`)

## Creating Grafana Panels

1. Add **Loki** data source:
   - URL: `http://loki:3100`
2. Add **Prometheus** data source:
   - URL: `http://prometheus:9090`
3. Load dashboards for FastAPI and Next.js metrics.
