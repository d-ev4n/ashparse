
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await registerUser(form)

      navigate('/login', {
        state: {
          message: 'Account created successfully. Please sign in.',
          username: form.username,
        },
      })
    } catch (err) {
      const data = err.response?.data
      const messages = data
        ? Object.values(data).flat().join(' ')
        : 'Unable to create account. Please try again.'

      setError(messages)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Ashparse<span className="text-muted-foreground">.</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Intelligent Web Scraping Platform
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold">Create your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start extracting useful data from websites.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { name: 'username', label: 'Username', type: 'text' },
            { name: 'email', label: 'Email address', type: 'email' },
            { name: 'password', label: 'Password', type: 'password' },
          ].map((field) => (
            <div key={field.name}>
              <label className="mb-2 block text-sm font-medium">
                {field.label}
              </label>
              <input
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                required
                minLength={field.name === 'password' ? 8 : undefined}
                autoComplete={
                  field.name === 'password'
                    ? 'new-password'
                    : field.name
                }
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-foreground"
                placeholder={`Enter your ${field.label.toLowerCase()}`}
              />
            </div>
          ))}

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-background transition hover:opacity-80 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
