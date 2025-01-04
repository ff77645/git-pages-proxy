import { Hono } from 'hono'

const app = new Hono()



app.get('/:user/:repo',async c=>{
	return getHome(c)
})

app.get('/:user/:repo/:docs',async c=>{
	const docs = c.req.param('docs')
	if(docs === 'docs') return getHome(c,true)
	else return getAssets(c)
})

app.get('/:repo/*',async c=>{
	return getAssets(c)
})

export default app

function getHome(c,isDocs){
	const user = c.req.param('user')
	const repo = c.req.param('repo')
	const targetUrl = `https://${user}.github.io/${repo}${isDocs?'/docs':''}`
	return handleProxy(targetUrl,c)
}

function getAssets(c) {
	const path = c.req.path
	const referer = c.req.header('referer')
	const url = new URL(referer)
	const user = url.pathname.split('/')[1]
	const targetUrl = `https://${user}.github.io${path}`
	return handleProxy(targetUrl,c)
}

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