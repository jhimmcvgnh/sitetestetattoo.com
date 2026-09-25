/**
 * ============================================================================
 * AD POP-UP (FOCUS FRAME), NAVBAR REPLACEMENT & FEEDBACK CHAT
 * ============================================================================
 */

(function () {
  'use strict';

  // Configurações de tempo e URLs
  const INITIAL_DELAY_MS = 3 * 60 * 1000;      // 3 minutos para a 1ª aparição
  const RECURRING_INTERVAL_MS = 90 * 1000;     // 1:30 minutos para as próximas
  const CTA_TARGET_URL = "https://jimdevtattooquizz-com.vercel.app";
  const STORAGE_KEY_DISMISSED = "tattoo_ad_popup_dismissed_session";
  const STORAGE_KEY_FEEDBACK = "tattoo_user_feedback_history";

  let initialTimer = null;
  let recurringTimer = null;
  let isPopupOpen = false;
  let isChatOpen = false;

  // --------------------------------------------------------------------------
  // 1. GERENCIAMENTO DA NAVBAR (SUBSTITUIÇÃO DE "TATUAGENS")
  // --------------------------------------------------------------------------
  function replaceNavbarTatuagens() {
    // Alvos específicos pelos IDs existentes no HTML
    const targetIds = ['menu-item-4597', 'menu-item-4601', 'menu-item-19'];
    
    targetIds.forEach(id => {
      const li = document.getElementById(id);
      if (li) {
        const existingLink = li.querySelector('a');
        if (existingLink) {
          // Substitui mantendo link com classe verde de destaque
          existingLink.href = CTA_TARGET_URL;
          existingLink.target = "_blank";
          existingLink.rel = "noopener noreferrer";
          existingLink.className = "nav-green-cta-btn";
          existingLink.textContent = "quero meu projeto completo";
          existingLink.setAttribute('title', 'Quero meu projeto completo');
        }
      }
    });

    // Varredura de segurança para qualquer outro link "Tatuagens" no cabeçalho
    const headerNavLinks = document.querySelectorAll('header nav a, .wrap--menu a');
    headerNavLinks.forEach(link => {
      const txt = (link.textContent || '').trim().toLowerCase();
      if (txt === 'tatuagens' || link.href.includes('galeriatattoo-com.vercel.app')) {
        link.href = CTA_TARGET_URL;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "nav-green-cta-btn";
        link.textContent = "quero meu projeto completo";
      }
    });
  }

  function restoreOriginalNavbar() {
    const targetIds = ['menu-item-4597', 'menu-item-4601', 'menu-item-19'];
    targetIds.forEach(id => {
      const li = document.getElementById(id);
      if (li) {
        const link = li.querySelector('a');
        if (link) {
          link.href = "https://galeriatattoo-com.vercel.app/";
          link.className = "";
          link.textContent = "Tatuagens";
          link.removeAttribute('target');
          link.removeAttribute('rel');
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 2. EXIBIÇÃO E FECHAMENTO DO POP-UP DE ANÚNCIO (FOCUS FRAME)
  // --------------------------------------------------------------------------
  function showAdPopup() {
    const overlay = document.getElementById('ad-popup-overlay');
    if (!overlay) return;

    overlay.classList.add('show');
    isPopupOpen = true;

    // Pausa o timer recorrente enquanto o pop-up estiver aberto
    if (recurringTimer) {
      clearInterval(recurringTimer);
      recurringTimer = null;
    }
  }

  function closeAdPopup(reason = 'close_x') {
    const overlay = document.getElementById('ad-popup-overlay');
    if (overlay) {
      overlay.classList.remove('show');
    }
    isPopupOpen = false;

    // Registra que o anúncio foi visualizado e fechado
    sessionStorage.setItem(STORAGE_KEY_DISMISSED, 'true');

    // Desbloqueia os novos elementos:
    // 1. Substitui "Tatuagens" pelo botão verde na Navbar
    replaceNavbarTatuagens();

    // 2. Torna visível o botão de chat com caneta no canto inferior direito
    showFloatingChatButton();

    // Agenda a próxima exibição a cada 1:30 minutos (90s)
    scheduleRecurringPopup();
  }

  function scheduleRecurringPopup() {
    if (recurringTimer) clearInterval(recurringTimer);
    recurringTimer = setInterval(() => {
      // Só exibe se não estiver aberto e se o usuário não estiver digitando ativamente no chat
      if (!isPopupOpen && !isChatOpen) {
        showAdPopup();
      }
    }, RECURRING_INTERVAL_MS);
  }

  // --------------------------------------------------------------------------
  // 3. BOTÃO FLUTUANTE DE CHAT (CANETA PRETA COM FUNDO VERDE)
  // --------------------------------------------------------------------------
  function showFloatingChatButton() {
    const chatBtn = document.getElementById('floating-chat-trigger');
    if (chatBtn) {
      chatBtn.classList.add('visible');
    }
  }

  function hideFloatingChatButton() {
    const chatBtn = document.getElementById('floating-chat-trigger');
    if (chatBtn) {
      chatBtn.classList.remove('visible');
    }
  }

  // --------------------------------------------------------------------------
  // 4. POP-UP DE CHAT DE FEEDBACK (MENSAGENS & SUGESTÕES)
  // --------------------------------------------------------------------------
  function toggleFeedbackChat() {
    const chatWindow = document.getElementById('feedback-chat-window');
    if (!chatWindow) return;

    if (chatWindow.classList.contains('show')) {
      chatWindow.classList.remove('show');
      isChatOpen = false;
    } else {
      chatWindow.classList.add('show');
      isChatOpen = true;
      // Foca no campo de texto
      const input = document.getElementById('chat-feedback-input');
      if (input) setTimeout(() => input.focus(), 300);
      // Rola até o final das mensagens
      scrollChatToBottom();
    }
  }

  function closeFeedbackChat() {
    const chatWindow = document.getElementById('feedback-chat-window');
    if (chatWindow) {
      chatWindow.classList.remove('show');
      isChatOpen = false;
    }
  }

  function scrollChatToBottom() {
    const messagesContainer = document.getElementById('chat-messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function formatTime(date = new Date()) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  function appendChatMessage(text, sender = 'user', timeStr = null) {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;

    const time = timeStr || formatTime();
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.innerHTML = `
      <div class="chat-bubble">${escapeHtml(text)}</div>
      <span class="chat-time">${time}</span>
    `;

    container.appendChild(msgDiv);
    scrollChatToBottom();
  }

  function escapeHtml(string) {
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function loadStoredFeedback() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FEEDBACK);
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          list.forEach(item => {
            appendChatMessage(item.text, item.sender, item.time);
          });
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar histórico de feedback:', e);
    }
  }

  function saveFeedbackMessage(text, sender) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FEEDBACK);
      const list = saved ? JSON.parse(saved) : [];
      list.push({
        text,
        sender,
        time: formatTime(),
        date: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(list));
    } catch (e) {
      console.warn('Erro ao salvar mensagem no localStorage:', e);
    }

    // Se o cliente Supabase estiver disponível, tenta salvar também no banco de forma assíncrona
    if (sender === 'user' && window.supabaseClient) {
      try {
        window.supabaseClient
          .from('site_feedbacks')
          .insert([{
            content: text,
            url: window.location.href,
            created_at: new Date().toISOString()
          }])
          .then(({ error }) => {
            if (error) {
              console.log('Feedback registrado localmente (tabela remota opcional):', error.message);
            } else {
              console.log('✅ Feedback sincronizado com sucesso no Supabase.');
            }
          })
          .catch(() => {});
      } catch (err) {
        // Fallback gracioso
      }
    }
  }

  function handleSendFeedback(e) {
    if (e) e.preventDefault();

    const input = document.getElementById('chat-feedback-input');
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    // Adiciona mensagem do usuário
    appendChatMessage(message, 'user');
    saveFeedbackMessage(message, 'user');
    input.value = '';

    // Resposta automática acolhedora após 500ms
    setTimeout(() => {
      const botResponse = "Muito obrigado pelo seu feedback! ✍️ Suas sugestões foram recebidas com sucesso e nos ajudarão a construir o novo projeto perfeito para você.";
      appendChatMessage(botResponse, 'bot');
      saveFeedbackMessage(botResponse, 'bot');
    }, 500);
  }

  // --------------------------------------------------------------------------
  // 5. INICIALIZAÇÃO E LISTENERS
  // --------------------------------------------------------------------------
  function initAdPopupFeature() {
    // 1. Botão fechar (X) do card pop-up
    const closeBtn = document.getElementById('ad-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        closeAdPopup('close_x');
      });
    }

    // 2. Fechar clicando no backdrop escuro fora do card
    const overlay = document.getElementById('ad-popup-overlay');
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          closeAdPopup('backdrop_click');
        }
      });
    }

    // 3. Botão CTA Principal "QUERO MEU PROJETO COMPLETO"
    const ctaBtn = document.getElementById('ad-cta-btn');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', function (e) {
        e.preventDefault();
        // Abre o link do quiz
        window.open(CTA_TARGET_URL, '_blank', 'noopener,noreferrer');
        // Fecha o popup e ativa a substituição da navbar + chat
        closeAdPopup('cta_click');
      });
    }

    // 4. Botões auxiliares do pop-up (varinha mágica e presente)
    const sparkleBtn = document.getElementById('ad-sparkle-btn');
    const giftBtn = document.getElementById('ad-gift-btn');
    [sparkleBtn, giftBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          window.open(CTA_TARGET_URL, '_blank', 'noopener,noreferrer');
          closeAdPopup('icon_cta_click');
        });
      }
    });

    // 5. Botão flutuante de chat (caneta)
    const chatTrigger = document.getElementById('floating-chat-trigger');
    if (chatTrigger) {
      chatTrigger.addEventListener('click', function (e) {
        e.preventDefault();
        toggleFeedbackChat();
      });
    }

    // 6. Botão de fechar janela do chat
    const chatCloseBtn = document.getElementById('feedback-chat-close-btn');
    if (chatCloseBtn) {
      chatCloseBtn.addEventListener('click', function (e) {
        e.preventDefault();
        closeFeedbackChat();
      });
    }

    // 7. Formulário de envio do chat
    const chatForm = document.getElementById('feedback-chat-form');
    if (chatForm) {
      chatForm.addEventListener('submit', handleSendFeedback);
    }

    // Carrega mensagens salvas anteriormente
    loadStoredFeedback();

    // 8. Verificação do Estado da Sessão
    const isDismissed = sessionStorage.getItem(STORAGE_KEY_DISMISSED) === 'true';

    if (isDismissed) {
      // Usuário já havia fechado o popup nesta sessão:
      // Mantém o botão verde na navbar e o botão de chat ativos
      replaceNavbarTatuagens();
      showFloatingChatButton();
      // E inicia o ciclo de 1:30 minutos
      scheduleRecurringPopup();
    } else {
      // Primeira visita:
      // O botão na navbar e o chat NÃO aparecem imediatamente.
      // Espera 3 minutos (180s) para mostrar o anúncio pela 1ª vez.
      initialTimer = setTimeout(() => {
        showAdPopup();
      }, INITIAL_DELAY_MS);
    }
  }

  // --------------------------------------------------------------------------
  // 6. FUNÇÕES GLOBAIS DE TESTE / DEBUG
  // --------------------------------------------------------------------------
  window.__adPopup = {
    show: showAdPopup,
    close: closeAdPopup,
    replaceNavbar: replaceNavbarTatuagens,
    restoreNavbar: restoreOriginalNavbar,
    showChat: showFloatingChatButton,
    hideChat: hideFloatingChatButton,
    toggleChat: toggleFeedbackChat,
    resetState: function () {
      sessionStorage.removeItem(STORAGE_KEY_DISMISSED);
      restoreOriginalNavbar();
      hideFloatingChatButton();
      closeFeedbackChat();
      if (recurringTimer) clearInterval(recurringTimer);
      if (initialTimer) clearTimeout(initialTimer);
      console.log('🔄 Estado do pop-up e navbar redefinido para o padrão.');
    }
  };

  // Aliases rápidos no console
  window.testAdPopup = showAdPopup;
  window.testDismissPopup = () => closeAdPopup('test_manual');
  window.resetAdState = window.__adPopup.resetState;

  // Inicialização no DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdPopupFeature);
  } else {
    initAdPopupFeature();
  }
})();
