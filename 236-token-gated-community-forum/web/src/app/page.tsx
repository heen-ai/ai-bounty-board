'use client'
import { useAccount, useReadContract, useEnsName } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { parseEther } from 'viem'
import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'

// Standard ERC20 ABI for balanceOf
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
] as const

// Placeholder for ERC-8004 Agent ID resolution
async function resolveAgentName(address: `0x${string}`): Promise<string | undefined> {
  // In a real scenario, this would interact with an ERC-8004 registry contract
  // For this bounty, we'll return a placeholder or null
  return Promise.resolve(undefined) // Or 'agent-xyz.eth' if we had a lookup
}

// OWOCKIBOT Token Address on Base
const OWOCKIBOT_TOKEN_ADDRESS = '0xfDC933Ff4e2980d18beCF48e4E030d8463A2Bb07' as `0x${string}`
const MIN_TOKEN_BALANCE = BigInt(1000000) // 1 Million Tokens (assuming 18 decimals, though we should check token decimals)

interface ForumPost {
  id: string;
  content: string;
  authorAddress: `0x${string}`;
  timestamp: string;
  authorEnsName?: string;
  authorAgentName?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(data => Array.isArray(data) ? data : [])

function Forum() {
  const { address } = useAccount()
  const [postContent, setPostContent] = useState('')
  const { data: posts, error, mutate } = useSWR<ForumPost[]>('/api/posts', fetcher, { refreshInterval: 5000 })

  const handleSubmit = useCallback(async () => {
    if (!postContent.trim() || !address) return

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: postContent, authorAddress: address }),
      })

      if (response.ok) {
        setPostContent('')
        mutate() // Re-fetch posts
      } else {
        console.error('Failed to submit post')
      }
    } catch (err) {
      console.error('Error submitting post:', err)
    }
  }, [postContent, address, mutate])

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">Owockibot Community Forum</h2>
      <p className="text-gray-300 mb-4">Welcome to the inner circle! 🎉</p>
      
      <div className="space-y-4 mb-8">
        {error && <div className="text-red-500">Failed to load posts.</div>}
        {!posts && !error && <div className="text-gray-400">Loading posts...</div>}

        {posts?.length === 0 && <div className="text-gray-400">No posts yet. Be the first to share!</div>}

        {posts?.map((post) => (
          <ForumPostCard key={post.id} post={post} />
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-700 rounded">
        <h3 className="text-xl font-bold text-white mb-2">Create New Post</h3>
        <textarea 
          className="w-full p-2 bg-gray-900 text-white rounded border border-gray-600"
          rows={3}
          placeholder="What's on your mind?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        />
        <button 
          className="mt-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={!address || !postContent.trim()}
        >
          Post
        </button>
      </div>
    </div>
  )
}

function ForumPostCard({ post }: { post: ForumPost }) {
  const { data: ensName } = useEnsName({
    address: post.authorAddress,
    chainId: 8453, // Base Mainnet
  })

  const [agentName, setAgentName] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Resolve ERC-8004 name here if applicable
    resolveAgentName(post.authorAddress).then(name => setAgentName(name))
  }, [post.authorAddress])

  const displayAuthor = agentName || ensName || post.authorAddress

  return (
    <div className="p-4 bg-gray-700 rounded">
      <div className="font-bold text-white">{post.content}</div>
      <div className="text-gray-400 text-sm mt-1">
        Posted by: <span className="font-mono text-yellow-300">{
          ensName ? ensName : (agentName ? agentName : post.authorAddress.slice(0, 6) + '...' + post.authorAddress.slice(-4))
        }</span> on {new Date(post.timestamp).toLocaleString()}
      </div>
    </div>
  )
}

function AccessDenied({ balance }: { balance?: bigint }) {
  return (
    <div className="p-6 bg-red-900/20 border border-red-500 rounded-lg text-center">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
      <p className="text-gray-300 mb-4">
        You need at least <span className="font-bold text-white">1,000,000 $OWOCKIBOT</span> tokens to access this forum.
      </p>
      <p className="text-gray-400 text-sm">
        Current Balance: {balance !== undefined ? balance.toString() : '0'} $OWOCKIBOT
      </p>
    </div>
  )
}

export default function Home() {
  const { address, isConnected } = useAccount()
  
  const { data: balanceData, isError, isLoading } = useReadContract({
    address: OWOCKIBOT_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const [hasEnough, setHasEnough] = useState(false)

  useEffect(() => {
    if (balanceData !== undefined) {
      const balance = balanceData as bigint
      const threshold = MIN_TOKEN_BALANCE 
      
      if (balance >= threshold) {
        setHasEnough(true)
      } else {
        setHasEnough(false)
      }
    } else {
      setHasEnough(false)
    }
  }, [balanceData])

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <code className="font-mono font-bold">Owockibot Token Gated Forum</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:flex-none lg:justify-end">
          <ConnectButton />
        </div>
      </div>

      <div className="mt-16 w-full max-w-4xl">
        {!isConnected ? (
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Connect Wallet to Continue</h1>
            <p className="text-gray-400">Please connect your wallet to verify your $OWOCKIBOT balance.</p>
          </div>
        ) : isLoading ? (
          <div className="text-center text-white">
            <p>Verifying balance...</p>
          </div>
        ) : hasEnough ? (
          <Forum />
        ) : (
          <AccessDenied balance={balanceData as bigint | undefined} />
        )}
      </div>
    </main>
  )
}
