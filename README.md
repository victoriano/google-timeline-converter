# Google Timeline Converter

A browser-based tool that converts Google Location History JSON files to CSV format entirely client-side. Your location history data never leaves your browser, ensuring privacy.

## Features

- Converts Google Location History JSON files to CSV
- 100% client-side processing (no data is sent to any server)
- Handles multiple Google Location History JSON formats:
  - Array format `[{...}, {...}]`
  - Object format with "item" property `{"item": [{...}, {...}]}`
  - Newer format with "locations" property
- Extracts visit, activity, and movement data
- Drag-and-drop interface
- Progress indicators for large files

## How to Use

### Option 1: Use the Live Version

Visit [https://google-timeline-converter.vercel.app](https://google-timeline-converter.vercel.app) (or your deployed URL)

### Option 2: Use Locally

1. Download the `converter.html` file
2. Double-click to open directly in your browser (important: don't serve through a web server)
3. Upload your Google Location History JSON file
4. Select the correct format (Array or Object)
5. Download the resulting CSV

## Development

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Project Structure

- `converter.html` - Standalone version (can be used directly)
- `index.html` - Main HTML file for the built version
- `src/` - TypeScript source files
- `dist/` - Compiled JavaScript (created after build)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/google-timeline-converter.git
   cd google-timeline-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Building

```bash
npm run build
```

This creates a `dist/` folder with compiled JavaScript.

## Deployment to Vercel

### Option 1: Using the Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

4. Follow the prompts. For a static site like this, the defaults will work fine.

### Option 2: Connecting to GitHub

1. Push your repository to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up/log in
3. Click "New Project"
4. Select your GitHub repository
5. Use these settings:
   - Framework Preset: Other
   - Build Command: `npm run build` (or leave empty if you want to deploy the standalone version)
   - Output Directory: `dist` (or `.` for standalone version)
6. Click "Deploy"

### Deploying Updates

After making changes:

1. Commit your changes to Git
2. If using GitHub integration, push to GitHub and Vercel will automatically deploy
3. If using CLI, run `vercel` again (or `vercel --prod` to deploy to production)

## Customization

### Modifying the Standalone Version

To modify the standalone version (`converter.html`):
1. Edit the file directly in a text editor
2. Test locally by opening in your browser

### Modifying the TypeScript Version

1. Edit files in the `src/` directory
2. Run `npm run dev` to see changes
3. Build with `npm run build` when done

## Privacy

This tool processes all data locally in your browser. No data is sent to any server at any point in the conversion process.

## License

MIT License 