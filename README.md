# RTM Viewer

A React-based Requirements Traceability Matrix (RTM) viewer that helps visualize and manage test coverage across requirements and user stories.

## Features

- View test coverage for both requirements and user stories
- Filter and search capabilities:
  - Search by title
  - Filter by test case type
  - Filter by tags
  - Filter by coverage status
- Interactive coverage summary dashboard
- Detailed test case information for each requirement/user story
- Export data to CSV
- Responsive design with mobile support
- Pagination for better performance with large datasets

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/rtm-viewer.git
cd rtm-viewer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Running the Application

1. Ensure you have a `rtm-data.json` file in your public directory with the following structure:
```json
{
  "summary": {
    "totalRequirements": number,
    "totalUserStories": number,
    "totalTestCases": number,
    "coverage": {
      "requirements": {
        "covered": number,
        "percentage": number
      },
      "userStories": {
        "covered": number,
        "percentage": number
      }
    }
  },
  "coverage": {
    "requirements": {
      "REQ-001": ["TC-001", "TC-002"],
      // ... more requirements
    },
    "userStories": {
      "US-001": ["TC-001", "TC-003"],
      // ... more user stories
    }
  },
  "execution": {
    "testCases": [
      {
        "id": "TC-001",
        "title": "Test Case Title",
        "type": "Functional",
        "priority": "High",
        "automated": boolean,
        "tags": ["tag1", "tag2"]
      }
      // ... more test cases
    ]
  }
}
```

2. Start the development server:
```bash
npm start
# or
yarn start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

- Toggle between Requirements and User Stories views using the tabs at the top
- Use the filter bar to search and filter items:
  - Search by title using the search box
  - Filter by test case type using the dropdown
  - Filter by tags using the tag dropdown
  - Filter by coverage status using the coverage buttons
- Click on any item to expand and view detailed test case information
- Use the Export to CSV button to download the current filtered data
- Navigate through pages using the pagination controls at the bottom

## Dependencies

- React
- Lucide React (for icons)
- react-csv (for CSV export functionality)
- Tailwind CSS (for styling)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details