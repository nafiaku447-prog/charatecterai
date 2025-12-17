// State management
let currentStep = 1;
let userEmail = '';
let token = '';
let timerInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🤖 Character.AI Token Generator initialized');

    // Add event listener for email input Enter key
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendVerification();
            }
        });
    }
});

// Show status message
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message show ${type}`;

    setTimeout(() => {
        statusEl.classList.remove('show');
    }, 5000);
}

// Navigate to step
function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => {
        el.classList.remove('active');
    });

    // Update step indicators
    document.querySelectorAll('.step').forEach((el, index) => {
        el.classList.remove('active', 'completed');
        if (index + 1 < step) {
            el.classList.add('completed');
        } else if (index + 1 === step) {
            el.classList.add('active');
        }
    });

    // Show current step
    const stepEl = document.getElementById(`step${step}`);
    if (stepEl) {
        stepEl.classList.add('active');
    }

    currentStep = step;
}

// Send verification email
async function sendVerification() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim().toLowerCase();

    // Validate email
    if (!email || !email.includes('@')) {
        showStatus('❌ Email tidak valid!', 'error');
        emailInput.focus();
        return;
    }

    userEmail = email;

    try {
        // Show loading
        showStatus('⏳ Mengirim email verifikasi...', 'info');

        // Call API
        const response = await fetch('/api/send-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Gagal mengirim email');
        }

        if (data.error) {
            throw new Error(data.error);
        }

        // Move to step 2
        goToStep(2);
        document.getElementById('emailDisplay').textContent = email;

        // Start timer
        startTimer(120);

        // Start polling for token
        pollForToken();

    } catch (error) {
        console.error('Error:', error);

        if (error.message.includes('correct email')) {
            showStatus('❌ Email belum terdaftar di Character.AI! Silakan daftar dulu di character.ai', 'error');
        } else if (error.message.includes('Cloudflare') || error.message.includes('SyntaxError')) {
            showStatus('⚠️ Server sibuk. Silakan coba beberapa saat lagi atau gunakan cara manual.', 'error');
        } else {
            showStatus(`❌ Error: ${error.message}`, 'error');
        }
    }
}

// Start countdown timer
function startTimer(seconds) {
    let remaining = seconds;
    const timerEl = document.getElementById('timer');

    // Clear existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
        remaining--;
        timerEl.textContent = `${remaining}s`;

        if (remaining <= 0) {
            clearInterval(timerInterval);
            showStatus('⏱️ Waktu habis! Silakan coba lagi.', 'error');
            setTimeout(() => {
                goToStep(1);
            }, 2000);
        }
    }, 1000);
}

// Poll for token
async function pollForToken() {
    const maxAttempts = 24; // 2 minutes with 5s interval
    let attempts = 0;

    const poll = async () => {
        if (attempts >= maxAttempts) {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            showStatus('⏱️ Timeout! Tidak ada verifikasi dalam 2 menit.', 'error');
            setTimeout(() => {
                goToStep(1);
            }, 2000);
            return;
        }

        try {
            const response = await fetch('/api/check-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: userEmail })
            });

            const data = await response.json();

            if (data.token) {
                // Success!
                token = data.token;

                if (timerInterval) {
                    clearInterval(timerInterval);
                }

                showStatus('✅ Token berhasil didapat!', 'success');

                // Display token
                displayToken(token);

                setTimeout(() => {
                    goToStep(3);
                }, 1000);

                return;
            }

            // Continue polling
            attempts++;
            setTimeout(poll, 5000);

        } catch (error) {
            console.error('Polling error:', error);
            attempts++;
            setTimeout(poll, 5000);
        }
    };

    // Start polling
    poll();
}

// Display token in step 3
function displayToken(tokenValue) {
    const tokenDisplay = document.getElementById('tokenDisplay');
    tokenDisplay.textContent = tokenValue;
}

// Copy token to clipboard - FIXED VERSION
function copyToken(event) {
    const tokenDisplay = document.getElementById('tokenDisplay');
    const tokenText = tokenDisplay.textContent;

    // Check if token exists
    if (!tokenText || tokenText === 'Token akan muncul di sini...') {
        showStatus('❌ Tidak ada token untuk di-copy', 'error');
        return;
    }

    // Get button element
    const btn = event ? event.target : document.querySelector('.btn-copy');

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tokenText)
            .then(() => {
                showStatus('✅ Token berhasil di-copy!', 'success');

                // Update button
                if (btn) {
                    const originalHTML = btn.innerHTML;
                    const originalBg = btn.style.background;

                    btn.innerHTML = '✅ Copied!';
                    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.style.background = originalBg;
                    }, 2500);
                }
            })
            .catch(err => {
                console.error('Clipboard API failed:', err);
                // Fallback to older method
                fallbackCopyTextToClipboard(tokenText, btn);
            });
    } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(tokenText, btn);
    }
}

// Fallback copy function for older browsers
function fallbackCopyTextToClipboard(text, btn) {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Make it invisible
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showStatus('✅ Token berhasil di-copy!', 'success');

            // Update button
            if (btn) {
                const originalHTML = btn.innerHTML;
                const originalBg = btn.style.background;

                btn.innerHTML = '✅ Copied!';
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = originalBg;
                }, 2500);
            }
        } else {
            showStatus('❌ Gagal copy token. Silakan copy manual.', 'error');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showStatus('❌ Gagal copy token. Silakan copy manual dengan select.', 'error');
    }

    document.body.removeChild(textArea);
}

// Start over
function startOver() {
    userEmail = '';
    token = '';

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    document.getElementById('email').value = '';
    document.getElementById('tokenDisplay').textContent = '';

    goToStep(1);
}
