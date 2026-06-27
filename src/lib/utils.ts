export type StatusDerivado = 'ativo' | 'vencendo' | 'vencido'

export function fmtMoeda(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function fmtData(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

export function diasParaVencer(dataRenovacao: string): number {
  const hoje = new Date()
  const renovacao = new Date(dataRenovacao + 'T12:00:00')
  return Math.floor((renovacao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

export function contratoStatusDerivado(dataRenovacao: string | null | undefined): StatusDerivado {
  if (!dataRenovacao) return 'ativo'
  const diff = diasParaVencer(dataRenovacao)
  if (diff < 0) return 'vencido'
  if (diff <= 30) return 'vencendo'
  return 'ativo'
}

export const STATUS_LABEL: Record<StatusDerivado, string> = {
  ativo:    'Ativo',
  vencendo: 'Vencendo',
  vencido:  'Vencido',
}

export const STATUS_CHIP: Record<StatusDerivado, { bg: string; color: string }> = {
  ativo:    { bg: '#E7F5EE', color: '#11704E' },
  vencendo: { bg: '#F7E8C8', color: '#9A6B12' },
  vencido:  { bg: '#FBE3DF', color: '#C0432E' },
}

export const STATUS_AVATAR: Record<StatusDerivado, { bg: string; color: string }> = {
  ativo:    { bg: '#E7F5EE', color: '#11704E' },
  vencendo: { bg: '#FBEED4', color: '#9A6B12' },
  vencido:  { bg: '#FDE0DB', color: '#C0432E' },
}
