# 🤖 Character.AI Token Generator

Website modern untuk generate token Character.AI secara otomatis dengan interface yang mudah digunakan!

![Character.AI Token Generator](https://img.shields.io/badge/Character.AI-Token%20Generator-blueviolet?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

## ✨ Fitur

- 🌐 **Web Interface** - Setup melalui browser, tidak perlu command line
- 🎨 **Modern Design** - UI premium dengan animasi smooth dan gradient
- 🔄 **Auto Polling** - Real-time monitoring proses verifikasi
- ⚡ **Real-time Status** - Monitor proses setup secara langsung
- 📧 **Email Verification** - Generate token dengan verifikasi email otomatis
- 💾 **Copy to Clipboard** - Copy token dengan satu klik
- 📱 **Responsive Design** - Mobile-friendly

## 🖼️ Screenshots

### Step 1: Email Input
Masukkan email Character.AI yang sudah terdaftar

### Step 2: Verification
Tunggu verifikasi email (max 2 menit)

### Step 3: Token Display
Token langsung muncul dan bisa di-copy!

## 🚀 Instalasi

### Persyaratan
- Node.js v14 atau lebih baru
- Email terdaftar di [Character.AI](https://character.ai)
- Koneksi internet

### Cara Install

1. **Clone repository**
```bash
git clone https://github.com/YOUR_USERNAME/character-ai-token-generator.git
cd character-ai-token-generator
```

2. **Install dependencies**
```bash
npm install
```

3. **Jalankan server**
```bash
npm run setup
```

4. **Buka di browser**
```
http://localhost:3001
```

## 📖 Cara Penggunaan

1. **Masukkan Email** - Email yang terdaftar di Character.AI
2. **Cek Email** - Klik tombol verifikasi di email yang dikirim
3. **Copy Token** - Token otomatis muncul, tinggal klik "Copy Token"
4. **Selesai!** - Gunakan token untuk konfigurasi chatbot Anda

## 🎯 Cara Mendapatkan Character ID (Optional)

1. Buka [character.ai](https://character.ai)
2. Pilih character yang ingin digunakan
3. Lihat URL browser: `https://character.ai/chat/CHARACTER_ID_HERE`
4. Copy `CHARACTER_ID` dari URL

## 🛠️ Teknologi

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **API**: cainode (Character.AI Node.js wrapper)

## 📁 Struktur Project

```
├── public/
│   ├── index.html      # Web interface
│   ├── styles.css      # Premium styling
│   └── app.js          # Frontend logic
├── setup-server.js     # Backend API server
├── gettoken.js         # Legacy CLI version
├── package.json
└── README.md
```

## 🔧 Troubleshooting

### Email tidak diterima?
- Cek folder spam/junk
- Pastikan email sudah terdaftar di Character.AI
- Tunggu beberapa menit dan coba lagi

### Token gagal generate?
- Pastikan Anda klik tombol verifikasi di email dalam 2 menit
- Coba jalankan ulang setup: `npm run setup`
- Cek koneksi internet

### Server error?
- Pastikan port 3001 tidak digunakan aplikasi lain
- Restart server: `npm run setup`

### Copy token tidak berfungsi?
- Pastikan browser mendukung Clipboard API
- Coba browser modern (Chrome, Firefox, Edge)
- Atau select manual dan copy (`Ctrl+C`)

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

MIT License - bebas digunakan untuk project pribadi atau komersial

## 💡 Tips

- Gunakan Character ID dari character favorit Anda
- Token akan expired setelah beberapa waktu, generate ulang jika perlu
- Interface web lebih mudah daripada command line
- Setup hanya perlu dilakukan sekali per character

## 🌟 Support

Jika project ini membantu Anda, berikan ⭐ di GitHub!

---

**Made with ❤️ for Character.AI Community**

Selamat menggunakan! 🎉
