export class LongTermMemory {
    
    getProfile(m) {
        let user = global.db.data.users[m.sender];
        if (!user) return null;
        if (!user.aiProfile) {
            user.aiProfile = {
                nickname: user.name || 'Teman',
                preferences: [],
                language: 'Indonesia'
            };
        }
        return user.aiProfile;
    }

    // Ekstraksi info untuk masa depan (bisa diintegrasikan dengan RAG/AI info extraction)
    // Saat ini sekadar menyimpan default
    updateProfile(m, newInfo) {
        let profile = this.getProfile(m);
        if (profile && newInfo) {
            Object.assign(profile, newInfo);
        }
    }

    getProfileContext(m) {
        let profile = this.getProfile(m);
        if (!profile) return '';
        
        let prefs = profile.preferences.length > 0 ? `Info User: ${profile.preferences.join(', ')}` : '';
        return `\n# DATA PENGGUNA\nNama Panggilan: ${profile.nickname}\nBahasa: ${profile.language}\n${prefs}`;
    }
}
