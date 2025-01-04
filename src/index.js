import { Hono } from 'hono'

const app = new Hono()



app.get('/:user/:repo',async c=>{
	const user = c.req.param('user')
	const repo = c.req.param('repo')
	const targetUrl = `https://${user}.github.io/${repo}`
	return handleProxy(targetUrl,c)
})


app.get('/:repo/*',async c=>{
	const path = c.req.path
	const referer = c.req.header('referer')
	const url = new URL(referer)
	const user = url.pathname.split('/')[1]
	const targetUrl = `https://${user}.github.io${path}`
	return handleProxy(targetUrl,c)
})

export default app


async function handleProxy(url,c){
	const init = {
		method:c.req.method,
		headers:c.req.raw.headers,
		body:c.req.raw.body
	}
	try{
		const res = await fetch(url,init)
		return new Response(res.body,{
			status:res.status,
			headers:res.headers
		})
	}catch(err){
		return c.text('Proxy error: ' + err.message, 500)
	}
}