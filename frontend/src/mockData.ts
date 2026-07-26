export const MOCK_PRS: Record<string, any[]> = {
  'facebook/react': [
    { id: 101, number: 101, title: 'refactor: Rewrite authentication hook flow', state: 'open', created_at: '2026-07-25T14:32:00Z', user: { login: 'gaearon', avatar_url: 'https://github.com/gaearon.png' } },
    { id: 102, number: 102, title: 'feat: Add real-time visual code canvas', state: 'open', created_at: '2026-07-24T09:15:00Z', user: { login: 'acdlite', avatar_url: 'https://github.com/acdlite.png' } },
    { id: 103, number: 103, title: 'fix: Resolve web socket reconnection leak', state: 'closed', created_at: '2026-07-23T11:05:00Z', user: { login: 'bvaughn', avatar_url: 'https://github.com/bvaughn.png' } },
    { id: 104, number: 104, title: 'chore: Setup docker deployment workflow', state: 'closed', created_at: '2026-07-22T17:40:00Z', user: { login: 'sebmarkbage', avatar_url: 'https://github.com/sebmarkbage.png' } }
  ],
  'vercel/next.js': [
    { id: 201, number: 201, title: 'feat: Implement Partial Prerendering (PPR) engine', state: 'open', created_at: '2026-07-26T10:00:00Z', user: { login: 'huozhi', avatar_url: 'https://github.com/huozhi.png' } },
    { id: 202, number: 202, title: 'fix: Fix server-side action race condition', state: 'open', created_at: '2026-07-25T18:30:00Z', user: { login: 'timneutkens', avatar_url: 'https://github.com/timneutkens.png' } },
    { id: 203, number: 203, title: 'perf: Speed up turbopack bundle resolution', state: 'closed', created_at: '2026-07-24T12:00:00Z', user: { login: 'sokra', avatar_url: 'https://github.com/sokra.png' } }
  ],
  'tailwindlabs/tailwindcss': [
    { id: 301, number: 301, title: 'feat: Add support for native container queries', state: 'open', created_at: '2026-07-26T15:20:00Z', user: { login: 'adamwathan', avatar_url: 'https://github.com/adamwathan.png' } },
    { id: 302, number: 302, title: 'fix: Resolve utility class matching in nested html', state: 'closed', created_at: '2026-07-24T08:12:00Z', user: { login: 'reinink', avatar_url: 'https://github.com/reinink.png' } }
  ]
};

export const DEFAULT_MOCK_PRS = [
  { id: 991, number: 991, title: 'feat: Integrate DB analytics engine', state: 'open', created_at: '2026-07-26T22:00:00Z', user: { login: 'developer-one', avatar_url: '' } },
  { id: 992, number: 992, title: 'refactor: Polished layout and animations', state: 'closed', created_at: '2026-07-25T14:00:00Z', user: { login: 'developer-two', avatar_url: '' } }
];

export interface DiffLine {
  type: 'normal' | 'addition' | 'deletion';
  lineNum: number;
  content: string;
}

export interface PRDiff {
  filename: string;
  diff: DiffLine[];
}

