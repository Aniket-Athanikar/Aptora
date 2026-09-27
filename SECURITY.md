# Security Policy

## Supported Versions

We actively monitor and support the following versions of Aptora with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please do **not** open a public issue. Instead, report it using the instructions below:

1. Send an email to security@Aptora.ai containing details of the vulnerability, reproduction steps, and potential impact.
2. We will acknowledge receipt of your report within 48 hours.
3. We will provide a detailed response and a fix timeline within 7 days.
4. A public security advisory (GHSA) will be published once the patch is released.

## Security Practices

We enforce several automated gates to protect Aptora:
- **Secret Scanning**: Scans every commit using GitGuardian/GitHub native scanning.
- **Static Analysis (SAST)**: CodeQL scans Javascript/Typescript and Python code weekly. Ruff/Bandit checks Python code.
- **Dependency Audit**: Snyk, Trivy, and GitHub Dependabot audit libraries on push.
- **Container Security**: Trivy scans Docker base layers and final production images.
