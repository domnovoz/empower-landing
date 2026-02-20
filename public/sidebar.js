// DOM Elements
const userInitials = document.getElementById('userInitials');
const sidebar = document.getElementById('sidebar');
const closeSidebarBtn = document.getElementById('closeSidebar');
// sliderText is shared with script.js, defined here to be available for renderSidebar
const sliderText = document.querySelector('.slider-text');

// Dynamic Content Elements
const identitiesList = document.getElementById('identitiesList');
const projectsList = document.getElementById('projectsList');
const emptyProjectsState = document.getElementById('emptyProjectsState');
const logoutBtn = document.getElementById('logoutBtn');

// --- Data & State ---
// SVG Icons for Providers
const PROVIDER_ICONS = {
    Microsoft: `<svg viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>`,
    Google: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`
};

const identities = [
    {
        id: 'user_1',
        name: 'John Doe',
        initials: 'JD',
        organization: 'Kyndryl',
        provider: 'Microsoft', // Auth Method
        color: '#FF424D', // Kyndryl Red-ish
        notifications: [
            {
                id: 'n1',
                text: 'New coaching analysis available',
                type: 'insight',
                read: false,
                timestamp: '2m ago'
            }
        ],
        projects: [
            {
                id: 'p1',
                name: 'Role Playing Coaching',
                description: 'Practice negotiation skills for your upcoming salary review.',
                icon: '🎭'
            },
            {
                id: 'p2',
                name: 'Sneakers Cop',
                description: 'Track latest drops, compare prices, and manage your collection.',
                icon: '👟'
            },
            {
                id: 'p3',
                name: 'Kyoto Trip 2025',
                description: 'Japan trip planning: flight tracking, hotels, and restaurant reservations.',
                icon: '⛩️'
            }
        ]
    },
    {
        id: 'user_2',
        name: 'Jane Smith',
        initials: 'JS',
        organization: 'Erste Group',
        provider: 'Google', // Auth Method
        color: '#007AC9', // Erste Blue
        notifications: [],
        projects: [
            {
                id: 'p4',
                name: 'DeFi Dashboard',
                description: 'Monitor yield farms, liquidity pools, and gas fees in real-time.',
                icon: '📊'
            },
            {
                id: 'p5',
                name: 'Smart Home Hub',
                description: 'Orchestrate IoT devices and automate energy saving routines.',
                icon: '🏠'
            }
        ]
    }
];

let currentIdentityId = 'user_1';
let selectedIdentityId = null; // Track selected identity when signed out
let selectedProjectId = null; // Track selected project

// --- Sidebar Logic ---

function openSidebar() {
    // Reset project selection when opening? Or keep it? 
    // User didn't specify, but usually nice to reset or keep. Let's keep for now.
    renderSidebar();
    sidebar.classList.add('active');
}

function closeSidebar() {
    sidebar.classList.remove('active');
}

userInitials.addEventListener('click', openSidebar);
closeSidebarBtn.addEventListener('click', closeSidebar);

// User Profile Rendering
function renderSidebar() {
    // 1. Render Identities List
    identitiesList.innerHTML = '';

    identities.forEach(identity => {
        // Active state depends on context:
        // If signed in: highlight currentIdentityId
        // If signed out: highlight selectedIdentityId
        // BUT if a project is selected, maybe we still show the identity as active? Yes.
        const isActive = currentIdentityId ? (identity.id === currentIdentityId) : (identity.id === selectedIdentityId);

        const card = document.createElement('div');
        card.className = `identity-card ${isActive ? 'active' : ''}`;
        // Dynamic Provider Badge Color
        const providerColor = identity.provider === 'Google' ? '#4285F4' : '#00A4EF'; // Google Blue vs MS Blue
        const providerIcon = PROVIDER_ICONS[identity.provider] || '';

        card.innerHTML = `
            <div class="id-avatar" style="--user-color: ${identity.color}">${identity.initials}</div>
            <div class="id-details">
                <span class="id-name">
                    ${identity.name}
                    ${(currentIdentityId === identity.id) ? '<span class="online-badge">Online</span>' : ''}
                </span>
                <span class="id-org">${identity.organization}</span>
            </div>
            <div class="provider-logo">
                ${providerIcon}
            </div>
        `;

        // Add click handler to select identity
        card.onclick = () => selectIdentity(identity.id);

        identitiesList.appendChild(card);
    });

    // Add "Add New Identity" Button
    const addBtn = document.createElement('div');
    addBtn.className = 'add-identity-btn';
    addBtn.innerHTML = '+ Add Identity';
    addBtn.onclick = handleAddIdentity;
    identitiesList.appendChild(addBtn);

    // 2. Render Projects & Header

    // Determine which identity context we are in
    const activeId = currentIdentityId || selectedIdentityId;
    const activeIdentity = identities.find(id => id.id === activeId);

    // Clear Badge initially
    userInitials.classList.remove('has-notification');

    // Remove existing notifications section if any (to re-render cleanly)
    const existingNotifSection = document.getElementById('notificationsSection');
    if (existingNotifSection) existingNotifSection.remove();

    if (currentIdentityId) {
        // --- SIGNED IN STATE ---
        const loggedInIdentity = identities.find(id => id.id === currentIdentityId);

        // Update Initials on Main Screen
        if (loggedInIdentity) {
            userInitials.textContent = loggedInIdentity.initials;
            userInitials.style.background = loggedInIdentity.color;

            // Check for unread notifications
            const unreadCount = loggedInIdentity.notifications?.filter(n => !n.read).length || 0;
            if (unreadCount > 0) {
                userInitials.classList.add('has-notification');

                // Render Notifications Section
                const notificationsSection = document.createElement('section');
                notificationsSection.id = 'notificationsSection';
                notificationsSection.className = 'notifications-section';
                notificationsSection.innerHTML = `<h4>Notifications</h4><ul class="notifications-list"></ul>`;

                // Insert before Projects Section
                const projectsSection = document.querySelector('.projects-section');
                projectsSection.parentNode.insertBefore(notificationsSection, projectsSection);

                const notifList = notificationsSection.querySelector('.notifications-list');

                loggedInIdentity.notifications.forEach(notif => {
                    if (!notif.read) {
                        const item = document.createElement('li');
                        item.className = 'notification-item';
                        item.innerHTML = `
                            <div class="notif-dot"></div>
                            <div class="notif-content">
                                <span class="notif-text">${notif.text}</span>
                                <span class="notif-time">${notif.timestamp}</span>
                            </div>
                        `;
                        item.onclick = () => handleNotificationClick(notif);
                        notifList.appendChild(item);
                    }
                });
            }
        }

        // Render Projects
        projectsList.innerHTML = '';
        projectsList.style.display = 'block';
        emptyProjectsState.style.display = 'none';

        if (loggedInIdentity) {
            loggedInIdentity.projects.forEach(project => {
                const li = document.createElement('li');
                li.className = 'project-card-item';

                // Check if this project is selected
                const isProjectActive = selectedProjectId === project.id;
                if (isProjectActive) {
                    li.classList.add('active');
                }

                li.innerHTML = `
                    <div class="project-icon-wrapper">${project.icon}</div>
                    <div class="project-info">
                        <div class="project-name">${project.name}</div>
                        <div class="project-desc">${project.description}</div>
                    </div>
                `;
                li.onclick = () => selectProject(project.id);
                projectsList.appendChild(li);
            });
        }

        // Update Slider Text based on selection logic if you want
        sliderText.textContent = "Slide to Activate";

    } else {
        // --- SIGNED OUT STATE ---

        // Update Initials on Main Screen
        userInitials.textContent = "?";
        userInitials.style.background = "#333";

        // Render Empty Projects
        projectsList.innerHTML = '';
        projectsList.style.display = 'none';
        emptyProjectsState.style.display = 'block';

        sliderText.textContent = "Sign In Required";
    }

    // --- BOTTOM BUTTON LOGIC ---
    updateBottomButton();
}

function handleNotificationClick(notif) {
    // Mark as read
    notif.read = true;

    // Close sidebar
    closeSidebar();

    // Re-render sidebar (will remove badge if no more unread)
    renderSidebar();

    // Open Insights (if applicable)
    if (notif.type === 'insight' && window.openInsights) {
        // Small delay to allow sidebar to close smoothly
        setTimeout(() => {
            window.openInsights();
        }, 300);
    }
}


function updateBottomButton() {
    // Logic:
    // 1. If Project Selected -> "Enter Project" (Action: Close Sidebar)
    // 2. If Identity Selected (and no project) -> 
    //    - If Current Identity -> "Log Out"
    //    - If Other Identity -> "Sign In"
    // 3. Else (No selection) -> Hide or Disable

    logoutBtn.style.display = 'block'; // Default to visible, hide if needed
    logoutBtn.className = 'logout-btn'; // Reset classes

    if (selectedProjectId) {
        // CASE: Project Selected
        logoutBtn.textContent = 'Enter Project';
        logoutBtn.classList.add('primary-btn');
        logoutBtn.onclick = handleEnterProject;
        return;
    }

    if (currentIdentityId) {
        // CASE: Signed In, No Project Selected
        logoutBtn.textContent = 'Log Out';
        logoutBtn.classList.add('destructive-btn'); // Optional styling for logout
        logoutBtn.onclick = handleSignOut;
    } else {
        // CASE: Signed Out
        if (selectedIdentityId) {
            logoutBtn.textContent = 'Sign In';
            logoutBtn.classList.add('primary-btn'); // Make Sign In prominent
            logoutBtn.onclick = () => switchIdentity(selectedIdentityId);
        } else {
            // No identity selected, no project selected
            logoutBtn.style.display = 'none';
        }
    }
}

function selectProject(projectId) {
    if (selectedProjectId === projectId) {
        selectedProjectId = null; // Toggle off?
    } else {
        selectedProjectId = projectId;
    }
    renderSidebar();
}

function handleEnterProject() {
    console.log("Entering project:", selectedProjectId);
    // Close sidebar as if it's the specific action
    closeSidebar();
    // Reset selection?
    selectedProjectId = null;
    renderSidebar();
}

function selectIdentity(id) {
    // If we select an identity, we should probably clear project selection
    // because projects belong to identities? 
    // Or if we are just switching context.

    selectedProjectId = null; // Clear project selection when changing identity context

    if (currentIdentityId) {
        // If already signed in, check if we clicked the current one or a new one
        if (currentIdentityId !== id) {
            // Switching identity directly
            switchIdentity(id);
        } else {
            // Clicked current identity, maybe just re-render or do nothing
            renderSidebar();
        }
    } else {
        // If signed out, just select it
        selectedIdentityId = id;
        renderSidebar();
    }
}

function switchIdentity(id) {
    if (currentIdentityId === id) return; // Already active

    currentIdentityId = id;
    selectedIdentityId = null; // Clear selection as we are now logged in
    selectedProjectId = null; // Clear project selection
    renderSidebar();
}

function handleSignOut() {
    currentIdentityId = null;
    selectedIdentityId = null; // Clear selection on logout
    selectedProjectId = null; // Clear project selection
    renderSidebar();
}

// Initial Render
function handleAddIdentity() {
    const name = prompt("Enter Name (e.g., John Doe):");
    if (!name) return;

    // Organization
    const org = prompt("Enter Organization (e.g., Kyndryl, Erste):");
    if (!org) return;

    // Provider
    const provider = prompt("Enter Auth Provider (e.g., Microsoft, Google):");
    if (!provider) return;

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const color = `hsl(${Math.random() * 360}, 70%, 50%)`;

    const newId = {
        id: `user_${Date.now()}`,
        name: name,
        initials: initials,
        organization: org,
        provider: provider,
        color: color,
        projects: ['Onboarding', 'Setup']
    };

    identities.push(newId);

    // Automatically select the new identity
    if (currentIdentityId) {
        switchIdentity(newId.id);
    } else {
        selectedIdentityId = newId.id;
        renderSidebar();
    }
}

renderSidebar();
