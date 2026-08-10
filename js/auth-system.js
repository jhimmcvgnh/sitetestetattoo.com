/**
 * Sistema de Autenticação Real Conectado ao Supabase Auth & Banco de Dados Único
 */

document.addEventListener('DOMContentLoaded', function () {
  // Limpeza de chaves legadas do localStorage de negócio
  try {
    const legacyKeys = [
      'tatuaria_saved_accounts',
      'tatuaria_active_user_id',
      'tatuaria_user',
      'tatuaria_nome',
      'tatuaria_email',
      'tatuaria_estudio_id',
      'tatuaria_all_agendamentos',
      'tattoo_studio_session'
    ];
    legacyKeys.forEach(k => localStorage.removeItem(k));
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tatuaria_agendamentos_')) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.warn('Aviso na limpeza de localStorage legados:', e);
  }

  const overlay = document.getElementById('auth-overlay');
  const authForm = document.getElementById('auth-form');
  const tabCreate = document.getElementById('tab-create');
  const tabLogin = document.getElementById('tab-login');
  const authTitle = document.getElementById('auth-title');
  const submitBtn = document.getElementById('auth-submit-btn');
  const studioNameGroup = document.getElementById('group-studio-name');
  const inputStudioName = document.getElementById('input-studio-name');
  const inputEmail = document.getElementById('input-email');
  const inputPassword = document.getElementById('input-password');
  const closeBtn = document.getElementById('auth-close-btn');
  const messageEl = document.getElementById('auth-message');

  let currentTab = 'create'; // 'create' ou 'login'
  let activeProfileState = null;

  // Tradução amigável de erros de Autenticação do Supabase
  function traduzErroAuth(error) {
    if (!error) return 'Ocorreu um erro inesperado na autenticação.';
    const msg = error.message || error.toString();
    if (msg.includes('User already registered') || msg.includes('already registered') || msg.includes('email_exists')) {
      return 'Já existe uma conta cadastrada com este e-mail. Alterne para a aba "Entrar".';
    }
    if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
      return 'E-mail ou senha incorretos.';
    }
    if (msg.includes('Password should be at least')) {
      return 'A senha deve conter no mínimo 6 caracteres.';
    }
    if (msg.includes('Email not confirmed')) {
      return 'Por favor, confirme seu e-mail antes de entrar.';
    }
    return msg;
  }

  // Exibição de mensagens de feedback no formulário
  function showAuthMessage(msg, type = 'error') {
    if (!messageEl) return;
    messageEl.textContent = msg;
    messageEl.className = 'auth-message ' + type;
    messageEl.style.display = 'block';
  }

  function clearAuthMessage() {
    if (!messageEl) return;
    messageEl.textContent = '';
    messageEl.style.display = 'none';
    messageEl.className = 'auth-message';
  }

  function hideOverlay() {
    if (!overlay) return;
    overlay.classList.add('hidden');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 400);
  }

  function showOverlay() {
    if (!overlay) return;
    overlay.style.display = 'flex';
    overlay.classList.remove('hidden');
    if (window.initShaderAnimation) {
      setTimeout(function () {
        window.initShaderAnimation();
      }, 100);
    }
  }

  // Controle de alternância entre abas "Criar conta" e "Entrar"
  function setTab(tab) {
    currentTab = tab;
    clearAuthMessage();
    if (tab === 'create') {
      if (tabCreate) tabCreate.classList.add('active');
      if (tabLogin) tabLogin.classList.remove('active');
      if (authTitle) authTitle.textContent = 'Criar conta';
      if (submitBtn) submitBtn.textContent = 'Criar conta';
      if (studioNameGroup) studioNameGroup.style.display = 'flex';
    } else {
      if (tabLogin) tabLogin.classList.add('active');
      if (tabCreate) tabCreate.classList.remove('active');
      if (authTitle) authTitle.textContent = 'Entrar';
      if (submitBtn) submitBtn.textContent = 'Entrar';
      if (studioNameGroup) studioNameGroup.style.display = 'none';
    }
  }

  if (tabCreate) tabCreate.addEventListener('click', function () { setTab('create'); });
  if (tabLogin) tabLogin.addEventListener('click', function () { setTab('login'); });

  setTab('create');

  // =========================================================================
  // SISTEMA DE SESSÃO REAL VIA SUPABASE AUTH E TABELA PERFIS
  // =========================================================================
  async function verificarSessaoAtual() {
    if (!window.supabaseClient) {
      activeProfileState = null;
      renderUserHeaderBadge('', '', false);
      bindFooterAccountBtn('', '', false);
      hideOverlay();
      return null;
    }

    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session && session.user) {
        let { data: profile } = await window.supabaseClient
          .from('perfis')
          .select('estudio_id, nome, email, estudios(nome, slug)')
          .eq('id', session.user.id)
          .maybeSingle();

        const studioName = profile?.estudios?.nome || profile?.nome || session.user.email.split('@')[0];
        const estudioId = profile?.estudio_id || null;
        if (estudioId) {
          try { localStorage.setItem('tatuaria_estudio_id', estudioId); } catch(e) {}
        }

        activeProfileState = {
          userId: session.user.id,
          email: session.user.email,
          studioName,
          estudioId
        };

        applyStudioName(studioName);
        renderUserHeaderBadge(studioName, session.user.email, true);
        bindFooterAccountBtn(studioName, session.user.email, true);
        hideOverlay();
        return session.user;
      }
    } catch (err) {
      console.warn('Erro ao verificar sessão Supabase Auth:', err);
    }

    activeProfileState = null;
    renderUserHeaderBadge('', '', false);
    bindFooterAccountBtn('', '', false);
    return null;
  }

  // Executa verificação inicial
  verificarSessaoAtual();

  // Helper público para obter o ID do estúdio logado
  async function getEstudioAtivoId() {
    if (activeProfileState && activeProfileState.estudioId) {
      return activeProfileState.estudioId;
    }
    // Se o estúdio ainda não está no estado em memória, busca na sessão do Supabase
    if (window.supabaseClient) {
      try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session?.user) {
          const { data: profile } = await window.supabaseClient
            .from('perfis')
            .select('estudio_id')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profile?.estudio_id) return profile.estudio_id;
        }
      } catch (e) {
        console.warn('Aviso ao consultar estudio_id ativo:', e);
      }
    }
    return null;
  }
  window.getEstudioAtivoId = getEstudioAtivoId;

  // Função centralizada de envio do formulário de autenticação
  async function handleAuthSubmit(e) {
    if (e) e.preventDefault();
    clearAuthMessage();

    if (!window.supabaseClient) {
      showAuthMessage('Banco de dados desconectado. Insira as credenciais do seu novo banco de dados no arquivo .env.');
      return;
    }

    const email = (inputEmail ? inputEmail.value : '').trim();
    const password = inputPassword ? inputPassword.value : '';
    const studioName = (inputStudioName ? inputStudioName.value : '').trim() || 'Meu Estúdio';

    if (!email || !password) {
      showAuthMessage('Por favor, preencha o e-mail e a senha.');
      return;
    }

    try {
      if (currentTab === 'create') {
        const { data, error } = await window.supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              tipo_cadastro: 'dono',
              nome_estudio: studioName,
              nome: studioName
            }
          }
        });

        if (error) throw error;

        if (data.user && !data.session) {
          showAuthMessage('Conta criada com sucesso! Caso a confirmação de e-mail esteja ativada no Supabase, verifique sua caixa de entrada antes de entrar.', 'success');
          setTab('login');
        } else if (data.session) {
          showAuthMessage('Conta e estúdio criados com sucesso!', 'success');
          await verificarSessaoAtual();
        }
      } else {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data.session) {
          showAuthMessage('Login realizado com sucesso!', 'success');
          await verificarSessaoAtual();
        }
      }
    } catch (err) {
      showAuthMessage(traduzErroAuth(err));
    }
  }

  // Registra manipuladores de envio no formulário e no botão
  if (authForm) {
    authForm.addEventListener('submit', handleAuthSubmit);
  }
  if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      handleAuthSubmit(e);
    });
  }

  // Botão fechar modal
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      hideOverlay();
    });
  }

  // Botão Continuar com Gmail (indisponível)
  const googleBtn = document.getElementById('auth-google-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', function () {
      showAuthMessage('Login com Google indisponível no momento.');
    });
  }

  // Logout Real via Supabase Auth
  async function sairEstudio() {
    if (window.supabaseClient) {
      try {
        await window.supabaseClient.auth.signOut();
      } catch (err) {
        console.warn('Erro ao encerrar sessão Supabase Auth:', err);
      }
    }
    try { localStorage.removeItem('tatuaria_estudio_id'); } catch(e) {}
    activeProfileState = null;
    renderUserHeaderBadge('', '', false);
    bindFooterAccountBtn('', '', false);
    showOverlay();
  }
  window.sairEstudio = sairEstudio;

  // Função para atualizar o nome da marca nos componentes da UI
  function applyStudioName(name) {
    if (!name) return;

    const logoTexts = document.querySelectorAll('.logo-text, #dynamic-logo-text');
    logoTexts.forEach(function (el) {
      el.textContent = name;
      if (name.length > 12) {
        el.setAttribute('font-size', '24px');
      } else if (name.length > 8) {
        el.setAttribute('font-size', '28px');
      } else {
        el.setAttribute('font-size', '36px');
      }
    });

    const brandElements = document.querySelectorAll('.dynamic-studio-name');
    brandElements.forEach(function (el) {
      el.textContent = name;
    });
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Gera HTML do Menu Dropdown de Sessão do Usuário
  function generateDropdownMenuHtml(prefix = 'btn-dropdown-', studioName = '', userEmail = '', isLoggedIn = false) {
    const currentName = studioName || 'Visitante';
    const currentEmail = userEmail || '';
    const systemBaseUrl = 'https://sistematestetattoo-com.vercel.app/';

    return `
      <div class="dropdown-user-header">
        <div class="dropdown-studio-title">${isLoggedIn ? 'Conta Ativa' : 'Sessão'}</div>
        <div class="dropdown-studio-name">${escapeHtml(currentName)}</div>
        ${currentEmail ? `<div class="dropdown-studio-email">${escapeHtml(currentEmail)}</div>` : ''}
      </div>

      <div class="dropdown-divider"></div>

      ${isLoggedIn ? `
      <div class="dropdown-item" id="${prefix}rename">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        Mudar Nome da Tatuaria
      </div>
      ` : ''}

      <a href="${systemBaseUrl}" target="_blank" class="dropdown-item" id="${prefix}enter-system">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
        Entrar no Sistema
      </a>

      ${isLoggedIn ? `
      <div class="dropdown-item danger" id="${prefix}logout">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sair desta Conta
      </div>
      ` : ''}
    `;
  }

  // Configuração de eventos nos itens do dropdown
  function attachDropdownEvents(container, prefix = 'btn-dropdown-', studioName = '') {
    // Mudar Nome da Tatuaria
    const btnRename = container.querySelector('#' + prefix + 'rename');
    const renameModal = document.getElementById('rename-modal-overlay');
    const renameInput = document.getElementById('rename-studio-input');
    if (btnRename && renameModal) {
      btnRename.addEventListener('click', function (e) {
        e.stopPropagation();
        const menuState = document.getElementById('main-menu__state');
        if (menuState) menuState.checked = false;

        const dropdown = container.querySelector('.user-dropdown-menu');
        if (dropdown) dropdown.classList.remove('show');

        if (renameInput) renameInput.value = studioName || '';
        renameModal.classList.add('show');
      });
    }

    // Sair desta Conta
    const btnLogout = container.querySelector('#' + prefix + 'logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', function (e) {
        e.stopPropagation();
        sairEstudio();
      });
    }
  }

  // Renderiza ícone de usuário e menu no cabeçalho
  function renderUserHeaderBadge(studioName, userEmail, isLoggedInParam) {
    const oldContainer = document.getElementById('user-avatar-container');
    if (oldContainer) oldContainer.remove();

    const overlayWrap = document.querySelector('.wrap--menu') || document.querySelector('.second-menu');
    if (!overlayWrap) return;

    const containerDiv = document.createElement('div');
    containerDiv.id = 'user-avatar-container';
    containerDiv.className = 'user-avatar-container overlay-avatar';

    containerDiv.innerHTML = `
      <button type="button" class="user-avatar-btn" id="user-avatar-btn" title="Perfil & Conta" aria-label="Perfil de Usuário">
        <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </button>
      <div class="user-dropdown-menu" id="user-dropdown-menu">
        ${generateDropdownMenuHtml('btn-dropdown-', studioName, userEmail, isLoggedInParam)}
      </div>
    `;

    overlayWrap.insertBefore(containerDiv, overlayWrap.firstChild);

    const avatarBtn = containerDiv.querySelector('#user-avatar-btn');
    const dropdownMenu = containerDiv.querySelector('#user-dropdown-menu');

    if (avatarBtn && dropdownMenu) {
      avatarBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isShow = dropdownMenu.classList.contains('show');
        if (isShow) {
          dropdownMenu.classList.remove('show');
          avatarBtn.classList.remove('active');
        } else {
          dropdownMenu.classList.add('show');
          avatarBtn.classList.add('active');
        }
      });

      document.addEventListener('click', function (e) {
        if (!containerDiv.contains(e.target)) {
          dropdownMenu.classList.remove('show');
          avatarBtn.classList.remove('active');
        }
      });
    }

    attachDropdownEvents(containerDiv, 'btn-dropdown-', studioName);
  }

  // Liga botão de conta do rodapé com o menu de usuário
  function bindFooterAccountBtn(studioName, userEmail, isLoggedInParam) {
    const footerContainer = document.getElementById('footer-account-icon');
    const footerBtn = document.getElementById('footer-user-avatar-btn');
    if (!footerContainer || !footerBtn) return;

    footerContainer.style.position = 'relative';
    footerContainer.style.cursor = 'pointer';

    const oldFooterDropdown = footerContainer.querySelector('.user-dropdown-menu');
    if (oldFooterDropdown) oldFooterDropdown.remove();

    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown-menu';
    dropdown.id = 'footer-user-dropdown-menu';
    dropdown.innerHTML = generateDropdownMenuHtml('btn-footer-dropdown-', studioName, userEmail, isLoggedInParam);

    footerContainer.appendChild(dropdown);

    function positionFooterDropdown() {
      const rect = footerBtn.getBoundingClientRect();
      const dropW = 240;
      let left = rect.left + rect.width / 2 - dropW / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - dropW - 8));
      dropdown.style.left = left + 'px';
      dropdown.style.top = (rect.top - dropdown.offsetHeight - 12) + 'px';
      requestAnimationFrame(function () {
        dropdown.style.top = (rect.top - dropdown.offsetHeight - 12) + 'px';
      });
    }

    function toggleFooterDropdown(e) {
      if (dropdown.contains(e.target) && !footerBtn.contains(e.target)) return;
      e.stopPropagation();
      const isShow = dropdown.classList.contains('show');
      if (isShow) {
        dropdown.classList.remove('show');
        footerBtn.classList.remove('active');
      } else {
        positionFooterDropdown();
        dropdown.classList.add('show');
        footerBtn.classList.add('active');
      }
    }

    footerContainer.addEventListener('click', toggleFooterDropdown);

    document.addEventListener('click', function (e) {
      if (!footerContainer.contains(e.target)) {
        dropdown.classList.remove('show');
        footerBtn.classList.remove('active');
      }
    });

    attachDropdownEvents(footerContainer, 'btn-footer-dropdown-', studioName);
  }

  // Modal para renomear estúdio / tatuaria no banco Supabase
  const renameModal = document.getElementById('rename-modal-overlay');
  const btnRenameCancel = document.getElementById('rename-btn-cancel');
  const btnRenameSave = document.getElementById('rename-btn-save');
  const renameInput = document.getElementById('rename-studio-input');

  if (btnRenameCancel && renameModal) {
    btnRenameCancel.addEventListener('click', function (e) {
      e.stopPropagation();
      renameModal.classList.remove('show');
    });
  }

  if (btnRenameSave && renameModal) {
    btnRenameSave.addEventListener('click', function (e) {
      e.stopPropagation();
      const newName = renameInput ? renameInput.value.trim() : '';
      if (!newName) {
        alert('Por favor, digite o novo nome da sua tatuaria.');
        return;
      }
      applyStudioName(newName);
      renameModal.classList.remove('show');
    });
  }

  window.applyStudioName = applyStudioName;
});
