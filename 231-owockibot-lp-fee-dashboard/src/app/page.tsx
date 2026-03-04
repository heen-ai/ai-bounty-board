'use client'
import { useState, useEffect } from 'react'

const FEE_LOCKER = '0xF3622742b1E446D92e45E22923Ef11C2fcD55D68'
const FEE_OWNER = '0x26B7805Dd8aEc26DA55fc8e0c659cf6822b740Be'
const OWOCKI_TOKEN = '0xfDC933Ff4e2980d18beCF48e4E030d8463A2Bb07'
const WETH = '0x4200000000000000000000000000000000000006'
const BLOCKSCOUT = 'https://base.blockscout.com/api/v2'
const RPC = 'https://1rpc.io/base'

interface ClaimEvent {
  timestamp: string
  amount: string
  symbol: string
  txHash: string
  from: string
}

interface FeeData {
  claimableWETH: string
  claimableToken: string
  claims: ClaimEvent[]
  loading: boolean
  error: string | null
}

function formatAddr(a: string) { return a.slice(0,6) + '...' + a.slice(-4) }
function formatVal(v: string, d: number = 18) {
  const n = parseFloat(v) / Math.pow(10, d)
  if (n === 0) return '0.00'
  if (n < 0.0001) return n.toExponential(2)
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 })
}
function timeAgo(ts: string) {
  const d = Date.now() - new Date(ts).getTime()
  if (d < 3600000) return `${Math.floor(d/60000)}m ago`
  if (d < 86400000) return `${Math.floor(d/3600000)}h ago`
  return `${Math.floor(d/86400000)}d ago`
}

async function rpcCall(to: string, data: string): Promise<string> {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_call', params: [{ to, data }, 'latest'], id: 1 })
  })
  const json = await res.json()
  return json.result || '0x0'
}

// availableFees(address,address) = 0xd4fac45d + feeOwner + token
function encodeAvailableFees(feeOwner: string, token: string): string {
  const fn = '0xd4fac45d'
  const owner = feeOwner.slice(2).toLowerCase().padStart(64, '0')
  const tok = token.slice(2).toLowerCase().padStart(64, '0')
  return fn + owner + tok
}

