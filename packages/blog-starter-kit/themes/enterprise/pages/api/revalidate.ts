import type { NextApiRequest, NextApiResponse } from 'next'
import { validateSignature } from '../../utils/signing'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check for secret to confirm this is a valid request
    const validateRequest = validateSignature({incomingSignatureHeader: req.headers['x-hashnode-signature'], payload: req.body, secret: process.env?.HN_WEBHOOK_SECRET as string || null})
    const { data } = req.body
    if (!validateRequest.isValid) return res.status(401).json({ message: 'Invalid token' })
    if (!data) return res.status(400).json({ message: 'No data provided' })
    console.log('payload data', data)
    // if (username && path) await res.revalidate(`/${username}/${path}`)
    // else await res.revalidate(`/${username}`)
    return res.json({ revalidated: true })
  } catch (err) {
    // If there was an error, Next.js will continue to show the last successfully generated page
    // Bug, when the hyperpage path is updated to a new path. Revalidate errors out and thusly the last successfully
    // generated page remains. Should take another query which sets this page's cache control or w/e to 0 to remove it from cache?
    console.warn('err', err)
    return res.status(500).json({ error: 'Error revalidating', revalidated: false })
  }
}

// process.env.HN_API_SECRET
// const getPostSlug = (id: string) => `query Post($id: ID!) {
//   post(id: ${id}) {
//     id
//     slug
//   }
// }`

