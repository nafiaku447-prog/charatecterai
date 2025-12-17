import { CAINode } from 'cainode';
import * as fs from 'fs';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function autoSetup() {
    console.log('\n🤖 ===== CHATBOT AUTO SETUP =====\n');
    console.log('Script ini akan:');
    console.log('1. Generate token Character.AI');
    console.log('2. Update server.js secara otomatis');
    console.log('3. Siap pakai!\n');

    try {
        // Minta email
        const email = await question('📧 Email Character.AI Anda: ');

        if (!email || !email.trim().includes('@')) {
            console.log('❌ Email tidak valid!');
            rl.close();
            return;
        }

        const cleanEmail = email.trim().toLowerCase();

        console.log('\n⏳ Mengirim email verifikasi...');
        console.log('📨 Cek inbox Anda dan klik tombol verifikasi!');
        console.log('⏰ Menunggu verifikasi... (max 2 menit)\n');

        const cai = new CAINode();

        let token;
        try {
            // Generate token
            token = await cai.generate_token_auto(
                cleanEmail,
                60,
                () => {
                    console.log('✅ Email terkirim! Silakan klik tombol di email.');
                    console.log('⏰ Menunggu klik verifikasi...');
                },
                () => {
                    console.log('⏱️  Timeout! Tidak ada klik verifikasi dalam 2 menit.');
                    console.log('💡 Coba jalankan ulang: npm run setup\n');
                }
            );
        } catch (emailError) {
            console.log('\n❌ Error:', emailError.message);

            if (emailError.message.includes('correct email')) {
                console.log('\n💡 Email belum terdaftar di Character.AI!');
                console.log('   Silakan:');
                console.log('   1. Daftar di https://character.ai (gratis!)');
                console.log('   2. Atau gunakan email yang sudah terdaftar');
                console.log('   3. Jalankan ulang: npm run setup\n');
            } else {
                console.log('\n💡 Troubleshooting:');
                console.log('   - Cek koneksi internet');
                console.log('   - Coba beberapa saat lagi');
                console.log('   - Atau lihat PANDUAN_TOKEN.md untuk cara manual\n');
            }

            rl.close();
            return;
        }

        if (!token) {
            console.log('❌ Gagal mendapat token. Coba lagi!');
            rl.close();
            return;
        }

        console.log('\n✅ Token berhasil didapat!');

        // Tanya character ID (optional)
        console.log('\n📝 Character ID (tekan Enter untuk pakai default):');
        const charId = await question('Character ID: ');

        const finalCharId = charId.trim() || 'bLiuXtB9qfccncuEsLhjU4__Rbsq0fBSWlouWQZFlWA';

        // Read server.js
        const serverPath = './server.js';
        let serverContent = await fs.promises.readFile(serverPath, 'utf-8');

        // Update CONFIG
        serverContent = serverContent.replace(
            /const CONFIG = \{[^}]*\}/s,
            `const CONFIG = {
    token: '${token}',
    characterId: '${finalCharId}',
}`
        );

        // Write back
        await fs.promises.writeFile(serverPath, serverContent, 'utf-8');

        console.log('\n🎉 ===== SETUP SELESAI! =====\n');
        console.log('✅ Token berhasil disimpan ke server.js');
        console.log('\n📝 Langkah terakhir:');
        console.log('1. Jalankan: node server.js');
        console.log('2. Buka: http://localhost:3000');
        console.log('3. Mulai chat dengan AI!\n');

    } catch (error) {
        console.log('\n❌ Unexpected Error:', error.message);
        console.log('\n💡 Silakan lihat PANDUAN_TOKEN.md untuk cara manual\n');
    } finally {
        rl.close();
    }
}

autoSetup();