export default function Dashboard() {
  const [data, setData] = useState<FeeData>({
    claimableWETH: '0', claimableToken: '0', claims: [], loading: true, error: null
  })

  useEffect(() => {
    async function load() {
      try {
        // Fetch claimable fees via RPC
        const [wethHex, tokenHex] = await Promise.all([
          rpcCall(FEE_LOCKER, encodeAvailableFees(FEE_OWNER, WETH)),
          rpcCall(FEE_LOCKER, encodeAvailableFees(FEE_OWNER, OWOCKI_TOKEN))
        ])

        const claimableWETH = (parseInt(wethHex, 16) / 1e18).toFixed(6)
        const claimableToken = (parseInt(tokenHex, 16) / 1e18).toFixed(2)

        // Fetch historical claims from Blockscout
        const claimsRes = await fetch(
          `${BLOCKSCOUT}/addresses/${FEE_OWNER}/token-transfers?type=ERC-20&filter=to`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        )
        const claimsData = await claimsRes.json()
        const items = claimsData.items || []

        // Filter for claims from FeeLocker or PoolManager
        const claims: ClaimEvent[] = items
          .filter((tx: any) => {
            const fromAddr = tx.from?.hash?.toLowerCase() || ''
            return fromAddr === FEE_LOCKER.toLowerCase() ||
                   fromAddr === '0x498581ff718922c3f8e6a244956af099b2652b2b' // Uniswap V4 PoolManager
          })
          .map((tx: any) => ({
            timestamp: tx.timestamp,
            amount: formatVal(tx.total?.value || '0', parseInt(tx.token?.decimals || '18')),
            symbol: tx.token?.symbol || '?',
            txHash: tx.transaction_hash,
            from: tx.from?.hash
          }))

        setData({ claimableWETH, claimableToken, claims, loading: false, error: null })
      } catch (err: any) {
        setData(prev => ({ ...prev, loading: false, error: err.message }))
      }
    }
    load()
  }, [])

  const weth = parseFloat(data.claimableWETH)
  const token = parseFloat(data.claimableToken)
  const totalWETH = weth
  const wethPct = totalWETH > 0 ? ((weth / (weth + (token > 0 ? 0.001 : 0))) * 100) : 100
  const wethClaims = data.claims.filter(c => c.symbol === 'WETH')
  const tokenClaims = data.claims.filter(c => c.symbol === 'owockibot')
  const totalClaimedWETH = wethClaims.reduce((s, c) => s + parseFloat(c.amount), 0)
  const totalClaimedToken = tokenClaims.reduce((s, c) => s + parseFloat(c.amount), 0)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xl">🤖</div>
              <div>
                <h1 className="text-xl font-bold text-white">owockibot LP Fee Dashboard</h1>
                <p className="text-xs text-slate-400">Base Mainnet</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-slate-400">Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Fees Overview + Fee Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">📊 Fees Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Claimable WETH</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {data.loading ? '...' : `Ξ ${data.claimableWETH}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Claimable owockibot</span>
                <span className="text-2xl font-bold text-blue-400">
                  {data.loading ? '...' : `${parseFloat(data.claimableToken).toLocaleString()} owockibot`}
                </span>
              </div>
              <div className="border-t border-slate-700 pt-4 mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Fee Owner</span>
                  <a href={`https://basescan.org/address/${FEE_OWNER}`} target="_blank" className="text-xs bg-slate-700 px-2 py-1 rounded text-blue-400 hover:underline font-mono">
                    {formatAddr(FEE_OWNER)}
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Claimed WETH</span>
                  <span className="text-sm text-emerald-300">Ξ {totalClaimedWETH.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Claimed Token</span>
                  <span className="text-sm text-blue-300">{totalClaimedToken.toLocaleString(undefined, {maximumFractionDigits: 0})} owockibot</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">💰 Fee Split</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400 flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full" />WETH
                  </span>
                  <span className="text-slate-200 font-mono">{data.loading ? '...' : `${wethPct.toFixed(2)}%`}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full transition-all duration-500" style={{width: `${wethPct}%`}} />
                </div>
                <p className="text-right text-sm text-slate-500 mt-1">Ξ {data.claimableWETH}</p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400 flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full" />owockibot
                  </span>
                  <span className="text-slate-200 font-mono">{data.loading ? '...' : `${(100 - wethPct).toFixed(2)}%`}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full transition-all duration-500" style={{width: `${100-wethPct}%`}} />
                </div>
                <p className="text-right text-sm text-slate-500 mt-1">{parseFloat(data.claimableToken).toLocaleString()} owockibot</p>
              </div>
              <div className="border-t border-slate-700 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Claimable</span>
                  <span className="text-xl font-bold text-white">
                    Ξ {data.claimableWETH} + {parseFloat(data.claimableToken).toLocaleString()} owockibot
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Historical Claims + Pool Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">📜 Historical Claims ({data.claims.length})</h3>
            {data.loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-12 bg-slate-700 rounded" />
                <div className="h-12 bg-slate-700 rounded" />
                <div className="h-12 bg-slate-700 rounded" />
              </div>
            ) : data.claims.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No claims found for this address</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {data.claims.map((claim, i) => (
                  <a key={i} href={`https://basescan.org/tx/${claim.txHash}`} target="_blank"
                     className="block p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className={`font-bold ${claim.symbol === 'WETH' ? 'text-emerald-400' : 'text-blue-400'}`}>
                          {claim.symbol === 'WETH' ? 'Ξ ' : ''}{claim.amount} {claim.symbol}
                        </span>
                        <span className="text-xs text-slate-500 ml-2">
                          from {claim.from?.toLowerCase() === FEE_LOCKER.toLowerCase() ? 'FeeLocker' : 'PoolManager'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{timeAgo(claim.timestamp)}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 font-mono">{claim.txHash.slice(0, 20)}...</div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">🏊 Pool Statistics</h3>
            <div className="space-y-4">
              <div className="border-b border-slate-700 pb-4">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Token Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Token Address</p>
                    <a href={`https://basescan.org/token/${OWOCKI_TOKEN}`} target="_blank" className="text-blue-400 hover:underline text-sm font-mono">
                      {formatAddr(OWOCKI_TOKEN)}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Symbol</p>
                    <p className="text-slate-200">owockibot</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Decimals</p>
                    <p className="text-slate-200">18</p>
                  </div>
                </div>
              </div>
              <div className="border-b border-slate-700 pb-4">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Contract Addresses</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Fee Locker (Fee Splitter)</p>
                    <a href={`https://basescan.org/address/${FEE_LOCKER}`} target="_blank" className="text-blue-400 hover:underline text-sm font-mono">
                      {formatAddr(FEE_LOCKER)}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">LP Locker</p>
                    <a href="https://basescan.org/address/0x63D2DfEA64b3433F4071A98665bcD7Ca14d93496" target="_blank" className="text-blue-400 hover:underline text-sm font-mono">
                      0x63D2...3496
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3">External Resources</h4>
                <div className="grid grid-cols-2 gap-2">
                  <a href={`https://dexscreener.com/base/${OWOCKI_TOKEN}`} target="_blank"
                     className="text-center px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-200 transition-colors">
                    📊 DexScreener
                  </a>
                  <a href={`https://basescan.org/token/${OWOCKI_TOKEN}`} target="_blank"
                     className="text-center px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-200 transition-colors">
                    🔍 Basescan
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-slate-500">
          <p>Data sourced from <a href="https://basescan.org" target="_blank" className="text-blue-400 hover:underline">Basescan</a> and Base mainnet RPC</p>
          <p className="mt-1">Built with Next.js + viem + Blockscout API</p>
        </footer>
      </main>
    </div>
  )
}
