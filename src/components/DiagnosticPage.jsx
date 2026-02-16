import React from 'react';
import { useNavigate } from 'react-router-dom';

const DiagnosticPage = () => {
  const navigate = useNavigate();
  const diagnostics = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    environment: {
      NODE_ENV: import.meta.env.MODE,
      VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
      BASE_URL: import.meta.env.BASE_URL
    },
    features: {
      localStorage: typeof Storage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      fetch: typeof fetch !== 'undefined',
      webGL: !!window.WebGLRenderingContext
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#3b82f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            W
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            WellSense AI - Diagnostic Page
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px'
          }}>
            App is loading successfully! 🎉
          </p>
        </div>

        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            color: '#15803d',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            ✅ React App Status: WORKING
          </h3>
          <p style={{
            color: '#166534',
            fontSize: '14px'
          }}>
            If you can see this page, your React app is building and running correctly.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: '#fafafa',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Environment
            </h4>
            <pre style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {JSON.stringify(diagnostics.environment, null, 2)}
            </pre>
          </div>

          <div style={{
            backgroundColor: '#fafafa',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Browser Features
            </h4>
            <pre style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {JSON.stringify(diagnostics.features, null, 2)}
            </pre>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fed7aa',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            color: '#d97706',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            🔧 Next Steps
          </h3>
          <ul style={{
            color: '#92400e',
            fontSize: '14px',
            paddingLeft: '1rem',
            lineHeight: '1.5'
          }}>
            <li>Configure environment variables</li>
            <li>Set up MongoDB Atlas connection</li>
            <li>Configure Google OAuth credentials</li>
            <li>Test authentication flow</li>
          </ul>
        </div>

        <div style={{
          textAlign: 'center'
        }}>
          <button
            onClick={() => navigate('/auth')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              marginRight: '0.5rem'
            }}
          >
            Go to Login
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <strong>Diagnostic Info:</strong><br/>
          Timestamp: {diagnostics.timestamp}<br/>
          URL: {diagnostics.url}<br/>
          User Agent: {diagnostics.userAgent.substring(0, 100)}...
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;