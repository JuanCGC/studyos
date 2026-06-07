import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', background: 'var(--bg)', color: 'var(--t2)', fontFamily: 'var(--mono)',
          padding: 32, textAlign: 'center', gap: 16,
        }}>
          <i className="ph ph-warning-circle" style={{ fontSize: 48, color: 'var(--red2)' }}></i>
          <h2 style={{ color: 'var(--t1)', margin: 0 }}>Something went wrong</h2>
          <p style={{ fontSize: 13, maxWidth: 480, lineHeight: 1.6, color: 'var(--t3)' }}>
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{
              marginTop: 8, padding: '10px 24px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--t1)', cursor: 'pointer', fontSize: 13,
              fontFamily: 'var(--mono)',
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
