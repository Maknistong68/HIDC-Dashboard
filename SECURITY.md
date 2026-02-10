# HIDC Dashboard Security Policy

## Overview

HIDC (Hazard Identification and Data Control) Dashboard is an offline-first web application designed for HSE (Health, Safety, Environment) data analysis. This document outlines security considerations, known issues, and deployment requirements.

## Security Architecture

### Privacy-First Design

- **Zero External API Calls**: The application makes no external network requests
- **Offline-First**: All data is stored locally in IndexedDB
- **No Tracking/Analytics**: No third-party analytics or tracking scripts
- **No Cloud Dependencies**: Data never leaves the user's device

### Security Headers

The application includes the following security headers via HTML meta tags:

- **Content-Security-Policy**: Restricts script and resource loading
- **X-Frame-Options**: DENY - Prevents clickjacking
- **X-Content-Type-Options**: nosniff - Prevents MIME type sniffing
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Disables unnecessary browser features

### File Upload Security

- **MIME Type Validation**: Validates uploaded files have correct MIME type
- **Magic Byte Verification**: Checks file signatures to prevent disguised malicious files
- **File Size Limits**: Maximum 50MB per file to prevent DoS
- **Extension Validation**: Only .xlsx and .xls files accepted

### Data Validation

- **Field Length Limits**: All text fields are truncated to prevent memory exhaustion
- **Control Character Sanitization**: Removes null bytes and control characters
- **Safe JSON Parsing**: All JSON.parse calls wrapped with error handling

### Audit Logging

Security-sensitive operations are logged to IndexedDB:
- Data exports (PDF, JSON, PPTX)
- File imports
- File deletions
- Data access events

## Known Vulnerabilities

### Third-Party Dependencies

| Package | Version | Issue | Severity | Notes |
|---------|---------|-------|----------|-------|
| jspdf | 3.0.4+ | GHSA-ww28-x9jm-25r6 | High | Upgrade to v4 when stable |
| xlsx | 0.18.5 | Prototype pollution | Medium | No fix available; library deprecated |

### Mitigation Strategies

1. **jsPDF**: The vulnerability affects PDF parsing, not generation. Our usage (generation only) has lower risk.
2. **xlsx**: Consider migrating to ExcelJS or SheetJS Pro for production deployments requiring security certification.

## Deployment Requirements

### Server-Level Security Headers

The following headers MUST be configured at the HTTP server level (Nginx/Apache/Vercel):

```nginx
# Example Nginx configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'none';" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### HTTPS Requirements

- TLS 1.2 or higher required
- Valid SSL certificate
- HTTP to HTTPS redirect

### Authentication (Optional)

For enterprise deployment, consider adding:
- SSO integration (OAuth 2.0 / SAML)
- Role-based access control
- Session timeout policies

### Upload Limits

Configure server-level upload limits:
- Maximum upload size: 50MB
- Request timeout: 5 minutes (for large file processing)

## Security Checklist

Before deployment, verify:

- [ ] HTTPS enabled with TLS 1.2+
- [ ] HSTS header configured
- [ ] Security headers configured at server level
- [ ] Maximum upload size configured
- [ ] Regular dependency updates scheduled
- [ ] Access logging enabled
- [ ] Error pages do not expose stack traces

## Reporting Security Issues

If you discover a security vulnerability, please:

1. Do not disclose publicly
2. Report to the development team
3. Include steps to reproduce
4. Allow reasonable time for patching

## Audit Log Access

Audit logs can be accessed programmatically:

```javascript
import { getAuditLogs, exportAuditLogs } from './src/utils/auditLogger'

// Get recent logs
const logs = await getAuditLogs({ limit: 100 })

// Export for compliance review
const export = await exportAuditLogs({
  startDate: '2024-01-01',
  endDate: '2024-12-31'
})
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2026 | Initial security implementation |

---

*This document should be reviewed and updated with each release.*
