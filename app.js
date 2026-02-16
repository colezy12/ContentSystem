// Configuration
const GITHUB_OWNER = 'colezy12';
const GITHUB_REPO = 'ContentSystem';
const GITHUB_BRANCH = 'main';
const FILES_PATH = 'files';
const BASE_URL = 'https://colezy12.github.io/ContentSystem';

// State
let selectedFiles = [];
let githubToken = '';

// DOM Elements
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const tokenInput = document.getElementById('tokenInput');
const uploadBtn = document.getElementById('uploadBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultsSection = document.getElementById('resultsSection');
const resultsList = document.getElementById('resultsList');
const recentUploads = document.getElementById('recentUploads');
const recentList = document.getElementById('recentList');

// Initialize
function init() {
    // Load token from localStorage
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
        tokenInput.value = savedToken;
        githubToken = savedToken;
        updateUploadButton();
    }

    // Load recent uploads
    loadRecentUploads();

    // Event listeners
    uploadBox.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    tokenInput.addEventListener('input', handleTokenInput);
    uploadBtn.addEventListener('click', handleUpload);

    // Drag and drop
    uploadBox.addEventListener('dragover', handleDragOver);
    uploadBox.addEventListener('dragleave', handleDragLeave);
    uploadBox.addEventListener('drop', handleDrop);
}

// File selection handlers
function handleFileSelect(e) {
    selectedFiles = Array.from(e.target.files);
    updateUploadBox();
    updateUploadButton();
}

function handleDragOver(e) {
    e.preventDefault();
    uploadBox.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    selectedFiles = Array.from(e.dataTransfer.files);
    updateUploadBox();
    updateUploadButton();
}

// Token handling
function handleTokenInput(e) {
    githubToken = e.target.value.trim();
    if (githubToken) {
        localStorage.setItem('github_token', githubToken);
    }
    updateUploadButton();
}

// Update UI
function updateUploadBox() {
    if (selectedFiles.length > 0) {
        const filesText = selectedFiles.length === 1 
            ? selectedFiles[0].name 
            : `${selectedFiles.length} files selected`;
        uploadBox.querySelector('h2').textContent = filesText;
        uploadBox.querySelector('p').textContent = 'Click to change files';
    }
}

function updateUploadButton() {
    uploadBtn.disabled = !(selectedFiles.length > 0 && githubToken);
}

// Generate random ID
function generateRandomId(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Upload to GitHub
async function uploadToGitHub(file, randomId) {
    const extension = file.name.split('.').pop();
    const fileName = `${randomId}.${extension}`;
    const filePath = `${FILES_PATH}/${fileName}`;

    const base64Content = await fileToBase64(file);

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: `Upload ${fileName}`,
            content: base64Content,
            branch: GITHUB_BRANCH
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
    }

    const data = await response.json();
    return {
        fileName,
        randomId,
        originalName: file.name,
        size: file.size,
        url: data.content.download_url,
        viewUrl: `${BASE_URL}/view.html?id=${randomId}`
    };
}

// Handle upload
async function handleUpload() {
    if (selectedFiles.length === 0 || !githubToken) return;

    // Show progress
    progressSection.style.display = 'block';
    resultsSection.style.display = 'none';
    uploadBtn.disabled = true;

    const results = [];
    const totalFiles = selectedFiles.length;

    try {
        for (let i = 0; i < totalFiles; i++) {
            const file = selectedFiles[i];
            progressText.textContent = `Uploading ${i + 1} of ${totalFiles}: ${file.name}`;
            progressFill.style.width = `${((i) / totalFiles) * 100}%`;

            const randomId = generateRandomId();
            const result = await uploadToGitHub(file, randomId);
            results.push(result);

            // Save to recent uploads
            saveRecentUpload(result);
        }

        // Complete
        progressFill.style.width = '100%';
        progressText.textContent = 'Upload complete!';

        // Show results
        setTimeout(() => {
            displayResults(results);
            progressSection.style.display = 'none';
            resultsSection.style.display = 'block';
            loadRecentUploads();
        }, 500);

    } catch (error) {
        console.error('Upload error:', error);
        progressText.textContent = `Error: ${error.message}`;
        progressText.style.color = '#c33';
    } finally {
        uploadBtn.disabled = false;
        selectedFiles = [];
        fileInput.value = '';
        uploadBox.querySelector('h2').textContent = 'Drop files here or click to upload';
        uploadBox.querySelector('p').textContent = 'Images, videos, and other files supported';
        updateUploadButton();
    }
}

// Display results
function displayResults(results) {
    resultsList.innerHTML = '';
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        resultItem.innerHTML = `
            <h4>${result.originalName}</h4>
            <p>File ID: ${result.randomId} | Size: ${formatBytes(result.size)}</p>
            <div class="result-link">
                <input type="text" value="${result.viewUrl}" readonly>
                <button class="btn-copy" onclick="copyToClipboard('${result.viewUrl}', this)">Copy</button>
            </div>
            <div class="result-link">
                <input type="text" value="${result.url}" readonly>
                <button class="btn-copy" onclick="copyToClipboard('${result.url}', this)">Copy Direct Link</button>
            </div>
        `;
        
        resultsList.appendChild(resultItem);
    });
}

// Recent uploads management
function saveRecentUpload(result) {
    let recent = JSON.parse(localStorage.getItem('recent_uploads') || '[]');
    recent.unshift({
        ...result,
        timestamp: Date.now()
    });
    recent = recent.slice(0, 20); // Keep only last 20
    localStorage.setItem('recent_uploads', JSON.stringify(recent));
}

function loadRecentUploads() {
    const recent = JSON.parse(localStorage.getItem('recent_uploads') || '[]');
    
    if (recent.length === 0) {
        recentList.innerHTML = '<p style="color: #666; text-align: center;">No recent uploads</p>';
        return;
    }

    recentList.innerHTML = '';
    
    recent.forEach(item => {
        const recentItem = document.createElement('div');
        recentItem.className = 'recent-item';
        
        const timeAgo = getTimeAgo(item.timestamp);
        
        recentItem.innerHTML = `
            <div class="recent-item-info">
                <h4>${item.originalName}</h4>
                <p>ID: ${item.randomId} | ${formatBytes(item.size)} | ${timeAgo}</p>
            </div>
            <div class="recent-item-actions">
                <button class="btn-small" onclick="window.open('${item.viewUrl}', '_blank')">View</button>
                <button class="btn-small" onclick="copyToClipboard('${item.viewUrl}', this)">Copy Link</button>
            </div>
        `;
        
        recentList.appendChild(recentItem);
    });
}

// Utility functions
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    });
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
