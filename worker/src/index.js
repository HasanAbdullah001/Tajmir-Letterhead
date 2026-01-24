export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // GET /api/letters - List all letters
            if (url.pathname === '/api/letters' && request.method === 'GET') {
                const list = await env.LETTERS.list();
                const letters = await Promise.all(
                    list.keys.map(async (key) => {
                        const data = await env.LETTERS.get(key.name, 'json');
                        return {
                            id: key.name,
                            name: data?.letterName || 'Untitled',
                            createdAt: data?.createdAt || new Date().toISOString(),
                            updatedAt: data?.updatedAt || new Date().toISOString()
                        };
                    })
                );
                return new Response(JSON.stringify(letters), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // GET /api/letters/:id - Get specific letter
            if (url.pathname.startsWith('/api/letters/') && request.method === 'GET') {
                const id = url.pathname.split('/')[3];
                const letter = await env.LETTERS.get(id, 'json');
                if (!letter) {
                    return new Response(JSON.stringify({ error: 'Letter not found' }), {
                        status: 404,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }
                return new Response(JSON.stringify(letter), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // POST /api/letters - Save new letter
            if (url.pathname === '/api/letters' && request.method === 'POST') {
                const data = await request.json();
                const id = `letter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const letter = {
                    ...data,
                    letterId: id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                await env.LETTERS.put(id, JSON.stringify(letter));
                return new Response(JSON.stringify({ id, ...letter }), {
                    status: 201,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // PUT /api/letters/:id - Update letter
            if (url.pathname.startsWith('/api/letters/') && request.method === 'PUT') {
                const id = url.pathname.split('/')[3];
                const existing = await env.LETTERS.get(id, 'json');
                if (!existing) {
                    return new Response(JSON.stringify({ error: 'Letter not found' }), {
                        status: 404,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }
                const data = await request.json();
                const updated = {
                    ...existing,
                    ...data,
                    letterId: id,
                    createdAt: existing.createdAt,
                    updatedAt: new Date().toISOString()
                };
                await env.LETTERS.put(id, JSON.stringify(updated));
                return new Response(JSON.stringify(updated), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // DELETE /api/letters/:id - Delete letter
            if (url.pathname.startsWith('/api/letters/') && request.method === 'DELETE') {
                const id = url.pathname.split('/')[3];
                await env.LETTERS.delete(id);
                return new Response(JSON.stringify({ success: true }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            return new Response(JSON.stringify({ error: 'Not found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};
