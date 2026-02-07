/**
 * LLM Client — supports Anthropic and OpenAI APIs with streaming
 */

export interface LLMConfig {
    provider: 'anthropic' | 'openai';
    model: string;
    apiKey: string;
    maxTokens?: number;
    temperature?: number;
}

export interface StreamCallbacks {
    onToken: (token: string) => void;
    onDone: (fullText: string) => void;
    onError: (error: Error) => void;
}

/**
 * Call LLM with streaming response
 */
export async function streamLLM(
    config: LLMConfig,
    systemPrompt: string,
    userMessage: string,
    callbacks: StreamCallbacks
): Promise<string> {
    if (config.provider === 'anthropic') {
        return streamAnthropic(config, systemPrompt, userMessage, callbacks);
    } else {
        return streamOpenAI(config, systemPrompt, userMessage, callbacks);
    }
}

async function streamAnthropic(
    config: LLMConfig,
    systemPrompt: string,
    userMessage: string,
    callbacks: StreamCallbacks
): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: config.model,
            max_tokens: config.maxTokens || 8192,
            temperature: config.temperature ?? 0.3,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
            stream: true,
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Anthropic API error (${response.status}): ${body}`);
    }

    return processSSEStream(response, callbacks, 'anthropic');
}

async function streamOpenAI(
    config: LLMConfig,
    systemPrompt: string,
    userMessage: string,
    callbacks: StreamCallbacks
): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
            model: config.model,
            max_tokens: config.maxTokens || 8192,
            temperature: config.temperature ?? 0.3,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            stream: true,
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${body}`);
    }

    return processSSEStream(response, callbacks, 'openai');
}

async function processSSEStream(
    response: Response,
    callbacks: StreamCallbacks,
    provider: 'anthropic' | 'openai'
): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;

                try {
                    const parsed = JSON.parse(data);
                    let token = '';

                    if (provider === 'anthropic') {
                        if (parsed.type === 'content_block_delta') {
                            token = parsed.delta?.text || '';
                        }
                    } else {
                        token = parsed.choices?.[0]?.delta?.content || '';
                    }

                    if (token) {
                        fullText += token;
                        callbacks.onToken(token);
                    }
                } catch { /* skip unparseable lines */ }
            }
        }

        callbacks.onDone(fullText);
        return fullText;
    } catch (error) {
        callbacks.onError(error as Error);
        throw error;
    }
}

/**
 * Resolve API key from env vars
 */
export function resolveApiKey(provider: 'anthropic' | 'openai'): string | null {
    if (provider === 'anthropic') {
        return process.env.ANTHROPIC_API_KEY || null;
    }
    return process.env.OPENAI_API_KEY || null;
}

/**
 * Get default model for provider
 */
export function defaultModel(provider: 'anthropic' | 'openai'): string {
    if (provider === 'anthropic') return 'claude-sonnet-4-20250514';
    return 'gpt-4o';
}
