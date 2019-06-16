/**
 * Run as a service worker at CDN PoP(s) as:
 * https://go.indent.com
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const pkgs = ['apis', 'tools']

async function handleRequest(request) {
  let url = new URL(request.url)
  let { name, subpath } = getParts(url.pathname)

  if (!name || !pkgs.includes(name)) {
    return index()
  }

  return html(goRedirect(request, { name, subpath }))
}

function index() {
  return html(`
<!DOCTYPE html>
<html>
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.min.css" />
</head>
<body>
<div class="container">
  <div class="row">
    <table class="u-full-width">
      <thead>
        <tr>
          <th>Package</th>
          <th>Source</th>
          <th>Godoc</th>
        </tr>
      </thead>
      <tbody>
        ${pkgs.map(renderPkg).join('\n')}
      </tbody>
    </table>
  </div>
</div>
</body>
</html>
`)
}

const renderPkg = pkg =>
  `
<tr>
  <td>go.indent.com/${pkg}</td>
  <td>
    <a href="https://github.com/indent-go/${pkg}">github.com/indent-go/${pkg}</a>
  </td>
  <td>
    <a href="https://godoc.org/go.indent.com/${pkg}">
      <img src="https://godoc.org/go.indent.com/${pkg}?status.svg" alt="GoDoc" />
    </a>
  </td>
</tr>`.trim()

function goRedirect(req, { name, subpath }) {
  let importRef = `go.indent.com/${name}`
  let repo = `https://github.com/indent-go/${name}`
  let display = `https://github.com/indent-go/${name}`
  let vcs = 'git'

  return `
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="go-import" content="${importRef} ${vcs} ${repo}">
<meta name="go-source" content="${importRef} ${display}">
<meta http-equiv="refresh" content="0; url=https://godoc.org/${importRef}/${subpath}">
</head>
<body>
Nothing to see here; <a href="https://godoc.org/${importRef}/${subpath}">see the package on godoc</a>.
</body>
</html>`
}

// Utilities
function html(text) {
  return new Response(text, {
    headers: { 'content-type': 'text/html' }
  })
}

function getParts(path = '/') {
  let [name, ...parts] = path.split('/').filter(Boolean)

  return { name, subpath: parts.join('/') }
}
