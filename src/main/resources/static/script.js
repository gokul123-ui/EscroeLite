/**
 * EscrowLite - Frontend Application Logic
 * Pure JavaScript using Fetch API
 */

const API_BASE_URL = 'http://localhost:8081/api';

// Application State
let state = {
    projects: [],
    selectedProjectId: null,
    stats: {
        totalProjects: 0,
        activeProjects: 0,
        totalAmount: 0,
        releasedAmount: 0
    }
};

// DOM Elements
const statTotalProjects = document.getElementById('stat-total-projects');
const statActiveProjects = document.getElementById('stat-active-projects');
const statTotalAmount = document.getElementById('stat-total-amount');
const statReleasedAmount = document.getElementById('stat-released-amount');

const projectsList = document.getElementById('projects-list');
const projectCountBadge = document.getElementById('project-count-badge');
const projectSearchInput = document.getElementById('project-search-input');

const noProjectSelected = document.getElementById('no-project-selected');
const projectDetailsContent = document.getElementById('project-details-content');

const detailProjectName = document.getElementById('detail-project-name');
const detailProjectStatus = document.getElementById('detail-project-status');
const detailProjectDesc = document.getElementById('detail-project-desc');
const detailClientName = document.getElementById('detail-client-name');
const detailFreelancerName = document.getElementById('detail-freelancer-name');
const detailTotalAmount = document.getElementById('detail-total-amount');
const detailReleasedAmount = document.getElementById('detail-released-amount');
const projectProgressPercent = document.getElementById('project-progress-percent');
const projectProgressFill = document.getElementById('project-progress-fill');

const milestonesList = document.getElementById('milestones-list');
const milestoneCountBadge = document.getElementById('milestone-count-badge');

const modalCreateProject = document.getElementById('modal-create-project');
const modalAddMilestone = document.getElementById('modal-add-milestone');
const formCreateProject = document.getElementById('form-create-project');
const formAddMilestone = document.getElementById('form-add-milestone');
const milestoneProjectIdInput = document.getElementById('milestone-project-id');

const btnOpenCreateModal = document.getElementById('btn-open-create-modal');
const btnRefreshData = document.getElementById('btn-refresh-data');
const btnAddMilestone = document.getElementById('btn-add-milestone');
const btnDeleteProject = document.getElementById('btn-delete-project');

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    loadDashboardData();
});

function initEventListeners() {
    // Refresh Button
    btnRefreshData.addEventListener('click', () => {
        loadDashboardData();
        showToast('Dashboard refreshed', 'info');
    });

    // Modal Triggers
    btnOpenCreateModal.addEventListener('click', () => openModal(modalCreateProject));
    btnAddMilestone.addEventListener('click', () => {
        if (!state.selectedProjectId) {
            showToast('Please select a project first', 'warning');
            return;
        }
        milestoneProjectIdInput.value = state.selectedProjectId;
        openModal(modalAddMilestone);
    });

    // Modal Close Buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.currentTarget.getAttribute('data-close');
            const targetModal = document.getElementById(modalId);
            if (targetModal) closeModal(targetModal);
        });
    });

    // Close modal on background click
    [modalCreateProject, modalAddMilestone].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    // Form Submissions
    formCreateProject.addEventListener('submit', handleCreateProject);
    formAddMilestone.addEventListener('submit', handleAddMilestone);

    // Delete Project Button
    btnDeleteProject.addEventListener('click', handleDeleteProject);

    // Search Input Filter
    projectSearchInput.addEventListener('input', (e) => {
        renderProjectsList(e.target.value);
    });
}

// ==========================================
// API Operations
// ==========================================

