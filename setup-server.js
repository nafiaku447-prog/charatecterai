import express from 'express';
import { CAINode } from 'cainode';
import * as fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Store for ongoing token generation processes
const tokenProcesses = new Map();

// API Routes

/**
 * POST /api/send-verification
 * Send verification email and start token generation process
 */
app.post('/api/send-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Email tidak valid' });
        }

        const cleanEmail = email.trim().toLowerCase();

        console.log(`📧 Sending verification email to: ${cleanEmail}`);

        const cai = new CAINode();

        // Store the CAI instance for this email
        tokenProcesses.set(cleanEmail, { cai, token: null, status: 'pending' });

        // Start token generation process (non-blocking)
        cai.generate_token_auto(
            cleanEmail,
            60, // 60 second timeout per attempt, will retry
            () => {
                console.log(`✅ Email sent to ${cleanEmail}`);
                const process = tokenProcesses.get(cleanEmail);
                if (process) {
                    process.status = 'email_sent';
                }
            },
            () => {
                console.log(`⏱️ Timeout for ${cleanEmail}`);
                const process = tokenProcesses.get(cleanEmail);
                if (process) {
                    process.status = 'timeout';
                }
            }
        )
            .then(token => {
                console.log(`✅ Token received for ${cleanEmail}`);
                const process = tokenProcesses.get(cleanEmail);
                if (process) {
                    process.token = token;
                    process.status = 'success';
                }
            })
            .catch(error => {
                console.error(`❌ Error for ${cleanEmail}:`, error.message);
                const process = tokenProcesses.get(cleanEmail);
                if (process) {
                    process.error = error.message;
                    process.status = 'error';
                }
            });

        res.json({
            success: true,
            message: 'Email verifikasi sedang dikirim',
            email: cleanEmail
        });

    } catch (error) {
        console.error('Error in send-verification:', error);
        res.status(500).json({
            error: error.message || 'Terjadi kesalahan saat mengirim email'
        });
    }
});

/**
 * POST /api/check-token
 * Check if token has been generated for the email
 */
app.post('/api/check-token', async (req, res) => {
    try {
        const { email } = req.body;
        const cleanEmail = email.trim().toLowerCase();

        const process = tokenProcesses.get(cleanEmail);

        if (!process) {
            return res.json({ token: null, status: 'not_found' });
        }

        if (process.token) {
            return res.json({
                token: process.token,
                status: 'success'
            });
        }

        if (process.status === 'error') {
            return res.status(400).json({
                error: process.error || 'Terjadi kesalahan',
                status: 'error'
            });
        }

        // Still waiting
        res.json({
            token: null,
            status: process.status
        });

    } catch (error) {
        console.error('Error in check-token:', error);
        res.status(500).json({
            error: error.message || 'Terjadi kesalahan'
        });
    }
});

/**
 * POST /api/save-config
 * Save token and character ID to server.js
 */
app.post('/api/save-config', async (req, res) => {
    try {
        const { token, characterId } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token tidak ditemukan' });
        }

        const finalCharId = characterId || 'bLiuXtB9qfccncuEsLhjU4__Rbsq0fBSWlouWQZFlWA';

        console.log(`💾 Saving config - CharID: ${finalCharId.substring(0, 20)}...`);

        // Read server.js
        const serverPath = path.join(__dirname, 'server.js');
        let serverContent = await fs.readFile(serverPath, 'utf-8');

        // Update CONFIG
        serverContent = serverContent.replace(
            /const CONFIG = \{[^}]*\}/s,
            `const CONFIG = {\n    token: '${token}',\n    characterId: '${finalCharId}',\n}`
        );

        // Write back
        await fs.writeFile(serverPath, serverContent, 'utf-8');

        console.log('✅ Configuration saved successfully!');

        res.json({
            success: true,
            message: 'Konfigurasi berhasil disimpan'
        });

    } catch (error) {
        console.error('Error in save-config:', error);
        res.status(500).json({
            error: error.message || 'Gagal menyimpan konfigurasi'
        });
    }
});

// Cleanup old processes every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [email, process] of tokenProcesses.entries()) {
        // Remove processes older than 10 minutes
        if (now - (process.startTime || 0) > 600000) {
            tokenProcesses.delete(email);
            console.log(`🗑️ Cleaned up old process for ${email}`);
        }
    }
}, 300000);

// Start server
app.listen(PORT, () => {
    console.log('🤖 ===== CHARACTER.AI SETUP SERVER =====');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📱 Open in browser: http://localhost:${PORT}`);
    console.log('=====================================\n');
});

export default app;
