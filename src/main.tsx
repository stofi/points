import './tailwind.css'
import './index.css'

import ReactDOM from 'react-dom/client'

import App from './App'
import Experience from './Experience'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <>
    <Experience />
    <App />
  </>,
)
