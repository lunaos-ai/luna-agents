import type { CommandNode, FlowNode, FlowOperator, ParallelNode, PipeNode } from './types.js';

const OPERATORS = ['?>>', '!>>', '>>', '~~'] as const;

export function parsePipeline(source: string): PipeNode {
    const parser = new Parser(tokenize(source));
    const node = parser.parseFlow();
    if (!parser.done()) throw new SyntaxError(`Unexpected token "${parser.peek()}"`);
    return node;
}

export function tokenize(source: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let quote = '';
    const flush = () => {
        if (current) tokens.push(current);
        current = '';
    };
    for (let index = 0; index < source.length; index++) {
        const char = source[index];
        if (quote) {
            if (char === '\\' && index + 1 < source.length) {
                current += source[++index];
            } else if (char === quote) {
                quote = '';
            } else {
                current += char;
            }
            continue;
        }
        if (char === '"' || char === "'") {
            quote = char;
            continue;
        }
        if (/\s/.test(char)) {
            flush();
            continue;
        }
        const operator = OPERATORS.find(value => source.startsWith(value, index));
        if (operator) {
            flush();
            tokens.push(operator);
            index += operator.length - 1;
            continue;
        }
        if (char === '(' || char === ')') {
            flush();
            tokens.push(char);
            continue;
        }
        current += char;
    }
    if (quote) throw new SyntaxError('Unterminated quoted value');
    flush();
    if (tokens.length === 0) throw new SyntaxError('Pipeline is empty');
    return tokens;
}

class Parser {
    private position = 0;
    private commandIndex = 0;

    constructor(private readonly tokens: string[]) {}

    parseFlow(): PipeNode {
        const first = this.parseParallel();
        const links: FlowNode['links'] = [];
        while (isFlowOperator(this.peek())) {
            const operator = this.take() as FlowOperator;
            links.push({ operator, node: this.parseParallel() });
        }
        return links.length ? { type: 'flow', first, links } : first;
    }

    private parseParallel(): PipeNode {
        const nodes = [this.parsePrimary()];
        while (this.peek() === '~~') {
            this.take();
            nodes.push(this.parsePrimary());
        }
        return nodes.length > 1 ? { type: 'parallel', nodes } as ParallelNode : nodes[0];
    }

    private parsePrimary(): PipeNode {
        if (this.peek() === '(') {
            this.take();
            const node = this.parseFlow();
            if (this.take() !== ')') throw new SyntaxError('Expected ")"');
            return node;
        }
        const words: string[] = [];
        while (!this.done() && !isOperator(this.peek()) && this.peek() !== ')') {
            words.push(this.take());
        }
        if (!words.length) throw new SyntaxError(`Expected command before "${this.peek() || 'end'}"`);
        const command = words.shift()!;
        rejectUnsupported(command);
        this.commandIndex++;
        return {
            type: 'command',
            id: `step-${this.commandIndex}-${command.replace(/[^a-z0-9.-]/gi, '-')}`,
            command,
            args: words,
        } as CommandNode;
    }

    peek(): string { return this.tokens[this.position] || ''; }
    take(): string { return this.tokens[this.position++] || ''; }
    done(): boolean { return this.position >= this.tokens.length; }
}

function isOperator(value: string): boolean {
    return [...OPERATORS].includes(value as typeof OPERATORS[number]);
}

function isFlowOperator(value: string): value is FlowOperator {
    return value === '>>' || value === '?>>' || value === '!>>';
}

function rejectUnsupported(command: string): void {
    const unsupported = new Set([
        'if', 'else', 'match', 'try', 'catch', 'finally', 'with', 'in',
        'map', 'reduce', 'watch', 'on', 'timeout', 'retry', 'def', 'run', 'import',
    ]);
    if (unsupported.has(command) || command.startsWith('@') || command.startsWith('$')) {
        throw new SyntaxError(`"${command}" is not supported by the executable pipe runner yet`);
    }
}