export const MOCK_DIFFS: Record<string, PRDiff> = {
  '101': {
    filename: 'src/hooks/useAuth.ts',
    diff: [
      { type: 'normal', lineNum: 1, content: "import { useState, useEffect } from 'react';" },
      { type: 'normal', lineNum: 2, content: "import { useDispatch } from 'react-redux';" },
      { type: 'deletion', lineNum: 3, content: "-const API_ENDPOINT = 'http://localhost:3000/auth';" },
      { type: 'addition', lineNum: 4, content: "+const API_ENDPOINT = import.meta.env.VITE_AUTH_API || '/api/auth';" },
      { type: 'normal', lineNum: 5, content: "export function useAuth() {" },
      { type: 'normal', lineNum: 6, content: "  const [user, setUser] = useState<any>(null);" },
      { type: 'normal', lineNum: 7, content: "  const [loading, setLoading] = useState(true);" },
      { type: 'addition', lineNum: 8, content: "+  const dispatch = useDispatch();" },
      { type: 'normal', lineNum: 9, content: "  useEffect(() => {" },
      { type: 'deletion', lineNum: 10, content: "-    fetch(API_ENDPOINT).then(res => res.json()).then(data => {" },
      { type: 'addition', lineNum: 11, content: "+    const token = localStorage.getItem('auth_token');" },
      { type: 'addition', lineNum: 12, content: "+    if (!token) { setLoading(false); return; }" },
      { type: 'addition', lineNum: 13, content: "+    fetch(API_ENDPOINT, { headers: { Authorization: `Bearer ${token}` } })" },
      { type: 'addition', lineNum: 14, content: "+      .then(res => res.json())" },
      { type: 'addition', lineNum: 15, content: "+      .then(data => {" },
      { type: 'normal', lineNum: 16, content: "        setUser(data.user);" },
      { type: 'normal', lineNum: 17, content: "        setLoading(false);" },
      { type: 'normal', lineNum: 18, content: "      });" },
      { type: 'normal', lineNum: 19, content: "  }, []);" },
      { type: 'normal', lineNum: 20, content: "  return { user, loading };" },
      { type: 'normal', lineNum: 21, content: "}" }
    ]
  },
  '102': {
    filename: 'src/components/Canvas.tsx',
    diff: [
      { type: 'normal', lineNum: 1, content: "import React, { useRef, useEffect } from 'react';" },
      { type: 'addition', lineNum: 2, content: "+import { socket } from '../socket';" },
      { type: 'normal', lineNum: 3, content: "export const Canvas = () => {" },
      { type: 'normal', lineNum: 4, content: "  const canvasRef = useRef<HTMLCanvasElement>(null);" },
      { type: 'addition', lineNum: 5, content: "+  useEffect(() => {" },
      { type: 'addition', lineNum: 6, content: "+    const canvas = canvasRef.current;" },
      { type: 'addition', lineNum: 7, content: "+    if (!canvas) return;" },
      { type: 'addition', lineNum: 8, content: "+    const ctx = canvas.getContext('2d');" },
      { type: 'addition', lineNum: 9, content: "+    socket.on('draw_line', ({ x0, y0, x1, y1 }) => {" },
      { type: 'addition', lineNum: 10, content: "+      ctx?.beginPath();" },
      { type: 'addition', lineNum: 11, content: "+      ctx?.moveTo(x0, y0);" },
      { type: 'addition', lineNum: 12, content: "+      ctx?.lineTo(x1, y1);" },
      { type: 'addition', lineNum: 13, content: "+      ctx?.stroke();" },
      { type: 'addition', lineNum: 14, content: "+    });" },
      { type: 'addition', lineNum: 15, content: "+  }, []);" },
      { type: 'normal', lineNum: 16, content: "  return <canvas ref={canvasRef} width={800} height={600} />;" },
      { type: 'normal', lineNum: 17, content: "};" }
    ]
  },
  '201': {
    filename: 'packages/next/src/server/ppr.ts',
    diff: [
      { type: 'normal', lineNum: 1, content: "export function compilePPR(manifest: any) {" },
      { type: 'normal', lineNum: 2, content: "  console.log('Compiling Partial Prerendering static manifest');" },
      { type: 'addition', lineNum: 3, content: "+  // Support route dynamic bailout triggers" },
      { type: 'addition', lineNum: 4, content: "+  if (manifest.hasDynamicBailout) {" },
      { type: 'addition', lineNum: 5, content: "+    return renderDynamicStream(manifest);" },
      { type: 'addition', lineNum: 6, content: "+  }" },
      { type: 'normal', lineNum: 7, content: "  return renderStaticHTML(manifest);" },
      { type: 'normal', lineNum: 8, content: "}" }
    ]
  },
  '301': {
    filename: 'src/plugins/containerQueries.js',
    diff: [
      { type: 'normal', lineNum: 1, content: "const plugin = require('tailwindcss/plugin');" },
      { type: 'addition', lineNum: 2, content: "+module.exports = plugin(function({ matchUtilities, theme }) {" },
      { type: 'addition', lineNum: 3, content: "+  matchUtilities(" },
      { type: 'addition', lineNum: 4, content: "+    { '@': (value) => ({ 'container-type': value }) }," },
      { type: 'addition', lineNum: 5, content: "+    { values: theme('containerTypes') }" },
      { type: 'addition', lineNum: 6, content: "+  );" },
      { type: 'addition', lineNum: 7, content: "+});" }
    ]
  }
};

export const DEFAULT_DIFF: PRDiff = {
  filename: 'src/index.ts',
  diff: [
    { type: 'normal', lineNum: 1, content: "console.log('Welcome to DevPulse Workspace');" },
    { type: 'deletion', lineNum: 2, content: "-const initialSetup = false;" },
    { type: 'addition', lineNum: 3, content: "+const initialSetup = true;" },
    { type: 'addition', lineNum: 4, content: "+console.log('Workspace database metrics initialised');" },
    { type: 'normal', lineNum: 5, content: "export default initialSetup;" }
  ]
};
