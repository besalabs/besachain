'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { TokenIcon } from '@/components/common/TokenIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { TOKENS, type Token } from '@/lib/config/chains'
import { useTokenBalance } from '@/hooks/useTokenBalance'

interface TokenSelectorProps {
  selectedToken: Token
  onSelect: (token: Token) => void
  excludeToken?: Token
}

export function TokenSelector({ selectedToken, onSelect, excludeToken }: TokenSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const tokens = useMemo(() => Object.values(TOKENS), [])
  const filteredTokens = useMemo(() => {
    return tokens.filter(
      (token) =>
        token.symbol !== excludeToken?.symbol &&
        (token.symbol.toLowerCase().includes(search.toLowerCase()) ||
          token.name.toLowerCase().includes(search.toLowerCase()))
    )
  }, [tokens, excludeToken, search])

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 h-auto rounded-xl"
      >
        <TokenIcon symbol={selectedToken.symbol} size="sm" />
        <span className="font-semibold">{selectedToken.symbol}</span>
        <ChevronDown className="w-4 h-4 text-white/60" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Token</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search by name or symbol"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredTokens.map((token) => (
                <TokenListItem
                  key={token.symbol}
                  token={token}
                  onClick={() => {
                    onSelect(token)
                    setOpen(false)
                    setSearch('')
                  }}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function TokenListItem({ token, onClick }: { token: Token; onClick: () => void }) {
  const { balance } = useTokenBalance(token.address)

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-3">
        <TokenIcon symbol={token.symbol} size="md" />
        <div className="text-left">
          <p className="font-medium text-white">{token.symbol}</p>
          <p className="text-sm text-white/60">{token.name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-white">{Number(balance).toFixed(4)}</p>
        <p className="text-sm text-white/60">Balance</p>
      </div>
    </button>
  )
}
