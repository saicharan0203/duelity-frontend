// src/services/socket.ts
import { io, Socket } from 'socket.io-client'
import { getIdToken } from './firebase'

let socket: Socket | null = null

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket

  const token = await getIdToken()
  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
    auth: { token },
    transports: ['websocket'],
  })

  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
