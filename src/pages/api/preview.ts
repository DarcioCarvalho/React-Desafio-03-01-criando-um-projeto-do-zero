import { getPrismicClient } from '../../services/prismic';


export function linkResolver(doc: any): string {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`
  }
  return '/'
}

export default async (req: any, res: any) => {
  const { token: ref, documentId } = req.query

  const client = getPrismicClient()

  const redirectUrl = await client.resolvePreviewURL({
    linkResolver,
    defaultURL: '/',
    documentID: documentId,
    previewToken: ref
  })

  if (!redirectUrl) {
    return res.status(401).json({ message: 'Invalid Token' })
  }

  res.setPreviewData({ ref })


  res.write(
    `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${redirectUrl}" />
    <script>window.location.href = '${redirectUrl}'</script>
    </head>`
  )

  res.end()
}