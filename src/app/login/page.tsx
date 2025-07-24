'use client'

import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="p-10">
      <h1>Iniciá sesión</h1>
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Entrar con Google
      </button>
    </div>
  )
}
