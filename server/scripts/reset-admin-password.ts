/**
 * Break-glass admin recovery. Sets a new password for an account (creating it
 * if it doesn't exist) and ensures it has role = 'admin' in public.profiles.
 *
 * Uses the service-role key from server/.env, so run it only from a trusted
 * machine — never ship it anywhere the browser can reach.
 *
 *   npm run admin:reset -- you@example.com 'a-new-strong-password'
 */
import { supabaseAdmin } from '../src/lib/supabaseAdmin.js'

const [email, password] = process.argv.slice(2)

if (!email || !password) {
  console.error("Usage: npm run admin:reset -- you@example.com 'new-password'")
  process.exit(1)
}
if (password.length < 8) {
  console.error('❌ Password must be at least 8 characters.')
  process.exit(1)
}

async function findUserByEmail(target: string) {
  const wanted = target.toLowerCase()
  for (let page = 1; ; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    const hit = data.users.find((u) => u.email?.toLowerCase() === wanted)
    if (hit) return hit
    if (data.users.length < 1000) return null
  }
}

async function main() {
  let user = await findUserByEmail(email)

  if (user) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    })
    if (error) throw error
    console.log(`✅ Password updated for ${email} (${user.id})`)
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) throw error
    user = data.user
    console.log(`✅ Created new user ${email} (${user.id})`)
  }

  // The signup trigger normally creates the profile row; upsert covers the
  // case where it didn't (e.g. user created before the trigger existed).
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: user.id, role: 'admin' }, { onConflict: 'id' })
  if (profileError) throw profileError

  console.log(`✅ ${email} now has role = 'admin'. Sign in at /login and open the admin dashboard.`)
}

main().catch((err) => {
  console.error('❌ Failed:', err?.message ?? err)
  process.exit(1)
})
