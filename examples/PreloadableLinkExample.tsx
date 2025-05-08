import React, { useState } from 'react';
import { PreloadProvider } from '../src/context/PreloadContext';
import { PreloadableLink } from '../src/components/PreloadableLink';

// Loading component for visualizing preloading status
const LoadingIndicator: React.FC = () => (
  <span style={{ 
    display: 'inline-block', 
    width: '8px', 
    height: '8px', 
    borderRadius: '50%', 
    backgroundColor: '#4caf50', 
    marginLeft: '5px'
  }}></span>
);

/**
 * Example component demonstrating the use of PreloadProvider and PreloadableLink
 */
const PreloadableLinkExample: React.FC = () => {
  // Simulated preloading state
  const [preloadedPage, setPreloadedPage] = useState<string | null>(null);
  
  // Simulated preloading of page
  const simulatePreload = async (url: string): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    setPreloadedPage(url);
    return Promise.resolve();
  };
  
  return (
    <PreloadProvider options={{ 
      predictionHorizon: 300,
      numParticles: 500,
      processNoise: 1,
      minProbability: 0.8,
      checkFrequency: 100
    }}>
      <div style={{ padding: '20px' }}>
        <h1>PreloadableLink Demo</h1>
        
        <p>
          This example demonstrates how to use the PreloadableLink component with the PreloadProvider.
          Move your cursor towards the links to trigger preloading.
        </p>
        
        <div style={{ marginTop: '30px' }}>
          <h2>Navigation</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '600px' }}>
            {/* Example links with different priorities and preloading status */}
            <PreloadableLink 
              href="/home" 
              priority={10}
              customFetch={() => simulatePreload('/home')}
              loadingIndicator={<LoadingIndicator />}
              preloadedClassName="preloaded"
              preloadingClassName="preloading"
              style={{
                padding: '10px 20px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#333',
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
              }}
            >
              Home
            </PreloadableLink>
            
            <PreloadableLink 
              href="/about" 
              priority={8}
              customFetch={() => simulatePreload('/about')}
              loadingIndicator={<LoadingIndicator />}
              preloadedClassName="preloaded"
              preloadingClassName="preloading"
              style={{
                padding: '10px 20px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#333',
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
              }}
            >
              About
            </PreloadableLink>
            
            <PreloadableLink 
              href="/features" 
              priority={5}
              customFetch={() => simulatePreload('/features')}
              loadingIndicator={<LoadingIndicator />}
              preloadedClassName="preloaded"
              preloadingClassName="preloading"
              style={{
                padding: '10px 20px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#333',
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
              }}
            >
              Features
            </PreloadableLink>
            
            <PreloadableLink 
              href="/contact" 
              priority={3}
              customFetch={() => simulatePreload('/contact')}
              loadingIndicator={<LoadingIndicator />}
              preloadedClassName="preloaded"
              preloadingClassName="preloading"
              style={{
                padding: '10px 20px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#333',
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
              }}
            >
              Contact
            </PreloadableLink>
          </div>
        </div>
        
        {/* Information about preloading status */}
        <div style={{ marginTop: '50px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h3>Preloading Status</h3>
          {preloadedPage ? (
            <p style={{ color: '#4caf50' }}>
              Preloaded page: <strong>{preloadedPage}</strong>
            </p>
          ) : (
            <p>No pages preloaded yet. Move your cursor towards the links to trigger preloading.</p>
          )}
          <p><small>*Note: This is a simulation, no actual network requests are made</small></p>
        </div>
        
        {/* Additional information about the library */}
        <div style={{ marginTop: '50px' }}>
          <h2>How It Works</h2>
          <ol>
            <li>The <code>PreloadProvider</code> creates a context that tracks cursor movement and predictions</li>
            <li>Each <code>PreloadableLink</code> registers itself to be monitored by the provider</li>
            <li>When the cursor appears to be moving toward a link, preloading begins</li>
            <li>Links can also be manually preloaded on mouse enter</li>
            <li>Visual feedback shows preloading status</li>
          </ol>
          
          <p>
            This approach allows you to automatically preload content based on predicted user 
            interactions without manually configuring each link.
          </p>
        </div>
        
        {/* CSS for preloading styles */}
        <style>
          {`
            .preloaded {
              background-color: #c8e6c9 !important;
            }
            
            .preloading {
              background-color: #fff9c4 !important;
            }
          `}
        </style>
      </div>
    </PreloadProvider>
  );
};

export default PreloadableLinkExample; 