import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Vercel serverless: cwd is read-only, /tmp is writable
const TMP_FILE = '/tmp/forum-posts.json'
const SEED_FILE = path.join(process.cwd(), 'data', 'posts.json')

async function readPosts() {
  try {
    // Try /tmp first (has latest posts)
    const data = await fs.readFile(TMP_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    try {
      // Fall back to seed data from build
      const data = await fs.readFile(SEED_FILE, 'utf-8')
      const posts = JSON.parse(data)
      // Copy seed to /tmp for future writes
      await fs.writeFile(TMP_FILE, JSON.stringify(posts, null, 2))
      return posts
    } catch {
      return []
    }
  }
}

async function writePosts(posts: any[]) {
  await fs.writeFile(TMP_FILE, JSON.stringify(posts, null, 2))
}

export async function POST(req: NextRequest) {
  try {
    const newPost = await req.json()

    if (!newPost.content || !newPost.authorAddress) {
      return NextResponse.json({ error: 'Content and author address are required' }, { status: 400 })
    }

    const posts = await readPosts()
    const postId = Date.now().toString()
    const timestamp = new Date().toISOString()

    const postWithMeta = {
      id: postId,
      content: newPost.content,
      authorAddress: newPost.authorAddress,
      timestamp: timestamp,
    }

    posts.unshift(postWithMeta)
    await writePosts(posts)

    return NextResponse.json(postWithMeta, { status: 201 })
  } catch (error) {
    console.error('Error posting message:', error)
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const posts = await readPosts()
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json([], { status: 200 })
  }
}
