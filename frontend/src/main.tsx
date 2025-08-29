import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

// Comment out Font Awesome temporarily
// import '../node_modules/@fortawesome/fontawesome-free/css/all.min.css'

// Import Font Awesome for icons
// Try one of these alternative imports:

// Option 1: Use relative path from node_modules
// import '../node_modules/@fortawesome/fontawesome-free/css/all.min.css'

// Option 2: Use fontawesome-free directly 
// import '@fortawesome/fontawesome-free/css/all.css'

// Option 3: Use CDN instead
// Remove the import and add this to your index.html:
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
