/**
 * Sistem Ujian Online - Main JavaScript
 * File ini menangani interaksi UI, navigasi, dan logika aplikasi
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎓 Sistem Ujian Online loaded');
  
  // ===== GLOBAL STATE =====
  const state = {
    currentUser: null,
    currentRole: 'admin',
    currentPage: 'dashboard',
    examInProgress: null,
    timer: null
  };

  // ===== DOM ELEMENTS =====
  const elements = {
    pages: document.querySelectorAll('.page'),
    roleTabs: document.querySelectorAll('.role-tab'),
    navItems: document.querySelectorAll('.nav-item'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    loginForm: document.getElementById('login-form'),
    btnLogout: document.getElementById('btn-logout'),
    toastContainer: document.getElementById('toast-container')
  };

  // ===== UTILITY FUNCTIONS =====
  
  // Show toast notification
  function showToast(message, type = 'info', duration = 3000) {
    if (!elements.toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️'}</span>
      <span>${message}</span>
    `;
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Switch page view  function switchPage(pageId) {
    elements.pages.forEach(page => page.classList.remove('active'));
    const target = document.getElementById(`page-${pageId}`);
    if (target) {
      target.classList.add('active');
      state.currentPage = pageId;
      console.log(`📄 Switched to page: ${pageId}`);
    }
  }

  // Switch tab content
  function switchTab(tabName, container = document) {
    container.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    container.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    const btn = container.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const content = container.querySelector(`#tab-${tabName}`);
    
    if (btn) btn.classList.add('active');
    if (content) content.classList.add('active');
  }

  // ===== EVENT LISTENERS =====

  // Role tab switching on login page
  elements.roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentRole = tab.dataset.role;
      console.log(`👤 Role selected: ${state.currentRole}`);
    });
  });

  // Login form submission
  if (elements.loginForm) {
    elements.loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      if (username && password) {
        state.currentUser = {
          name: username,
          role: state.currentRole,
          id: Math.floor(Math.random() * 1000)
        };
        
        // Update UI with user info
        document.getElementById('user-name-display').textContent = username;        document.getElementById('sidebar-role-display').textContent = state.currentRole.toUpperCase();
        document.getElementById('user-id-display').textContent = `ID: ${state.currentUser.id}`;
        
        // Set avatar class
        const avatar = document.getElementById('user-avatar');
        avatar.className = `avatar avatar-${state.currentRole}`;
        avatar.textContent = username.charAt(0).toUpperCase();
        
        showToast(`Selamat datang, ${username}!`, 'success');
        switchPage('app');
      } else {
        showToast('Username dan password harus diisi!', 'error');
      }
    });
  }

  // Navigation item click
  elements.navItems.forEach(item => {
    item.addEventListener('click', () => {
      elements.navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      const page = item.dataset.page;
      switchPage('app');
      // Here you would load the appropriate content
      console.log(`🔍 Navigated to: ${page}`);
    });
  });

  // Logout
  if (elements.btnLogout) {
    elements.btnLogout.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin keluar?')) {
        state.currentUser = null;
        switchPage('login');
        showToast('Anda telah keluar dari sistem', 'info');
      }
    });
  }

  // Tab switching in content areas
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const container = btn.closest('.card') || document;
      switchTab(btn.dataset.tab, container);
    });
  });

  // ===== EXAM FUNCTIONS =====
  
  function startExam(examData) {    state.examInProgress = examData;
    switchPage('exam');
    initExamTimer(examData.duration);
    renderQuestion(1);
    showToast('Ujian dimulai! Waktu berjalan...', 'info');
  }

  function initExamTimer(minutes) {
    let seconds = minutes * 60;
    const timerEl = document.getElementById('exam-timer');
    
    if (state.timer) clearInterval(state.timer);
    
    state.timer = setInterval(() => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      
      if (seconds <= 300) { // 5 minutes warning
        timerEl.classList.add('warning');
      }
      
      if (seconds <= 0) {
        clearInterval(state.timer);
        submitExam();
      }
      seconds--;
    }, 1000);
  }

  function renderQuestion(qNum) {
    document.getElementById('current-q-num').textContent = qNum;
    // Load question data here from examData
    console.log(`Rendering question ${qNum}`);
  }

  function submitExam() {
    clearInterval(state.timer);
    showToast('Waktu habis! Jawaban Anda telah dikirim.', 'warn');
    // Submit logic here
    switchPage('app');
  }

  // ===== INITIALIZATION =====
  
  // Check if user is already logged in (from localStorage)
  function init() {
    const savedUser = localStorage.getItem('examUser');
    if (savedUser) {
      state.currentUser = JSON.parse(savedUser);      switchPage('app');
    }
  }
  
  init();
});

// Export functions for external use if needed
window.ExamApp = {
  showToast: (msg, type) => document.dispatchEvent(new CustomEvent('showToast', { detail: { msg, type } })),
  switchPage: (page) => document.dispatchEvent(new CustomEvent('switchPage', { detail: { page } }))
};
