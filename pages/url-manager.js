import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';

export default function URLManager() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPages, setExpandedPages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from MongoDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/links');
        const result = await response.json();
        
        // Check if result is an array, if not use empty array
        setData(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
        setData([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle marking a link as updated
  const handleMarkAsUpdated = async (pageId, linkIndex) => {
    try {
      const response = await fetch('/api/links/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          linkIndex,
          userId: 'current-user-id' // Replace with actual user ID
        }),
      });

      if (response.ok) {
        // Update local state
        setData(prevData => {
          return prevData.map(page => {
            if (page._id === pageId) {
              const updatedLinks = [...page.links];
              updatedLinks[linkIndex] = {
                ...updatedLinks[linkIndex],
                is_updated: true,
                updated_at: new Date(),
              };
              return { ...page, links: updatedLinks };
            }
            return page;
          });
        });
      }
    } catch (error) {
      console.error('Error updating link status:', error);
    }
  };

  const filteredData = Array.isArray(data) ? data.map(pageGroup => ({
    ...pageGroup,
    links: (pageGroup.links || []).filter(link => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (link.original_url || '').toLowerCase().includes(searchTermLower) ||
        (link.final_url || '').toLowerCase().includes(searchTermLower) ||
        (link.anchor_text || '').toLowerCase().includes(searchTermLower)
      );
    })
  })).filter(pageGroup => pageGroup.links.length > 0) : [];

  const toggleExpand = (pageUrl) => {
    setExpandedPages(prev => ({
      ...prev,
      [pageUrl]: !prev[pageUrl]
    }));
  };

  const toggleAllPages = () => {
    if (Object.values(expandedPages).every(v => v)) {
      // If all are expanded, collapse all
      setExpandedPages({});
    } else {
      // Expand all
      const allExpanded = {};
      filteredData.forEach(page => {
        allExpanded[page.page_url] = true;
      });
      setExpandedPages(allExpanded);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Static Links Manager</h1>
        <p className="text-gray-600">
          Manage and monitor static links across your website pages. Track redirects, broken links, and update statuses.
        </p>
      </div>

      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Needs Update</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Updated</span>
          </div>
          <button
            onClick={toggleAllPages}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ml-4"
          >
            {Object.values(expandedPages).every(v => v) ? 'Collapse All Pages' : 'Expand All Pages'}
          </button>
        </div>
        <div className="w-1/3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search pages, URLs or anchor text..."
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-center text-red-600 p-4">
          {error}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center text-gray-600 p-4">
          No links found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredData.map((pageData, index) => {
            const needsUpdateCount = pageData.links.filter(link => 
              link.original_url !== link.final_url || link.status_code !== 200
            ).length;
            const isExpanded = expandedPages[pageData.page_url];
            
            return (
              <div key={index} className="bg-white rounded-lg shadow-md">
                <button
                  onClick={() => toggleExpand(pageData.page_url)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-800">{pageData.page_url}</h2>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {pageData.links.length} URLs
                    </span>
                    {needsUpdateCount > 0 && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        {needsUpdateCount} needs update
                      </span>
                    )}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="border-t border-gray-100 p-6 space-y-4">
                    {pageData.links.map((link, linkIndex) => {
                      const needsUpdate = link.original_url !== link.final_url || link.status_code !== 200;
                      
                      return (
                        <div 
                          key={linkIndex}
                          className={`p-4 rounded-lg ${needsUpdate ? 'bg-red-50 border-l-4 border-red-500' : 'bg-green-50 border-l-4 border-green-500'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-grow">
                              <div className="mb-2">
                                <span className="font-medium">Original URL: </span>
                                <span className="text-gray-700 break-all">{link.original_url}</span>
                              </div>
                              <div className="mb-2">
                                <span className="font-medium">Final URL: </span>
                                <span className="text-gray-700 break-all">{link.final_url}</span>
                              </div>
                              <div className="mb-2">
                                <span className="font-medium">Anchor Text: </span>
                                <span className="italic text-gray-600">
                                  {link.anchor_text || <em className="text-gray-400">No anchor text</em>}
                                </span>
                              </div>
                              <div className="mb-2">
                                <span className="font-medium">Status Code: </span>
                                <span className={`${link.status_code === 200 ? 'text-green-600' : 'text-red-600'}`}>
                                  {link.status_code}
                                </span>
                              </div>
                              {link.redirect_history && link.redirect_history.length > 1 && (
                                <div className="mt-3">
                                  <span className="font-medium">Redirect Chain:</span>
                                  <div className="ml-4 mt-1 space-y-1">
                                    {link.redirect_history.map((url, idx) => (
                                      <div key={idx} className="flex items-center text-sm">
                                        <span className="text-gray-500">{idx + 1}.</span>
                                        <span className="ml-2 text-gray-700 break-all">{url}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                needsUpdate 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-green-500 text-white'
                              }`}>
                                {needsUpdate ? 'Needs Update' : 'Updated'}
                              </span>
                              {needsUpdate && !link.is_updated && (
                                <button 
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                  onClick={() => handleMarkAsUpdated(pageData._id, linkIndex)}
                                >
                                  Mark as Updated
                                </button>
                              )}
                              {link.is_updated && (
                                <div className="text-sm text-gray-500">
                                  Updated at: {new Date(link.updated_at).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
} 