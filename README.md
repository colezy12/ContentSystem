# ContentSystem

Upload and share files with random links - Perfect for bypassing Discord's 10MB limit!

## Features

- 📤 **Easy File Upload**: Drag and drop or click to upload files
- 🔗 **Random Links**: Each upload gets a unique, shareable link
- 🎮 **Discord Embed**: Files can be embedded directly in Discord
- 💾 **No Storage Limits**: Uses GitHub as backend storage
- 🎨 **Clean Interface**: Modern, responsive design

## How to Use

### Setup

1. **Generate a GitHub Personal Access Token**:
   - Go to [GitHub Token Settings](https://github.com/settings/tokens/new?scopes=repo)
   - Create a token with `repo` scope
   - Copy the token (starts with `ghp_`)

2. **Visit the Website**:
   - Open [https://colezy12.github.io/ContentSystem/](https://colezy12.github.io/ContentSystem/)
   
3. **Upload Files**:
   - Paste your GitHub token (it will be saved in your browser)
   - Drag and drop files or click to select
   - Click "Upload Files"
   - Get your shareable links!

### Using Links

- **View Link**: Share this link to let people view and download the file
- **Direct Link**: Use this for embedding in Discord or direct downloads

### Discord Embedding

For images and videos to embed properly in Discord:
- Use the **Direct Link** (ends with the file extension)
- Discord will automatically embed images and videos

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- Uses GitHub API for file storage
- Hosted on GitHub Pages
- No server-side code required

## Privacy & Security

- Your GitHub token is stored only in your browser's localStorage
- Files are stored in this public GitHub repository
- Anyone with the link can access uploaded files
- Don't upload sensitive or private content

## License

MIT License - Feel free to use and modify!