// 1. Load All Projects and Stats
async function loadDashboardData() {
    try {
        await Promise.all([fetchProjects(), fetchStats()]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Failed to connect to backend at ' + API_BASE_URL, 'error');
    }
}

async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/stats`);
        if (response.ok) {
            const stats = await response.json();
            state.stats = stats;
            renderStats();
        }
    } catch (error) {
        console.warn('Could not fetch aggregate stats, calculating from local project state:', error);
        calculateStatsLocally();
    }
}

async function fetchProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        state.projects = data;
        renderProjectsList(projectSearchInput.value);

        // If a project was previously selected, refresh its details
        if (state.selectedProjectId) {
            const currentSelected = state.projects.find(p => p.id === state.selectedProjectId);
            if (currentSelected) {
                renderSelectedProject(currentSelected);
            } else {
                deselectProject();
            }
        }
    } catch (error) {
        projectsList.innerHTML = `
            <div class="empty-list-state">
                <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i>
                <p>Failed to load projects. Ensure Spring Boot is running on port 8081.</p>
            </div>
        `;
        throw error;
    }
}

// 2. Create Project
async function handleCreateProject(e) {
    e.preventDefault();
    const newProject = {
        projectName: document.getElementById('proj-name').value.trim(),
        clientName: document.getElementById('proj-client').value.trim(),
        freelancerName: document.getElementById('proj-freelancer').value.trim(),
        totalAmount: parseFloat(document.getElementById('proj-amount').value),
        description: document.getElementById('proj-desc').value.trim(),
        status: 'ACTIVE'
    };

    try {
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProject)
        });

        if (!response.ok) throw new Error('Failed to create project');
        const created = await response.json();

        showToast(`Project "${created.projectName}" created successfully!`, 'success');
        formCreateProject.reset();
        closeModal(modalCreateProject);

        await loadDashboardData();
        selectProject(created.id);
    } catch (error) {
        console.error('Error creating project:', error);
        showToast('Error creating project. Please try again.', 'error');
    }
}

// 3. Delete Project
async function handleDeleteProject() {
    if (!state.selectedProjectId) return;
    const project = state.projects.find(p => p.id === state.selectedProjectId);
    if (!project) return;

    if (!confirm(`Are you sure you want to delete "${project.projectName}" and all its milestones?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/projects/${state.selectedProjectId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete project');

        showToast('Project deleted successfully', 'success');
        deselectProject();
        await loadDashboardData();
    } catch (error) {
        console.error('Error deleting project:', error);
        showToast('Failed to delete project', 'error');
    }
}

// 4. Add Milestone
async function handleAddMilestone(e) {
    e.preventDefault();
    const projectId = document.getElementById('milestone-project-id').value;
    const newMilestone = {
        title: document.getElementById('ms-title').value.trim(),
        amount: parseFloat(document.getElementById('ms-amount').value),
        description: document.getElementById('ms-desc').value.trim(),
        status: 'PENDING'
    };

    try {
        const response = await fetch(`${API_BASE_URL}/milestones/project/${projectId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMilestone)
        });

        if (!response.ok) throw new Error('Failed to create milestone');

        showToast('Milestone added successfully!', 'success');
        formAddMilestone.reset();
        closeModal(modalAddMilestone);

        await loadDashboardData();
        // Refresh milestones for currently selected project
        await refreshProjectDetails(projectId);
    } catch (error) {
        console.error('Error adding milestone:', error);
        showToast('Failed to create milestone', 'error');
    }
}

// 5. Update Milestone Status (Start, Complete)
async function updateMilestoneStatus(milestoneId, newStatus) {
    try {
        let endpoint = `${API_BASE_URL}/milestones/${milestoneId}/status?status=${newStatus}`;
        if (newStatus === 'IN_PROGRESS') {
            endpoint = `${API_BASE_URL}/milestones/${milestoneId}/start`;
        } else if (newStatus === 'COMPLETED') {
            endpoint = `${API_BASE_URL}/milestones/${milestoneId}/complete`;
        }

        const response = await fetch(endpoint, {
            method: newStatus === 'IN_PROGRESS' || newStatus === 'COMPLETED' ? 'PATCH' : 'PUT'
        });

        if (!response.ok) throw new Error('Failed to update status');

        showToast(`Milestone status updated to ${newStatus}`, 'success');
        await loadDashboardData();
        if (state.selectedProjectId) {
            await refreshProjectDetails(state.selectedProjectId);
        }
    } catch (error) {
        console.error('Error updating milestone status:', error);
        showToast('Failed to update milestone status', 'error');
    }
}

// 6. Release Payment for Milestone
async function releasePayment(milestoneId) {
    if (!confirm('Are you sure you want to release funds from escrow to freelancer?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/releases/${milestoneId}/release`, {
            method: 'POST'
        });

        const result = await response.json();

        if (!response.ok) {
            const errorMsg = result.error || 'Failed to release payment';
            showToast(errorMsg, 'error');
            return;
        }

        showToast(`Payment of $${result.amount.toFixed(2)} released successfully!`, 'success');
        await loadDashboardData();
        if (state.selectedProjectId) {
            await refreshProjectDetails(state.selectedProjectId);
        }
    } catch (error) {
        console.error('Error releasing payment:', error);
        showToast('Payment release failed: ' + error.message, 'error');
    }
}

