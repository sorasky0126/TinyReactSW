export default {
    async fetch(request) {
        return new Response('Hello, World! -> ' + request.url, {
            status: 200,
            statusText: 'OK',
            headers: {
                'Content-Type': 'text/plain'
            }
        });
    }
}