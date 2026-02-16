// Configuration
const GITHUB_OWNER = 'colezy12';
const GITHUB_REPO = 'ContentSystem';
const FILES_PATH = 'files';

// Get file ID from URL
const urlParams = new URLSearchParams(window.location.search);
const fileId = urlParams.get('id');

// DOM Elements
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const fileContent = document.getElementById('fileContent');
const fileName = document.getElementById('fileName');
const filePreview = document.getElementById('filePreview');
const fileInfo = document.getElementById('fileInfo');
const downloadBtn = document.getElementById('downloadBtn');
const viewRawBtn = document.getElementById('viewRawBtn');

// Initialize
async function init() {
    if (!fileId) {
        showError('No file ID provided. Please check your link.');
        return;
    }

    try {
        await loadFile(fileId);
    } catch (error) {
        console.error('Error loading file:', error);
        showError(error.message);
    }
}

// Load file from GitHub
async function loadFile(id) {
    // Try to find the file by searching for files with this ID
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILES_PATH}`;
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to load file list');
        }

        const files = await response.json();
        const file = files.find(f => f.name.startsWith(id + '.'));

        if (!file) {
            throw new Error('File not found');
        }

        await displayFile(file);
    } catch (error) {
        throw new Error(`Could not load file: ${error.message}`);
    }
}

// Display file
async function displayFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    const fileUrl = file.download_url;

    // Update page title and meta tags for Discord embed
    const fileNameText = file.name;
    document.title = `${fileNameText} - ContentSystem`;
    fileName.textContent = fileNameText;

    // Set Open Graph meta tags for better Discord embeds
    updateMetaTags(fileUrl, fileNameText, extension);

    // Create preview based on file type
    createPreview(fileUrl, extension);

    // Update file info
    updateFileInfo(file);

    // Set download links
    downloadBtn.href = fileUrl;
    downloadBtn.download = file.name;
    viewRawBtn.href = fileUrl;

    // Hide loading, show content
    loadingState.style.display = 'none';
    fileContent.style.display = 'block';
}

// Update meta tags for Discord embeds
function updateMetaTags(url, name, extension) {
    // Set image/video meta tags
    const metaImage = document.querySelector('meta[property="og:image"]') || createMetaTag('og:image');
    const metaVideo = document.querySelector('meta[property="og:video"]') || createMetaTag('og:video');
    const metaTitle = document.querySelector('meta[property="og:title"]') || createMetaTag('og:title');
    const metaUrl = document.querySelector('meta[property="og:url"]') || createMetaTag('og:url');
    
    metaTitle.content = name;
    metaUrl.content = window.location.href;

    if (isImage(extension)) {
        metaImage.content = url;
        document.querySelector('meta[name="twitter:card"]').content = 'summary_large_image';
    } else if (isVideo(extension)) {
        metaVideo.content = url;
        metaImage.content = url; // Some platforms need both
        const metaVideoType = document.querySelector('meta[property="og:video:type"]') || createMetaTag('og:video:type');
        metaVideoType.content = `video/${extension}`;
    }
}

function createMetaTag(property) {
    const meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
    return meta;
}

// Create preview
function createPreview(url, extension) {
    filePreview.innerHTML = '';

    if (isImage(extension)) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'File preview';
        filePreview.appendChild(img);
    } else if (isVideo(extension)) {
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        video.autoplay = false;
        filePreview.appendChild(video);
    } else if (isAudio(extension)) {
        const audio = document.createElement('audio');
        audio.src = url;
        audio.controls = true;
        audio.autoplay = false;
        filePreview.appendChild(audio);
    } else {
        filePreview.innerHTML = `
            <div style="padding: 40px; color: #666;">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-bottom: 20px;">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                </svg>
                <h3>File Preview Not Available</h3>
                <p>Use the download button below to download this file</p>
            </div>
        `;
    }
}

// Update file info
function updateFileInfo(file) {
    const infoHtml = `
        <h3>File Information</h3>
        <div class="info-row">
            <span class="info-label">File Name:</span>
            <span class="info-value">${file.name}</span>
        </div>
        <div class="info-row">
            <span class="info-label">File Size:</span>
            <span class="info-value">${formatBytes(file.size)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">File Type:</span>
            <span class="info-value">${file.name.split('.').pop().toUpperCase()}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Share Link:</span>
            <span class="info-value">
                <input type="text" value="${window.location.href}" readonly style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 5px;">
            </span>
        </div>
    `;
    fileInfo.innerHTML = infoHtml;
}

// Show error
function showError(message) {
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    errorState.className = 'error';
    errorState.innerHTML = `
        <h2>Error Loading File</h2>
        <p>${message}</p>
        <a href="index.html" class="back-link">← Go back to upload</a>
    `;
}

// File type helpers
function isImage(ext) {
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext);
}

function isVideo(ext) {
    return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm4v'].includes(ext);
}

function isAudio(ext) {
    return ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].includes(ext);
}

// Format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