// 7. Delete Milestone
async function deleteMilestone(milestoneId) {
    if (!confirm('Are you sure you want to delete this milestone?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete milestone');

        showToast('Milestone deleted successfully', 'success');
        await loadDashboardData();
        if (state.selectedProjectId) {
            await refreshProjectDetails(state.selectedProjectId);
        }
    } catch (error) {
        console.error('Error deleting milestone:', error);
        showToast('Failed to delete milestone', 'error');
    }
}

// Refresh single project details
async function refreshProjectDetails(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
        if (response.ok) {
            const project = await response.json();
            renderSelectedProject(project);
        }
    } catch (error) {
        console.error('Error refreshing project details:', error);
    }
}

// ==========================================
// UI Rendering Functions
// ==========================================

function renderStats() {
    statTotalProjects.textContent = state.stats.totalProjects || 0;
    statActiveProjects.textContent = state.stats.activeProjects || 0;
    statTotalAmount.textContent = formatCurrency(state.stats.totalAmount || 0);
    statReleasedAmount.textContent = formatCurrency(state.stats.releasedAmount || 0);
}

function calculateStatsLocally() {
    const total = state.projects.length;
    const active = state.projects.filter(p => p.status === 'ACTIVE' || p.status === 'CREATED').length;
    const totalAmt = state.projects.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
    
    let releasedAmt = 0;
    state.projects.forEach(p => {
        if (p.milestones) {
            p.milestones.forEach(m => {
                if (m.status === 'RELEASED') {
                    releasedAmt += (m.amount || 0);
                }
            });
        }
    });

    state.stats = {
        totalProjects: total,
        activeProjects: active,
        totalAmount: totalAmt,
        releasedAmount: releasedAmt
    };
    renderStats();
}

function renderProjectsList(filterText = '') {
    const query = filterText.toLowerCase().trim();
    const filtered = state.projects.filter(p => 
        p.projectName.toLowerCase().includes(query) ||
        p.clientName.toLowerCase().includes(query) ||
        p.freelancerName.toLowerCase().includes(query)
    );

    projectCountBadge.textContent = `${filtered.length} Project${filtered.length === 1 ? '' : 's'}`;

    if (filtered.length === 0) {
        projectsList.innerHTML = `
            <div class="empty-list-state">
                <i class="fa-solid fa-folder-open"></i>
                <p>${query ? 'No projects matching your search.' : 'No projects found. Click "New Project" to create one!'}</p>
            </div>
        `;
        return;
    }

    projectsList.innerHTML = filtered.map(p => {
        const isSelected = p.id === state.selectedProjectId;
        const milestoneCount = p.milestones ? p.milestones.length : 0;
        const statusBadgeClass = getStatusBadgeClass(p.status);

        return `
            <div class="project-card ${isSelected ? 'active-selected' : ''}" onclick="selectProject(${p.id})">
                <div class="project-card-header">
                    <h3 class="project-card-title">${escapeHtml(p.projectName)}</h3>
                    <span class="badge ${statusBadgeClass}">${escapeHtml(p.status)}</span>
                </div>
                <div class="project-card-parties">
                    <span><i class="fa-solid fa-user-tie"></i> ${escapeHtml(p.clientName)}</span>
                    <span><i class="fa-solid fa-laptop-code"></i> ${escapeHtml(p.freelancerName)}</span>
                </div>
                <div class="project-card-footer">
                    <span class="project-card-amount">${formatCurrency(p.totalAmount)}</span>
                    <span class="project-card-count"><i class="fa-solid fa-flag"></i> ${milestoneCount} Milestones</span>
                </div>
            </div>
        `;
    }).join('');
}

function selectProject(projectId) {
    state.selectedProjectId = projectId;
    renderProjectsList(projectSearchInput.value);

    const project = state.projects.find(p => p.id === projectId);
    if (project) {
        renderSelectedProject(project);
    }
}

function deselectProject() {
    state.selectedProjectId = null;
    noProjectSelected.style.display = 'block';
    projectDetailsContent.style.display = 'none';
    renderProjectsList(projectSearchInput.value);
}

