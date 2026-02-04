import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { DateProvider } from './context/DateContext.jsx'
import { LoadingProvider } from './context/LoadingContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import { FilterProvider } from './context/FilterContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DateProvider>
        <LoadingProvider>
          <DataProvider>
            <FilterProvider>
              <App />
            </FilterProvider>
          </DataProvider>
        </LoadingProvider>
      </DateProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
