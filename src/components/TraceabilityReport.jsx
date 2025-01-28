import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle, X, Info, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { CSVLink } from 'react-csv'; // For export functionality

const TraceabilityReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requirements');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [expandedRow, setExpandedRow] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/rtm-data.json');
        const jsonData = await response.json();
        
        // Transform the data to match the expected structure
        const transformedData = {
          summary: jsonData.summary,
          details: {
            requirements: Object.keys(jsonData.coverage.requirements).map((reqId) => ({
              id: reqId,
              title: reqId,
              coverage: {
                testCases: jsonData.coverage.requirements[reqId],
              },
            })),
            userStories: Object.keys(jsonData.coverage.userStories).map((usId) => ({
              id: usId,
              title: usId,
              coverage: {
                testCases: jsonData.coverage.userStories[usId],
              },
            })),
            testCases: jsonData.execution.testCases,
          },
        };

        setData(transformedData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Extract unique types and tags from testCases
  const uniqueTypes = data ? [...new Set(data.details.testCases.map((tc) => tc.type))] : [];
  const uniqueTags = data ? [...new Set(data.details.testCases.flatMap((tc) => tc.tags || []))] : [];

  // Filter and sort data
  const filteredData = (data ? (activeTab === 'requirements' ? data.details.requirements : data.details.userStories) : [])
    .filter((item) => {
      // Filter by coverage status
      if (filterStatus === 'nocoverage' && item.coverage?.testCases?.length > 0) return false;
      if (filterStatus === 'coverage' && item.coverage?.testCases?.length === 0) return false;

      // Filter by search query
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      // Filter by type and tag
      const testCases = item.coverage?.testCases || [];
      const testCaseDetails = testCases.map((tcId) =>
        data.details.testCases.find((tc) => tc.id === tcId)
      ).filter((tc) => tc);

      if (filterType !== 'all' && !testCaseDetails.some((tc) => tc.type === filterType)) return false;
      if (filterTag !== 'all' && !testCaseDetails.some((tc) => tc.tags?.includes(filterTag))) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'id') {
        return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
      }
      if (sortBy === 'title') {
        return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      }
      if (sortBy === 'priority') {
        return sortOrder === 'asc' ? a.priority.localeCompare(b.priority) : b.priority.localeCompare(a.priority);
      }
      return 0;
    });

  // Paginate data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Clear all filters
  const clearFilters = () => {
    setFilterStatus('all');
    setFilterType('all');
    setFilterTag('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Active filters display
  const activeFilters = [];
  if (filterStatus !== 'all') activeFilters.push(`Status: ${filterStatus}`);
  if (filterType !== 'all') activeFilters.push(`Type: ${filterType}`);
  if (filterTag !== 'all') activeFilters.push(`Tag: ${filterTag}`);
  if (searchQuery) activeFilters.push(`Search: "${searchQuery}"`);

  // Export data
  const exportData = filteredData.map((item) => ({
    ID: item.id,
    Title: item.title,
    Type: item.type,
    Priority: item.priority,
    Description: item.description,
    Coverage: item.coverage?.testCases?.length || 0,
  }));

  // CoverageStatus component
  const CoverageStatus = ({ item }) => {
    const testCases = item.coverage?.testCases || [];

    if (!testCases) {
      return (
        <div className="flex items-center space-x-2 text-orange-500">
          <AlertTriangle className="h-5 w-5" />
          <span>Not Mapped</span>
        </div>
      );
    }
    if (testCases.length === 0) {
      return (
        <div className="flex items-center space-x-2 text-red-500">
          <X className="h-5 w-5" />
          <span>No Coverage</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-2">
        <Check className="h-5 w-5 text-green-500" />
        <div className="bg-blue-50 px-3 py-1 rounded">
          <span className="font-semibold">{testCases.length}</span> Test Cases
        </div>
      </div>
    );
  };

  // TestCaseList component
  const TestCaseList = ({ testCases, allTestCases }) => {
    if (!testCases || !allTestCases) return null;

    // Map test case IDs to full test case objects
    const testCaseDetails = testCases.map((tcId) =>
      allTestCases.find((tc) => tc.id === tcId)
    ).filter((tc) => tc);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {testCaseDetails.map((test) => (
          <div
            key={test.id}
            className="flex flex-col space-y-2 bg-gray-50 p-3 rounded"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">{test.id}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                test.automated ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {test.automated ? 'Automated' : 'Manual'}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-1">{test.title}</p>
            <div className="flex flex-wrap gap-1">
              <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                {test.type}
              </span>
              <span className="text-xs bg-purple-100 px-2 py-1 rounded">
                {test.priority}
              </span>
              {test.tags?.map((tag) => (
                <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // CoverageSummary component
  const CoverageSummary = () => {
    if (!data?.summary) return null;

    const summary = data.summary;
    const currentMetrics = activeTab === 'requirements'
      ? summary.coverage?.requirements
      : summary.coverage?.userStories;

    if (!currentMetrics) return null;

    // Round coverage percentage to integer
    const coveragePercentage = Math.round(currentMetrics.percentage);

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg mb-6">
        <div>
          <p className="text-sm text-gray-600">Total Items</p>
          <p className="text-xl font-bold">
            {activeTab === 'requirements' ? summary.totalRequirements : summary.totalUserStories}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Test Cases</p>
          <p className="text-xl font-bold">{summary.totalTestCases}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Coverage</p>
          <p className="text-xl font-bold text-green-600">
            {coveragePercentage}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Covered Items</p>
          <p className="text-xl font-bold">
            {currentMetrics.covered} / {activeTab === 'requirements' ? summary.totalRequirements : summary.totalUserStories}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading data...</p>
      </div>
    );
  }

  if (!data || !data.details) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Error loading data. Please ensure rtm-data.json exists on the server.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Coverage Traceability Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-b mb-4">
            <div className="flex space-x-4">
              <button
                className={`pb-2 px-4 ${
                  activeTab === 'requirements'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500'
                }`}
                onClick={() => {
                  setActiveTab('requirements');
                  setCurrentPage(1);
                }}
              >
                Requirements Coverage
              </button>
              <button
                className={`pb-2 px-4 ${
                  activeTab === 'userStories'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500'
                }`}
                onClick={() => {
                  setActiveTab('userStories');
                  setCurrentPage(1);
                }}
              >
                User Stories Coverage
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              type="text"
              placeholder="Search by title..."
              className="px-3 py-1 rounded bg-gray-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="px-3 py-1 rounded bg-gray-100"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-1 rounded bg-gray-100"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
            >
              <option value="all">All Tags</option>
              {uniqueTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <button
              className={`px-3 py-1 rounded ${
                filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setFilterStatus('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-1 rounded ${
                filterStatus === 'coverage' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setFilterStatus('coverage')}
            >
              With Coverage
            </button>
            <button
              className={`px-3 py-1 rounded ${
                filterStatus === 'nocoverage' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setFilterStatus('nocoverage')}
            >
              No Coverage
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
            <CSVLink
              data={exportData}
              filename="traceability-report.csv"
              className="px-3 py-1 rounded bg-green-100 hover:bg-green-200"
            >
              Export to CSV
            </CSVLink>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map((filter, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded"
                >
                  <span>{filter}</span>
                  <button
                    onClick={() => {
                      if (filter.startsWith('Status')) setFilterStatus('all');
                      if (filter.startsWith('Type')) setFilterType('all');
                      if (filter.startsWith('Tag')) setFilterTag('all');
                      if (filter.startsWith('Search')) setSearchQuery('');
                    }}
                  >
                    <X className="h-4 w-4 text-gray-600 hover:text-gray-800" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Coverage Summary */}
          <CoverageSummary />

          {/* Table */}
          <div className="space-y-6">
            {paginatedData.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p>No results found. Try adjusting your filters.</p>
              </div>
            ) : (
              paginatedData.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{item.id}</h3>
                      <p className="text-base font-medium text-gray-800">{item.title}</p>
                      {item.type && (
                        <p className="text-sm text-gray-600">
                          Type: {item.type} | Priority: {item.priority}
                        </p>
                      )}
                    </div>
                    <CoverageStatus item={item} />
                  </div>
                  {expandedRow === item.id && (
                    <div className="mt-4">
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                      {item.coverage?.testCases?.length > 0 && (
                        <TestCaseList
                          testCases={item.coverage.testCases}
                          allTestCases={data.details.testCases}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <button
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="mx-4">
              Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage * itemsPerPage >= filteredData.length}
            >
              Next
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TraceabilityReport;