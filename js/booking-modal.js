/* booking-modal.js — Conectado ao Supabase Real */

(function() {
    // 1. Create Modal HTML Element and append to body
    const modalHTML = `
    <div class="booking-overlay" id="bookingOverlay">
        <div class="booking-phone booking-popup">
            <!-- Close Button -->
            <button class="booking-close" id="bookingClose" aria-label="Fechar">&times;</button>
            
            <!-- Content Area -->
            <div class="booking-content" id="bookingContent">
                
                <!-- PHASE 1 -->
                <div class="booking-phase active" id="phase1">
                    <h2 class="phase-title">Onde será a arte?</h2>
                    
                    <label class="form-label">Escolha o local do corpo:</label>
                    <div class="body-parts-grid" id="bodyPartsGrid">
                        <!-- Populated dynamically from Supabase locais_corpo -->
                    </div>
                    
                    <div class="toggle-container">
                        <span class="form-label" style="margin-bottom: 0;">Mais de uma tatuagem?</span>
                        <label class="switch">
                            <input type="checkbox" id="multiTattoo">
                            <span class="slider"></span>
                        </label>
                    </div>
                    
                    <label class="form-label">Imagem de referência (Opcional):</label>
                    <div class="url-input-container" id="urlInputArea" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
                        <div style="display: flex; gap: 8px;">
                            <input type="text" id="urlInput" class="booking-input" placeholder="Cole o link da imagem (Pinterest, Instagram, web)..." style="flex: 1; border-bottom: 1px solid rgba(231, 243, 226, 0.3); margin-bottom: 0; padding: 6px 0;">
                            <button type="button" class="booking-btn" id="btnConfirmUrl" style="flex: 0 0 auto; width: auto; padding: 8px 12px; margin: 0; font-size: 10px;">Adicionar Link</button>
                        </div>
                        <div>
                            <input type="file" id="fileUploadInput" accept="image/*" multiple style="display: none;">
                            <button type="button" class="booking-btn" id="btnUploadFile" style="width: 100%; padding: 8px; margin: 0; font-size: 11px; background: rgba(255, 255, 255, 0.08); border: 1px dashed rgba(231, 243, 226, 0.4); display: flex; align-items: center; justify-content: center; gap: 6px;">
                                📁 Selecionar Foto do Celular / Computador
                            </button>
                            <div id="uploadStatusLabel" style="display: none; font-size: 11px; color: #70d6ff; margin-top: 4px; text-align: center;">Enviando imagem para a nuvem...</div>
                        </div>
                    </div>
                    <div class="upload-previews-container" id="uploadPreviewsContainer" style="display: none; margin-top: 12px;"></div>
                </div>
                
                <!-- PHASE 2 -->
                <div class="booking-phase" id="phase2">
                    <h2 class="phase-title">Selecione Data e Hora</h2>
                    
                    <label class="form-label">Data:</label>
                    <div class="calendar-widget">
                        <div class="calendar-header">
                            <button class="calendar-nav-btn" id="calPrev">&lt;</button>
                            <span class="calendar-month-year" id="calMonthYear">Julho 2026</span>
                            <button class="calendar-nav-btn" id="calNext">&gt;</button>
                        </div>
                        <div class="calendar-grid" id="calendarGrid">
                            <!-- Populated by JS -->
                        </div>
                    </div>
                    
                    <label class="form-label">Horários Disponíveis:</label>
                    <div class="time-slots-container">
                        <div class="time-slots-grid" id="timeSlotsGrid">
                            <!-- Populated dynamically from Supabase horarios_disponiveis -->
                        </div>
                    </div>
                    
                    <label class="form-label">Suas Informações:</label>
                    <div class="form-group">
                        <input type="text" id="custName" class="booking-input" placeholder="Nome Completo" required>
                    </div>
                    <div class="form-group">
                        <input type="tel" id="custPhone" class="booking-input" placeholder="Telefone (WhatsApp)" required>
                    </div>
                    <div class="form-group">
                        <input type="email" id="custEmail" class="booking-input" placeholder="Seu Gmail / E-mail" required>
                    </div>
                </div>
                
                <!-- PHASE 3 -->
                <div class="booking-phase" id="phase3">
                    <h2 class="phase-title">Confirme suas Escolhas</h2>
                    
                    <div class="summary-box">
                        <div class="summary-row">
                            <span class="summary-label">Tatuagem</span>
                            <span class="summary-val-container">
                                <span class="summary-val" id="sumTatoo">Braço</span>
                                <button type="button" class="summary-edit-btn" data-step="1">Alterar</button>
                            </span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Mais de uma</span>
                            <span class="summary-val-container">
                                <span class="summary-val" id="sumMulti">Não</span>
                                <button type="button" class="summary-edit-btn" data-step="1">Alterar</button>
                            </span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Referências</span>
                            <span class="summary-val-container">
                                <span class="summary-val" id="sumPhotos">Nenhuma</span>
                                <button type="button" class="summary-edit-btn" data-step="1" id="btnEditPhotos">Alterar</button>
                            </span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Data & Hora</span>
                            <span class="summary-val-container">
                                <span class="summary-val" id="sumDateTime">-</span>
                                <button type="button" class="summary-edit-btn" data-step="2">Alterar</button>
                            </span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Cliente</span>
                            <span class="summary-val-container">
                                <span class="summary-val" id="sumName">-</span>
                                <button type="button" class="summary-edit-btn" data-step="2">Alterar</button>
                            </span>
                        </div>
                    </div>
                    
                    <div class="summary-previews-container" id="summaryPreviewsContainer" style="display: none; margin-top: 12px; margin-bottom: 16px;"></div>
                    
                    <!-- Direct Reference Image URL change inside summary -->
                    <div class="summary-url-section" id="summaryUrlSection" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
                        <div style="display: flex; gap: 8px;">
                            <input type="text" id="summaryUrlInput" class="booking-input" placeholder="Cole o link da imagem..." style="flex: 1; border-bottom: 1px solid rgba(231, 243, 226, 0.3); margin-bottom: 0;">
                            <button type="button" class="summary-upload-btn" id="btnSummaryUrlAdd" style="width: auto; margin-bottom: 0; padding: 8px 14px; white-space: nowrap;">📷 Adicionar Link</button>
                        </div>
                        <div>
                            <input type="file" id="summaryFileUploadInput" accept="image/*" multiple style="display: none;">
                            <button type="button" class="summary-upload-btn" id="btnSummaryUploadFile" style="width: 100%; margin-bottom: 0; padding: 8px; text-align: center; background: rgba(255, 255, 255, 0.08); border: 1px dashed rgba(231, 243, 226, 0.4);">
                                📁 Selecionar Foto do Celular / Computador
                            </button>
                        </div>
                    </div>

                    <div class="confirm-actions-container">
                        <button type="button" class="confirm-action-btn confirm-btn-whatsapp" id="btnConfirmWhatsapp">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="wpp-icon" style="width: 14px; height: 14px; margin-right: 6px; vertical-align: middle;">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>Falar no WhatsApp</button>
                        <button type="button" class="confirm-action-btn confirm-btn-submit" id="btnConfirmSubmit">Confirmar Agendamento</button>
                    </div>
                </div>
                
                <!-- SUCCESS PHASE -->
                <div class="booking-phase" id="phaseSuccess">
                    <div class="success-screen">
                        <div class="success-icon-container">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 class="phase-title" style="margin-bottom: 8px;">Tudo Pronto!</h2>
                        <p class="success-subtitle" id="successMsg">Seu agendamento foi pré-confirmado.<br>Entraremos em contato pelo WhatsApp em breve!</p>
                    </div>
                </div>
                
            </div>
            
            <!-- Actions buttons (Voltar/Avancar) -->
            <div class="booking-buttons" id="bookingButtons">
                <button type="button" class="booking-btn" id="btnBack">Voltar</button>
                <button type="button" class="booking-btn booking-btn-primary" id="btnNext">Avançar</button>
            </div>

            <!-- Floating Support Chat inside the popup -->
            <div class="chat-widget-container" id="chatWidgetContainer">
                <div class="chat-widget-button" id="chatWidgetButton" aria-label="Suporte">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chat-icon">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                </div>
                <div class="chat-widget-window" id="chatWidgetWindow">
                    <div class="chat-widget-header">
                        <div class="chat-widget-profile">
                            <span class="chat-widget-avatar">🎨</span>
                            <div class="chat-widget-status-info">
                                <span class="chat-widget-name">Suporte Quizz Tattoo</span>
                                <span class="chat-widget-status"><span class="status-dot"></span> Online</span>
                            </div>
                        </div>
                        <button class="chat-widget-close" id="chatWidgetClose">&times;</button>
                    </div>
                    <div class="chat-widget-body" id="chatWidgetBody">
                        <div class="chat-widget-message system">
                            Olá! Tem alguma dúvida sobre o agendamento? Digite sua mensagem abaixo para falar conosco diretamente no WhatsApp!
                        </div>
                    </div>
                    <div class="chat-widget-footer">
                        <textarea class="chat-widget-input" id="chatWidgetInput" placeholder="Digite sua dúvida..." rows="1"></textarea>
                        <button class="chat-widget-send" id="chatWidgetSend">Enviar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 2. Select DOM Elements
    const overlay = document.getElementById('bookingOverlay');
    const closeBtn = document.getElementById('bookingClose');
    const btnBack = document.getElementById('btnBack');
    const btnNext = document.getElementById('btnNext');
    const buttonsArea = document.getElementById('bookingButtons');
    
    const pStep1 = document.getElementById('pStep1');
    const pStep2 = document.getElementById('pStep2');
    const pStep3 = document.getElementById('pStep3');
    
    const phase1 = document.getElementById('phase1');
    const phase2 = document.getElementById('phase2');
    const phase3 = document.getElementById('phase3');
    const phaseSuccess = document.getElementById('phaseSuccess');

    // Form inputs & selections state
    let selectedBodyParts = [];
    let isMultiTattoo = false;
    let selectedLinks = []; // Array of URL strings
    
    let selectedDate = null; // Date object
    let selectedTimeSlot = null; // String "09:00"
    
    let custName = "";
    let custPhone = "";
    let custEmail = "";
    
    let currentStep = 1; // 1, 2, 3, 4 (Success)

    // Calendar state
    let calCurrentDate = new Date(); // Date showing on calendar header

    // Dynamic data fetched from Supabase
    let loadedLocaisCorpo = [];
    let loadedHorariosDisponiveis = [];

    // =========================================================================
    // RESOLUÇÃO DE ESTÚDIO E SUPABASE STORAGE
    // =========================================================================
    async function getEstudioIdParaAgendamento() {
        if (typeof window.getEstudioAtivoId === 'function') {
            const sessionEstudioId = await window.getEstudioAtivoId();
            if (sessionEstudioId) return sessionEstudioId;
        }

        const bodyEstudioId = document.body.getAttribute('data-estudio-id');
        if (bodyEstudioId) return bodyEstudioId;

        const urlParams = new URLSearchParams(window.location.search);
        const urlEstudioId = urlParams.get('estudio_id');
        if (urlEstudioId) return urlEstudioId;

        if (window.currentEstudioId) return window.currentEstudioId;

        return null;
    }

    async function uploadImagemReferencia(file, estudioId) {
        if (!file) return null;

        // 1. Tentar upload para o Supabase Storage (bucket 'referencias') se a SDK estiver ativa
        if (window.supabaseClient && window.supabaseClient.storage) {
            try {
                const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
                const fileName = `${estudioId || 'public'}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

                const { data, error } = await window.supabaseClient.storage
                    .from('referencias')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (!error && data) {
                    const { data: publicUrlData } = window.supabaseClient.storage
                        .from('referencias')
                        .getPublicUrl(fileName);

                    if (publicUrlData && publicUrlData.publicUrl) {
                        console.log('✅ Imagem enviada com sucesso ao Supabase Storage:', publicUrlData.publicUrl);
                        return publicUrlData.publicUrl;
                    }
                } else {
                    console.warn('⚠️ Supabase Storage upload aviso (bucket "referencias"):', error);
                }
            } catch (errStorage) {
                console.warn('⚠️ Erro ao enviar imagem ao Supabase Storage:', errStorage);
            }
        }

        // 2. Fallback: Converter para Data URL (Base64) garantindo que o link seja permanente e acessível no banco
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => resolve(URL.createObjectURL(file));
            reader.readAsDataURL(file);
        });
    }

    // 3. Setup Interactive Elements
    
    // Step 1: Multi Toggle
    const multiTattooCheck = document.getElementById('multiTattoo');
    const uploadPreviewsContainer = document.getElementById('uploadPreviewsContainer');
    const urlInputArea = document.getElementById('urlInputArea');
    const urlInput = document.getElementById('urlInput');
    const btnConfirmUrl = document.getElementById('btnConfirmUrl');
    const uploadStatusLabel = document.getElementById('uploadStatusLabel');
    
    multiTattooCheck.addEventListener('change', (e) => {
        isMultiTattoo = e.target.checked;
        if (isMultiTattoo) {
            urlInput.placeholder = 'Cole outro link da imagem...';
        } else {
            urlInput.placeholder = 'Cole o link da imagem (ex: Pinterest, Instagram, etc.)...';
            if (selectedLinks.length > 1) {
                selectedLinks = selectedLinks.slice(0, 1);
            }
        }
        renderPreviews();
    });

    const addLink = (linkVal) => {
        let url = linkVal.trim();
        if (!url) return;
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        if (isMultiTattoo) {
            if (!selectedLinks.includes(url)) {
                selectedLinks.push(url);
            }
        } else {
            selectedLinks = [url];
        }
        renderPreviews();
    };

    if (btnConfirmUrl && urlInput) {
        btnConfirmUrl.addEventListener('click', () => {
            addLink(urlInput.value);
            urlInput.value = '';
        });

        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addLink(urlInput.value);
                urlInput.value = '';
            }
        });
    }

    // Handler para upload real de arquivos de imagem no Supabase Storage
    const handleDeviceFiles = async (files) => {
        const fileList = Array.from(files || []);
        if (fileList.length === 0) return;

        if (uploadStatusLabel) uploadStatusLabel.style.display = 'block';

        const estudioId = await getEstudioIdParaAgendamento();
        for (const file of fileList) {
            if (!file || !file.type.startsWith('image/')) continue;
            const publicUrl = await uploadImagemReferencia(file, estudioId);
            if (publicUrl) {
                addLink(publicUrl);
            } else {
                alert(`Não foi possível enviar a imagem "${file.name}". Tente novamente.`);
            }
        }

        if (uploadStatusLabel) uploadStatusLabel.style.display = 'none';
    };

    const fileUploadInput = document.getElementById('fileUploadInput');
    const btnUploadFile = document.getElementById('btnUploadFile');

    if (btnUploadFile && fileUploadInput) {
        btnUploadFile.addEventListener('click', () => {
            fileUploadInput.click();
        });
        fileUploadInput.addEventListener('change', async (e) => {
            await handleDeviceFiles(e.target.files);
            fileUploadInput.value = '';
        });
    }

    const summaryFileUploadInput = document.getElementById('summaryFileUploadInput');
    const btnSummaryUploadFile = document.getElementById('btnSummaryUploadFile');

    if (btnSummaryUploadFile && summaryFileUploadInput) {
        btnSummaryUploadFile.addEventListener('click', () => {
            summaryFileUploadInput.click();
        });
        summaryFileUploadInput.addEventListener('change', async (e) => {
            await handleDeviceFiles(e.target.files);
            summaryFileUploadInput.value = '';
        });
    }

    function renderPreviews() {
        uploadPreviewsContainer.innerHTML = '';
        
        if (selectedLinks.length === 0) {
            uploadPreviewsContainer.style.display = 'none';
            urlInputArea.style.display = 'flex';
        } else {
            uploadPreviewsContainer.style.display = 'block';
            if (isMultiTattoo) {
                urlInputArea.style.display = 'flex';
            } else {
                urlInputArea.style.display = 'none';
            }
            
            selectedLinks.forEach((link, index) => {
                const item = document.createElement('div');
                item.className = 'upload-preview-item';
                
                const img = document.createElement('img');
                img.src = link;
                img.className = 'upload-preview-img';
                
                const placeholder = document.createElement('div');
                placeholder.className = 'upload-preview-placeholder';
                placeholder.textContent = '🔗';
                placeholder.style.width = '40px';
                placeholder.style.height = '40px';
                placeholder.style.background = 'rgba(231, 243, 226, 0.1)';
                placeholder.style.border = '1px solid rgba(231, 243, 226, 0.2)';
                placeholder.style.borderRadius = '4px';
                placeholder.style.display = 'none';
                placeholder.style.alignItems = 'center';
                placeholder.style.justifyContent = 'center';
                placeholder.style.fontSize = '14px';

                img.onerror = () => {
                    img.style.display = 'none';
                    placeholder.style.display = 'flex';
                };
                
                const info = document.createElement('span');
                info.className = 'upload-preview-info';
                info.textContent = link;
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'upload-remove-item';
                removeBtn.type = 'button';
                removeBtn.innerHTML = '&times;';
                
                removeBtn.addEventListener('click', (evt) => {
                    evt.stopPropagation();
                    selectedLinks.splice(index, 1);
                    renderPreviews();
                });
                
                item.appendChild(img);
                item.appendChild(placeholder);
                item.appendChild(info);
                item.appendChild(removeBtn);
                uploadPreviewsContainer.appendChild(item);
            });
        }
        
        updateSummaryPhotosText();
        renderSummaryPreviews();
    }

    // Step 2: Inputs validation
    const inputName = document.getElementById('custName');
    const inputPhone = document.getElementById('custPhone');
    const inputEmail = document.getElementById('custEmail');

    const checkInputsValidity = () => {
        custName = inputName.value.trim();
        custPhone = inputPhone.value.trim();
        custEmail = inputEmail.value.trim();
        validateStep();
    };

    inputName.addEventListener('input', checkInputsValidity);
    inputPhone.addEventListener('input', checkInputsValidity);
    inputEmail.addEventListener('input', checkInputsValidity);

    // Step 2: Calendar Navigation
    document.getElementById('calPrev').addEventListener('click', () => {
        calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('calNext').addEventListener('click', () => {
        calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
        renderCalendar();
    });

    // Render Custom Calendar
    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const dayNames = ["D", "S", "T", "Q", "Q", "S", "S"];

    function renderCalendar() {
        const grid = document.getElementById('calendarGrid');
        const monthYearLabel = document.getElementById('calMonthYear');
        
        if (!grid || !monthYearLabel) return;
        grid.innerHTML = '';
        
        const year = calCurrentDate.getFullYear();
        const month = calCurrentDate.getMonth();
        
        monthYearLabel.textContent = `${monthNames[month]} ${year}`;
        
        dayNames.forEach(name => {
            const h = document.createElement('div');
            h.className = 'calendar-day-header';
            h.textContent = name;
            grid.appendChild(h);
        });
        
        const firstDayIndex = new Date(year, month, 1).getDay();
        const numDays = new Date(year, month + 1, 0).getDate();
        
        for (let i = 0; i < firstDayIndex; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day empty';
            grid.appendChild(empty);
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let d = 1; d <= numDays; d++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            dayCell.textContent = d;
            
            const cellDate = new Date(year, month, d);
            
            if (cellDate < today) {
                dayCell.classList.add('disabled');
            } else {
                if (selectedDate && 
                    selectedDate.getDate() === d && 
                    selectedDate.getMonth() === month && 
                    selectedDate.getFullYear() === year) {
                    dayCell.classList.add('selected');
                }
                
                dayCell.addEventListener('click', async () => {
                    selectedDate = cellDate;
                    renderCalendar();
                    const estudioId = await getEstudioIdParaAgendamento();
                    await renderTimeSlotOptions(loadedHorariosDisponiveis, estudioId);
                    validateStep();
                });
            }
            grid.appendChild(dayCell);
        }
    }

    // Setup Edit buttons in Summary
    const setupSummaryEditListeners = () => {
        document.querySelectorAll('.summary-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const step = parseInt(btn.getAttribute('data-step'), 10);
                if (step >= 1 && step <= 2) {
                    currentStep = step;
                    updateStepUI();
                }
            });
        });
    };

    // Summary URL Setup
    const btnSummaryUrlAdd = document.getElementById('btnSummaryUrlAdd');
    const summaryUrlInput = document.getElementById('summaryUrlInput');
    
    const addSummaryUrl = (linkVal) => {
        let url = linkVal.trim();
        if (!url) return;
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        if (isMultiTattoo) {
            if (!selectedLinks.includes(url)) {
                selectedLinks.push(url);
            }
        } else {
            selectedLinks = [url];
        }
        renderPreviews();
    };

    if (btnSummaryUrlAdd && summaryUrlInput) {
        btnSummaryUrlAdd.addEventListener('click', () => {
            addSummaryUrl(summaryUrlInput.value);
            summaryUrlInput.value = '';
        });
        
        summaryUrlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSummaryUrl(summaryUrlInput.value);
                summaryUrlInput.value = '';
            }
        });
    }

    function updateSummaryPhotosText() {
        const sumPhotos = document.getElementById('sumPhotos');
        if (sumPhotos) {
            if (selectedLinks.length === 0) {
                sumPhotos.textContent = 'Nenhuma';
            } else if (selectedLinks.length === 1) {
                sumPhotos.textContent = '1 imagem';
            } else {
                sumPhotos.textContent = `${selectedLinks.length} imagens`;
            }
        }
    }

    function renderSummaryPreviews() {
        const container = document.getElementById('summaryPreviewsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (selectedLinks.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.gap = '8px';
        
        selectedLinks.forEach((link, index) => {
            const item = document.createElement('div');
            item.className = 'summary-preview-item';
            item.style.position = 'relative';
            item.style.width = '50px';
            item.style.height = '50px';
            item.style.border = '1px solid rgba(231, 243, 226, 0.3)';
            item.style.borderRadius = '4px';
            item.style.overflow = 'hidden';
            
            const img = document.createElement('img');
            img.src = link;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            
            const placeholder = document.createElement('div');
            placeholder.textContent = '🔗';
            placeholder.style.width = '100%';
            placeholder.style.height = '100%';
            placeholder.style.background = 'rgba(231, 243, 226, 0.1)';
            placeholder.style.display = 'none';
            placeholder.style.alignItems = 'center';
            placeholder.style.justifyContent = 'center';
            placeholder.style.fontSize = '16px';

            img.onerror = () => {
                img.style.display = 'none';
                placeholder.style.display = 'flex';
            };
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.innerHTML = '&times;';
            removeBtn.style.position = 'absolute';
            removeBtn.style.top = '2px';
            removeBtn.style.right = '2px';
            removeBtn.style.background = 'rgba(0, 0, 0, 0.7)';
            removeBtn.style.color = '#fff';
            removeBtn.style.border = 'none';
            removeBtn.style.borderRadius = '50%';
            removeBtn.style.width = '16px';
            removeBtn.style.height = '16px';
            removeBtn.style.display = 'flex';
            removeBtn.style.alignItems = 'center';
            removeBtn.style.justifyContent = 'center';
            removeBtn.style.fontSize = '10px';
            removeBtn.style.cursor = 'pointer';
            
            removeBtn.addEventListener('click', (evt) => {
                evt.stopPropagation();
                selectedLinks.splice(index, 1);
                renderPreviews();
            });
            
            item.appendChild(img);
            item.appendChild(placeholder);
            item.appendChild(removeBtn);
            container.appendChild(item);
        });
    }

    // =========================================================================
    // DADOS DINÂMICOS DO SUPABASE: LOCAIS CORPO, HORÁRIOS E CHECAGEM DE OCUPADOS
    // =========================================================================
    async function loadDynamicModalData() {
        try {
            renderBodyPartsOptions([]);
            await renderTimeSlotOptions([], null);
        } catch (err) {
            console.error("⚠️ Erro ao carregar opções do modal:", err);
        }
    }

    function renderBodyPartsOptions(locais) {
        const grid = document.getElementById('bodyPartsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        if (!locais || locais.length === 0) {
            locais = [
                { id: 1, nome: 'Braço' },
                { id: 2, nome: 'Perna' },
                { id: 3, nome: 'Costas' },
                { id: 4, nome: 'Peito' },
                { id: 5, nome: 'Pescoço' },
                { id: 6, nome: 'Outro' }
            ];
        }

        locais.forEach(local => {
            const card = document.createElement('div');
            card.className = 'body-part-card';
            card.setAttribute('data-id', local.id);
            card.setAttribute('data-value', local.nome);
            card.textContent = local.nome;

            if (selectedBodyParts.includes(local.nome)) {
                card.classList.add('selected');
            }

            card.addEventListener('click', () => {
                const val = local.nome;
                if (card.classList.contains('selected')) {
                    card.classList.remove('selected');
                    selectedBodyParts = selectedBodyParts.filter(part => part !== val);
                } else {
                    card.classList.add('selected');
                    selectedBodyParts.push(val);
                }
                validateStep();
            });

            grid.appendChild(card);
        });
    }

    async function resolverEstudioIdDaPagina() {
        // 1. Dono logado: usa o mecanismo de sessão (sessão -> perfis.estudio_id)
        if (typeof window.getEstudioAtivoId === 'function') {
            const idDoLogin = await window.getEstudioAtivoId();
            if (idDoLogin) return idDoLogin;
        }

        // 2. Visitante sem conta: resolve pelo slug na URL (?estudio=slug-do-estudio)
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('estudio') || params.get('slug');
        const estudioIdDirect = params.get('estudio_id');

        if (estudioIdDirect) return estudioIdDirect;

        if (!slug) {
            return null; // sem slug e sem login = não há como saber de qual estúdio é isso
        }

        if (window.supabaseClient) {
            try {
                const { data: estudioId, error } = await window.supabaseClient
                    .rpc('buscar_estudio_id_por_slug', { p_slug: slug.trim() });

                if (!error && estudioId) {
                    return estudioId;
                }
            } catch (errRpc) {
                console.warn('Aviso ao chamar RPC buscar_estudio_id_por_slug:', errRpc);
            }

            // Fallback por consulta direta de tabela se a RPC ainda não estiver criada no banco
            try {
                const { data: estBySlug } = await window.supabaseClient
                    .from('estudios')
                    .select('id')
                    .eq('slug', slug.trim())
                    .maybeSingle();
                if (estBySlug && estBySlug.id) return estBySlug.id;
            } catch (errDirect) {
                console.warn('Aviso ao consultar estúdio por slug:', errDirect);
            }
        }

        console.warn('Slug de estúdio inválido ou não encontrado:', slug);
        return null;
    }

    window.resolverEstudioIdDaPagina = resolverEstudioIdDaPagina;

    async function getHorariosOcupados(estudioId, dataSelecionadaStr) {
        return new Set();
    }

    async function renderTimeSlotOptions(horarios, estudioId) {
        const grid = document.getElementById('timeSlotsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        if (!horarios || horarios.length === 0) {
            horarios = [
                { horario: '09:00' },
                { horario: '10:30' },
                { horario: '13:00' },
                { horario: '14:30' },
                { horario: '16:00' },
                { horario: '17:30' }
            ];
        }

        const dateKey = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
        let horariosOcupadosSet = new Set();
        if (estudioId && dateKey) {
            horariosOcupadosSet = await getHorariosOcupados(estudioId, dateKey);
        }

        horarios.forEach(slot => {
            let timeStr = typeof slot === 'string' ? slot : (slot.horario || slot.hora_inicio || '09:00');
            if (typeof timeStr === 'string' && timeStr.length > 5 && timeStr.includes(':')) {
                timeStr = timeStr.substring(0, 5);
            }

            const isBooked = horariosOcupadosSet.has(timeStr);

            const btn = document.createElement('div');
            btn.className = 'time-slot-btn' + (isBooked ? ' occupied' : '');
            btn.setAttribute('data-time', timeStr);
            btn.textContent = timeStr + (isBooked ? ' (Ocupado)' : '');

            if (selectedTimeSlot === timeStr) {
                btn.classList.add('selected');
            }

            btn.addEventListener('click', () => {
                if (isBooked) {
                    alert(`O horário das ${timeStr} já possui um agendamento nesta data para este estúdio. Por favor escolha outro horário disponível.`);
                    return;
                }
                const allBtns = grid.querySelectorAll('.time-slot-btn');
                allBtns.forEach(s => s.classList.remove('selected'));
                btn.classList.add('selected');
                selectedTimeSlot = timeStr;
                validateStep();
            });

            grid.appendChild(btn);
        });
    }

    // =========================================================================
    // ENVIAR AGENDAMENTO PELA RPC REAL criar_agendamento_publico
    // =========================================================================
    async function sendBookingToSupabase(viaWhatsapp = false) {
        let dataAgendamentoStr = new Date().toISOString().split('T')[0];
        if (selectedDate) {
            const yyyy = selectedDate.getFullYear();
            const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const dd = String(selectedDate.getDate()).padStart(2, '0');
            dataAgendamentoStr = `${yyyy}-${mm}-${dd}`;
        }

        // Auto-capturar link pendente caso o usuário tenha colado a URL mas não clicou em "Adicionar"
        const urlInputEl = document.getElementById('urlInput');
        const summaryUrlInputEl = document.getElementById('summaryUrlInput');
        const pendingUrl = (urlInputEl && urlInputEl.value.trim()) || (summaryUrlInputEl && summaryUrlInputEl.value.trim());
        if (pendingUrl) {
            let url = pendingUrl;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            if (!selectedLinks.includes(url)) {
                selectedLinks.push(url);
            }
        }

        if (!window.supabaseClient) {
            console.warn("Supabase não configurado. Agendamento processado em modo local.");
            return { id: 'local-' + Date.now(), status: 'confirmado' };
        }

        const estudioId = window.estudioIdAtivoNoModal || await resolverEstudioIdDaPagina();

        if (!estudioId) {
            mostrarErroDeLinkInvalido();
            return null;
        }

        const timeStr = selectedTimeSlot || '09:00';
        const startIso = `${dataAgendamentoStr}T${timeStr.length === 5 ? timeStr + ':00' : timeStr}Z`;

        const { data: agendamentoId, error: rpcError } = await window.supabaseClient.rpc('criar_agendamento_publico', {
            p_estudio_id: estudioId,
            p_cliente_nome: custName || 'Cliente sem nome',
            p_cliente_email: custEmail || null,
            p_cliente_telefone: custPhone || '',
            p_data_hora_inicio: startIso,
            p_locais: selectedBodyParts || [],
            p_mais_de_uma_tattoo: !!isMultiTattoo,
            p_imagens: selectedLinks || [],
            p_observacoes: null
        });

        if (rpcError) {
            console.error('Erro na RPC criar_agendamento_publico:', rpcError);
            if (rpcError.message && rpcError.message.includes('HORARIO_INDISPONIVEL')) {
                alert(`O horário das ${timeStr} na data escolhida já possui outro agendamento. Por favor selecione outro horário.`);
                return null;
            }
            throw new Error(rpcError.message || 'Erro ao realizar agendamento.');
        }

        return {
            id: agendamentoId || 'agendamento-' + Date.now(),
            status: 'confirmado'
        };
    }

    // Custom Confirmation Actions Setup
    const btnConfirmSubmit = document.getElementById('btnConfirmSubmit');
    const btnConfirmWhatsapp = document.getElementById('btnConfirmWhatsapp');

    async function processBookingConfirmation(viaWhatsapp = false) {
        const origSubmitText = btnConfirmSubmit ? btnConfirmSubmit.textContent : '';
        const origWppText = btnConfirmWhatsapp ? btnConfirmWhatsapp.innerHTML : '';

        if (btnConfirmSubmit) btnConfirmSubmit.disabled = true;
        if (btnConfirmWhatsapp) btnConfirmWhatsapp.disabled = true;
        if (btnConfirmSubmit) btnConfirmSubmit.textContent = 'Enviando...';

        try {
            const result = await sendBookingToSupabase(viaWhatsapp);
            if (result) {
                if (viaWhatsapp) {
                    const dateStr = selectedDate ? selectedDate.toLocaleDateString('pt-BR') : '';
                    const msg = `Olá! Gostaria de confirmar meu agendamento:\n- Local: ${selectedBodyParts.join(', ')}\n- Mais de uma tattoo: ${isMultiTattoo ? 'Sim' : 'Não'}\n- Links de referência:\n${selectedLinks.join('\n')}\n- Data/Hora: ${dateStr} às ${selectedTimeSlot}\n- Nome: ${custName}\n- Telefone: ${custPhone}\n- Email: ${custEmail}`;
                    const WHATSAPP_NUMBER = "5547999999999";
                    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
                    window.open(url, '_blank');
                }
                currentStep = 4;
                updateStepUI();
            }
        } catch (err) {
            console.error("Erro no processamento da confirmação:", err);
            alert("Ocorreu um erro ao processar seu agendamento. Tente novamente.");
        } finally {
            if (btnConfirmSubmit) {
                btnConfirmSubmit.disabled = false;
                btnConfirmSubmit.textContent = origSubmitText || 'Confirmar Agendamento';
            }
            if (btnConfirmWhatsapp) {
                btnConfirmWhatsapp.disabled = false;
                btnConfirmWhatsapp.innerHTML = origWppText;
            }
        }
    }

    if (btnConfirmSubmit) {
        btnConfirmSubmit.addEventListener('click', () => processBookingConfirmation(false));
    }

    if (btnConfirmWhatsapp) {
        btnConfirmWhatsapp.addEventListener('click', () => processBookingConfirmation(true));
    }

    // 4. Modal Flow Control & Validation

    function validateStep() {
        let isValid = false;
        
        if (currentStep === 1) {
            isValid = selectedBodyParts.length > 0;
        } else if (currentStep === 2) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = selectedDate !== null && 
                      selectedTimeSlot !== null && 
                      custName.length > 1 && 
                      custPhone.length > 7 && 
                      emailRegex.test(custEmail);
        } else if (currentStep === 3) {
            isValid = true;
        }
        
        btnNext.disabled = !isValid;
    }

    function updateStepUI() {
        const bookingContent = document.getElementById('bookingContent');
        if (bookingContent) {
            bookingContent.scrollTop = 0;
        }

        [pStep1, pStep2, pStep3].filter(Boolean).forEach(s => s.classList.remove('active'));
        [phase1, phase2, phase3, phaseSuccess].forEach(p => p.classList.remove('active'));
        
        if (currentStep === 1) {
            if (pStep1) pStep1.classList.add('active');
            phase1.classList.add('active');
            btnBack.style.visibility = 'hidden';
            btnNext.textContent = 'Avançar';
            btnNext.style.display = 'block';
            buttonsArea.style.display = 'flex';
        } else if (currentStep === 2) {
            if (pStep2) pStep2.classList.add('active');
            phase2.classList.add('active');
            btnBack.style.visibility = 'visible';
            btnNext.textContent = 'Avançar';
            btnNext.style.display = 'block';
            buttonsArea.style.display = 'flex';
            renderCalendar();
        } else if (currentStep === 3) {
            if (pStep3) pStep3.classList.add('active');
            phase3.classList.add('active');
            btnBack.style.visibility = 'visible';
            btnNext.style.display = 'none';
            buttonsArea.style.display = 'flex';
            
            document.getElementById('sumTatoo').textContent = selectedBodyParts.join(', ');
            document.getElementById('sumMulti').textContent = isMultiTattoo ? 'Sim' : 'Não';
            updateSummaryPhotosText();
            renderSummaryPreviews();
            setupSummaryEditListeners();
            
            const dateStr = selectedDate ? selectedDate.toLocaleDateString('pt-BR') : '';
            document.getElementById('sumDateTime').textContent = `${dateStr} às ${selectedTimeSlot}`;
            document.getElementById('sumName').textContent = custName;
        } else if (currentStep === 4) {
            if (pStep3) pStep3.classList.add('active');
            phaseSuccess.classList.add('active');
            buttonsArea.style.display = 'none';
        }
        
        validateStep();
    }

    // Next Button Click
    btnNext.addEventListener('click', async () => {
        if (currentStep < 3) {
            currentStep++;
            updateStepUI();
        } else if (currentStep === 3) {
            await processBookingConfirmation(false);
        }
    });

    // Back Button Click
    btnBack.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStepUI();
        }
    });

    function mostrarErroDeLinkInvalido() {
        alert("Este link de agendamento não é válido. Peça ao estúdio o link correto para agendar.");
    }
    window.mostrarErroDeLinkInvalido = mostrarErroDeLinkInvalido;

    // Open/Close Actions
    async function openBookingModal() {
        // Bloqueio imediato se o link não pertencer a um estúdio válido ou se não houver login
        const estudioId = await resolverEstudioIdDaPagina();
        if (!estudioId) {
            mostrarErroDeLinkInvalido();
            return;
        }

        window.estudioIdAtivoNoModal = estudioId;

        currentStep = 1;
        selectedBodyParts = [];
        isMultiTattoo = false;
        selectedLinks = [];
        selectedDate = null;
        selectedTimeSlot = null;
        
        if (inputName) inputName.value = '';
        if (inputPhone) inputPhone.value = '';
        if (inputEmail) inputEmail.value = '';
        if (multiTattooCheck) multiTattooCheck.checked = false;
        if (urlInput) {
            urlInput.value = '';
            urlInput.placeholder = 'Cole o link da imagem (ex: Pinterest, Instagram, etc.)...';
        }
        if (uploadPreviewsContainer) {
            uploadPreviewsContainer.style.display = 'none';
            uploadPreviewsContainer.innerHTML = '';
        }
        if (urlInputArea) urlInputArea.style.display = 'flex';
        
        calCurrentDate = new Date();
        
        renderBodyPartsOptions(loadedLocaisCorpo);
        updateStepUI();
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        try {
            await loadDynamicModalData();
        } catch (err) {
            console.warn("Aviso ao carregar dados dinâmicos do modal:", err);
        }
    }

    function closeBookingModal() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeBookingModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeBookingModal();
        }
    });

    window.openBookingModal = openBookingModal;
    window.closeBookingModal = closeBookingModal;

    // 5. Intercept Click on any Booking Links dynamically
    function initInterceptors() {
        document.querySelectorAll('a, button, .btn-open-booking').forEach(link => {
            if (link.dataset.bookingIntercepted) return;
            
            const href = link.getAttribute('href') || '';
            const text = (link.textContent || '').trim().toLowerCase();
            
            const isBooking = link.classList.contains('btn-open-booking') ||
                              text.includes('agendamento') || 
                              text.includes('agendar') ||
                              text.includes('agende') ||
                              href.includes('booking') || 
                              href.includes('agendamento');
                              
            if (isBooking) {
                link.dataset.bookingIntercepted = "true";
                if (link.tagName === 'A') {
                    link.setAttribute('href', '#');
                }
                link.style.cursor = 'pointer';
                
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openBookingModal();
                });
            }
        });
    }

    initInterceptors();
    setInterval(initInterceptors, 2000);

    // 6. Floating Support Chat Logic
    const chatWidgetButton = document.getElementById('chatWidgetButton');
    const chatWidgetWindow = document.getElementById('chatWidgetWindow');
    const chatWidgetClose = document.getElementById('chatWidgetClose');
    const chatWidgetSend = document.getElementById('chatWidgetSend');
    const chatWidgetInput = document.getElementById('chatWidgetInput');
    const WHATSAPP_NUMBER = "5547999999999";

    if (chatWidgetButton && chatWidgetWindow) {
        chatWidgetButton.addEventListener('click', () => {
            chatWidgetWindow.classList.toggle('active');
            if (chatWidgetWindow.classList.contains('active')) {
                chatWidgetInput.focus();
            }
        });

        chatWidgetClose.addEventListener('click', (e) => {
            e.stopPropagation();
            chatWidgetWindow.classList.remove('active');
        });

        chatWidgetInput.addEventListener('input', () => {
            chatWidgetInput.style.height = 'auto';
            chatWidgetInput.style.height = (chatWidgetInput.scrollHeight) + 'px';
        });

        function sendChatMessage() {
            const text = chatWidgetInput.value.trim();
            if (!text) return;

            const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');

            chatWidgetInput.value = '';
            chatWidgetInput.style.height = 'auto';
            chatWidgetWindow.classList.remove('active');
        }

        chatWidgetSend.addEventListener('click', sendChatMessage);
        chatWidgetInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }

})();

