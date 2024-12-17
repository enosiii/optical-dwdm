
import { CONFIG } from './config.js';

const apiKey = CONFIG.API_KEY;
const folderId = CONFIG.FOLDER_ID;

let currentFolderId = folderId;
let folderHistory = [{ id: folderId, name: "Optical Solutions" }]; // Array to track the folder navigation with names

// Function to fetch files from Google Drive
async function fetchFiles(folderId) {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType)`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.files && data.files.length > 0) {
            displayFiles(data.files);
        } else {
            document.getElementById("file-list").textContent = "No files found.";
        }
    } catch (error) {
        console.error("Error fetching files:", error);
        document.getElementById("file-list").textContent = "Failed to load files.";
    }
}

// Function to display files and folders
function displayFiles(files) {
    const fileList = document.getElementById("file-list");
    fileList.innerHTML = ""; // Clear any existing content

    files
        .sort((a, b) => {
            const numA = extractLeadingNumber(a.name);
            const numB = extractLeadingNumber(b.name);
            return numA - numB;
        })
        .forEach(file => {
            const listItem = document.createElement("li");
            const link = document.createElement("a");
            link.textContent = file.name;

            if (file.mimeType === "application/vnd.google-apps.folder") {
                // Subfolder: Set up navigation
                link.href = "#";
                link.addEventListener("click", () => {
                    currentFolderId = file.id;
                    folderHistory.push({ id: file.id, name: file.name }); // Add folder name and id to history
                    fetchFiles(file.id);
                    updateNavPath(); // Update navigation path
                });
            } else {
                // File: Display embedded viewer
                link.href = "#";
                link.addEventListener("click", () => {
                    openFile(file);
                });
            }

            listItem.appendChild(link);
            fileList.appendChild(listItem);
        });
}

// Function to extract leading number from a name
function extractLeadingNumber(name) {
    const match = name.match(/^\d+/);
    return match ? parseInt(match[0], 10) : Number.MAX_VALUE;
}

// Function to open a file with an embedded viewer
function openFile(file) {
    const viewer = document.getElementById("file-viewer");

    if (file.mimeType === "application/pdf") {
        // PDF Viewer
        viewer.innerHTML = `<iframe src="https://drive.google.com/file/d/${file.id}/preview" width="100%" height="600px"></iframe>`;
    } else if (file.mimeType.startsWith("video/mp4")) {
        // Google Drive video player embed
        viewer.innerHTML = `<iframe src="https://drive.google.com/file/d/${file.id}/preview" width="100%" height="400px"></iframe>`;
    } else if (file.name.endsWith(".pptx")) {
        // PowerPoint Viewer (using Office Online)
        viewer.innerHTML = `<iframe src="https://drive.google.com/file/d/${file.id}/preview" width="100%" height="600px" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>`;
    } else {
        // Default: Download link
        viewer.innerHTML = `<p>Download: <a href="https://drive.google.com/uc?id=${file.id}&export=download" target="_blank">${file.name}</a></p>`;
    }
}

// Function to update the navigation path
function updateNavPath() {
    const navPath = document.getElementById("nav-path");
    navPath.innerHTML = ''; // Clear previous path

    // Create links for each folder in the history
    folderHistory.forEach((folder, index) => {
        const link = document.createElement("a");
        link.href = "#";
        link.textContent = folder.name; // Display actual folder name
        link.addEventListener("click", () => {
            // Navigate to the folder
            currentFolderId = folder.id;
            fetchFiles(folder.id);
            folderHistory = folderHistory.slice(0, index + 1); // Keep history up to the clicked folder
            updateNavPath(); // Update navigation path
        });

        navPath.appendChild(link);
        if (index < folderHistory.length - 1) {
            navPath.appendChild(document.createTextNode(" > "));
        }
    });
}

// Fetch files from the main folder when the page loads
fetchFiles(currentFolderId);
updateNavPath(); // Initialize navigation path
