'use client'
import { useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload, FileText, Trash2, ExternalLink, Loader2 } from 'lucide-react'

interface Arquivo {
  name: string
  signedUrl: string
  size: number
}

interface Props {
  contratoId: string
  userId: string
  pasta: 'contrato' | 'comprovantes'
  titulo: string
  descricao?: string
}

function fmtBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ArquivosSection({ contratoId, userId, pasta, titulo, descricao }: Props) {
  const [arquivos, setArquivos]   = useState<Arquivo[]>([])
  const [carregado, setCarregado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Bucket é PRIVADO — caminhos isolados por user_id (LGPD)
  const prefix = `${userId}/contratos/${contratoId}/${pasta}/`

  const carregarArquivos = useCallback(async () => {
    setCarregando(true)
    const { data, error } = await supabase.storage
      .from('arquivos')
      .list(prefix, { sortBy: { column: 'created_at', order: 'desc' } })

    if (error) {
      if (error.message.includes('Bucket not found')) {
        toast.error('Configure o bucket "arquivos" no Supabase (veja supabase/storage_arquivos.sql).')
      } else {
        toast.error('Erro ao carregar arquivos.')
      }
      setCarregando(false)
      return
    }

    const nomes = (data ?? [])
      .filter(f => f.name !== '.emptyFolderPlaceholder')
      .map(f => ({ name: f.name, size: f.metadata?.size ?? 0 }))

    if (nomes.length === 0) {
      setArquivos([])
      setCarregado(true)
      setCarregando(false)
      return
    }

    // URLs assinadas expiram em 1 hora — bucket privado, dados pessoais protegidos
    const { data: signed, error: signErr } = await supabase.storage
      .from('arquivos')
      .createSignedUrls(nomes.map(f => prefix + f.name), 3600)

    if (signErr) { toast.error('Erro ao gerar links.'); setCarregando(false); return }

    const lista: Arquivo[] = nomes.map((f, i) => ({
      name:      f.name,
      signedUrl: signed?.[i]?.signedUrl ?? '',
      size:      f.size,
    }))

    setArquivos(lista)
    setCarregado(true)
    setCarregando(false)
  }, [prefix])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) { toast.error('Arquivo muito grande. Máximo 20 MB.'); return }

    setUploading(true)
    const ext      = file.name.split('.').pop()
    const safeName = `${Date.now()}.${ext}`
    const path     = prefix + safeName

    const { error } = await supabase.storage.from('arquivos').upload(path, file)
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''

    if (error) { toast.error('Erro ao enviar arquivo: ' + error.message); return }
    toast.success('Arquivo enviado!')
    carregarArquivos()
  }

  async function handleDelete(name: string) {
    if (!confirm(`Excluir "${name}"?`)) return
    setDeleting(name)
    const { error } = await supabase.storage.from('arquivos').remove([prefix + name])
    setDeleting(null)
    if (error) { toast.error('Erro ao excluir arquivo.'); return }
    setArquivos(a => a.filter(f => f.name !== name))
    toast.success('Arquivo excluído.')
  }

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 13,
      border: '1px solid var(--card-border)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid var(--card-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {titulo}
          </p>
          {descricao && <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2 }}>{descricao}</p>}
        </div>
        <label style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: 'var(--primary-light)', color: 'var(--primary-700)',
          border: '1px solid var(--primary-tint)',
          opacity: uploading ? 0.6 : 1,
        }}>
          {uploading
            ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Enviando...</>
            : <><Upload size={14} /> Enviar arquivo</>
          }
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            disabled={uploading}
            onChange={handleUpload}
            onClick={() => { if (!carregado) carregarArquivos() }}
          />
        </label>
      </div>

      {/* Lista */}
      <div style={{ padding: '8px 0' }}>
        {carregando ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--muted-fg)' }} />
          </div>
        ) : !carregado ? (
          <button
            onClick={carregarArquivos}
            style={{
              display: 'block', width: '100%', padding: '20px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: 'var(--muted-fg)',
            }}
          >
            Clique para ver arquivos
          </button>
        ) : arquivos.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <FileText size={28} style={{ color: 'var(--muted-fg)', marginBottom: 8, opacity: 0.4 }} />
            <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>Nenhum arquivo enviado</p>
          </div>
        ) : arquivos.map(f => (
          <div key={f.name} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 20px',
            borderBottom: '1px solid var(--card-border)',
          }}>
            <FileText size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {f.name}
              </p>
              <p style={{ fontSize: 11, color: 'var(--muted-fg)' }}>{fmtBytes(f.size)}</p>
            </div>
            {f.signedUrl && (
              <a
                href={f.signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: '5px', color: 'var(--muted-fg)', display: 'flex' }}
                title="Abrir (link expira em 1h)"
              >
                <ExternalLink size={15} />
              </a>
            )}
            <button
              onClick={() => handleDelete(f.name)}
              disabled={deleting === f.name}
              style={{
                padding: '5px', background: 'none', border: 'none', cursor: 'pointer',
                color: '#F87171', display: 'flex', opacity: deleting === f.name ? 0.4 : 1,
              }}
              title="Excluir arquivo"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