function renderSelectedProject(project) {
    noProjectSelected.style.display = 'none';
    projectDetailsContent.style.display = 'flex';

    detailProjectName.textContent = project.projectName;
    detailProjectStatus.textContent = project.status;
    detailProjectStatus.className = `badge ${getStatusBadgeClass(project.status)}`;
    detailProjectDesc.textContent = project.description || 'No description provided for this project.';
    detailClientName.textContent = project.clientName;
    detailFreelancerName.textContent = project.freelancerName;
    detailTotalAmount.textContent = formatCurrency(project.totalAmount);

    // Calculate milestone & released stats
    const milestones = project.milestones || [];
    milestoneCountBadge.textContent = `${milestones.length} Milestone${milestones.length === 1 ? '' : 's'}`;

    let releasedTotal = 0;
    let completedOrReleasedCount = 0;

    milestones.forEach(m => {
        if (m.status === 'RELEASED') {
            releasedTotal += (m.amount || 0);
            completedOrReleasedCount++;
        } else if (m.status === 'COMPLETED') {
            completedOrReleasedCount++;
        }
    });

    detailReleasedAmount.textContent = formatCurrency(releasedTotal);

    // Progress percentage
    const progressPercent = milestones.length > 0
        ? Math.round((releasedTotal / (project.totalAmount || 1)) * 100)
        : 0;
    const cappedPercent = Math.min(100, Math.max(0, progressPercent));

    projectProgressPercent.textContent = `${cappedPercent}%`;
    projectProgressFill.style.width = `${cappedPercent}%`;

    // Render Milestones List
    renderMilestonesList(milestones);
}

function renderMilestonesList(milestones) {
    if (!milestones || milestones.length === 0) {
        milestonesList.innerHTML = `
            <div class="empty-list-state">
                <i class="fa-solid fa-flag-checkered"></i>
                <p>No milestones added yet. Click "+ Add Milestone" above to break project work into escrow stages.</p>
            </div>
        `;
        return;
    }

    milestonesList.innerHTML = milestones.map(m => {
        const statusBadgeClass = getStatusBadgeClass(m.status);
        let actionButtons = '';

        // Dynamic buttons per required workflow
        if (m.status === 'PENDING') {
            actionButtons = `
                <button class="btn btn-warning btn-sm" onclick="updateMilestoneStatus(${m.id}, 'IN_PROGRESS')">
                    <i class="fa-solid fa-play"></i> Start Milestone
                </button>
            `;
        } else if (m.status === 'IN_PROGRESS') {
            actionButtons = `
                <button class="btn btn-primary btn-sm" onclick="updateMilestoneStatus(${m.id}, 'COMPLETED')">
                    <i class="fa-solid fa-check-double"></i> Mark Completed
                </button>
            `;
        } else if (m.status === 'COMPLETED') {
            actionButtons = `
                <button class="btn btn-success btn-sm" onclick="releasePayment(${m.id})">
                    <i class="fa-solid fa-money-bill-transfer"></i> Release Payment
                </button>
            `;
        } else if (m.status === 'RELEASED') {
            actionButtons = `
                <span class="badge badge-released"><i class="fa-solid fa-lock-open"></i> Escrow Released</span>
            `;
        }

        // Delete button for milestone (allowed if not released)
        const deleteButton = m.status !== 'RELEASED' ? `
            <button class="btn btn-danger-outline btn-sm" onclick="deleteMilestone(${m.id})" title="Delete Milestone">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        ` : '';

        return `
            <div class="milestone-card status-${m.status}">
                <div class="milestone-card-top">
                    <div class="milestone-title-wrap">
                        <h4>${escapeHtml(m.title)}</h4>
                    </div>
                    <span class="badge ${statusBadgeClass}">${escapeHtml(m.status)}</span>
                </div>
                ${m.description ? `<p class="milestone-desc">${escapeHtml(m.description)}</p>` : ''}
                <div class="milestone-meta-row">
                    <div class="milestone-amount">${formatCurrency(m.amount)}</div>
                    <div class="milestone-controls">
                        ${actionButtons}
                        ${deleteButton}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// Modal Helpers
// ==========================================
function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

// ==========================================
// Toast Notification
// ==========================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-fadeout');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ==========================================
// Formatters & Sanitizers
// ==========================================
function formatCurrency(amount) {
    if (typeof amount !== 'number') amount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

function getStatusBadgeClass(status) {
    if (!status) return 'badge-neutral';
    const s = status.toUpperCase();
    if (s === 'ACTIVE') return 'badge-active';
    if (s === 'PENDING') return 'badge-pending';
    if (s === 'IN_PROGRESS') return 'badge-in_progress';
    if (s === 'COMPLETED') return 'badge-completed';
    if (s === 'RELEASED') return 'badge-released';
    return 'badge-neutral';
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
