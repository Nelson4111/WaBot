let handler = m => m

handler.before = async function (m) {
    let user = global.db?.data?.users?.[m.sender]
    if (!user) return
    if (user.role === 'Premium user' && user.premiumTime < Date.now()) {
        user.role = 'Free user'
        user.premiumTime = 0
        user.premium = false
    }
}

export default handler
