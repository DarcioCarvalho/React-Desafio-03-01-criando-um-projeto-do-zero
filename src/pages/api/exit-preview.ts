import url from 'url'

export default async function exit(req: any, res: any) {
  res.clearPreviewData()

  const queryObject = url.parse(req.url, true).query
  const redirectUrl = queryObject && queryObject.currentUrl ? queryObject.currentUrl : '/'

  res.writeHead(307, { location: redirectUrl })
  res.end()
}