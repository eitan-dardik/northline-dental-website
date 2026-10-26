//the provider + useContent
//The provider runs the Effect (loads once) and holds the state (loading → ready or error). It doesn’t draw anything itself; it broadcasts the state to every page
import { createContext, useContext, useEffect, useState } from 'react';
import { loadContent } from '../lib/data/content.js';

// The channel every page reads from. null = read outside the provider (a bug).
const ContentContext = createContext(null);

// Loads the content once, holds loading / ready / error, and shares it.
export function ContentProvider({ children }) {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let ignore = false;                       // this run's own flag (see the cleanup)

    loadContent()
      .then((content) => {
        if (!ignore) setState({ status: 'ready', content });
      })
      .catch((error) => {
        console.error(error);                 // for the developer; visitors see the error state
        if (!ignore) setState({ status: 'error', error });
      });

    return () => {
      ignore = true;                          // a late answer from this run is ignored
    };
  }, []);                                     // run once, after the first render

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>;
}

// Pages call this to get { status, content } or { status, error }.
export function useContent() {
  return useContext(ContentContext);
}