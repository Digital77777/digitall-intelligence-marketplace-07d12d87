/**
 * Utility to validate required environment variables on startup.
 * Prevents the application from running in a broken state.
 */
export const validateEnv = () => {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    const errorMsg = `❌ CRITICAL ERROR: Missing environment variables: ${missing.join(', ')}`;
    console.error(errorMsg);

    // In production, we might want to show a UI error instead of just throwing
    if (import.meta.env.PROD) {
      document.body.innerHTML = `
        <div style="padding: 20px; color: red; font-family: sans-serif;">
          <h1>Configuration Error</h1>
          <p>${errorMsg}</p>
          <p>Please check your deployment settings.</p>
        </div>
      `;
    }

    throw new Error(errorMsg);
  }
};
