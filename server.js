delete process.env.ENABLE_AI;
delete process.env.API_KEY;
delete process.env.API_URL;
delete process.env.API_MODEL;
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const ENABLE_AI = process.env.ENABLE_AI === 'true';
const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;
const API_MODEL = process.env.API_MODEL;

if (ENABLE_AI) {
    if (!API_KEY || !API_URL || !API_MODEL) {
        console.error('❌ ENABLE_AI=true 但缺少 API_KEY / API_URL / API_MODEL');
        process.exit(1);
    }
    console.log('✅ AI 功能已启用，模型:', API_MODEL);
} else {
    console.log('ℹ️  AI 功能未启用，将使用内置模拟 HTML 页面');
}

// ---------- 搜索接口 ----------
app.post('/api/search', async (req, res) => {
    const { query } = req.body;
    if (!query || !query.trim()) return res.status(400).json({ error: '搜索词为空' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
        let results;
        if (ENABLE_AI) {
            const messages = [
                { role: 'system', content: '返回一个 JSON 数组，每个元素包含 icon(emoji), title(标题), description(简介，不少于20字的详细描述)。生成 4 条结果。只返回 JSON。' },
                { role: 'user', content: query.trim() }
            ];
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
                body: JSON.stringify({ model: API_MODEL, messages, temperature: 0.7, max_tokens: 1000 }),
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (!response.ok) throw new Error(`API 错误: ${response.status}`);
            const data = await response.json();
            let text = data.choices[0].message.content.trim();
            if (text.startsWith('```')) text = text.replace(/```json?|```/g, '').trim();
            results = JSON.parse(text);
        } else {
            await new Promise(r => setTimeout(r, 800));
            results = getMockSearchResults(query.trim());
        }
        res.json({ results });
    } catch (err) {
        clearTimeout(timeout);
        console.error('搜索失败:', err.message);
        res.json({ results: getMockSearchResults(query.trim()) });
    }
});

function getMockSearchResults(query) {
    const lower = query.toLowerCase();
    if (lower.includes('计算器')) return [
        { icon: '🧮', title: '计算器', description: '一个可交互的标准计算器' },
        { icon: '📐', title: '科学计算器', description: '支持三角函数和幂运算' }
    ];
    if (lower.includes('天气')) return [
        { icon: '☀️', title: '天气面板', description: '实时天气信息展示' }
    ];
    return [
        { icon: '🌐', title: `${query} 页面`, description: 'AI 生成的交互 HTML 页面' },
        { icon: '📄', title: `${query} 百科`, description: '详细百科介绍' },
        { icon: '📰', title: `${query} 动态`, description: '最新相关新闻' }
    ];
}

// ---------- 流式生成 HTML 接口（增强完整性） ----------
app.post('/api/generate-html-stream', async (req, res) => {
    const { instruction, history } = req.body;
    if (!instruction) return res.status(400).json({ error: '缺少指令' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

    try {
        if (ENABLE_AI) {
            const messages = [
                {
                    role: 'system',
                    content: `你是一个交互式 HTML 页面生成器。生成完整、可运行的 HTML 页面（含 CSS 和 JS）。所有按钮必须有真实 onclick 功能。必须生成完整的 HTML 文档，以 </html> 结束。不要任何解释，直接返回 HTML 代码。如果可以，尽量不要手动换行代码。`
                },
                ...(history || []),
                { role: 'user', content: instruction }
            ];

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
                body: JSON.stringify({ model: API_MODEL, messages, stream: true, temperature: 0.7, max_tokens: 4000 })
            });

            if (!response.ok) throw new Error(`AI API 错误: ${response.status}`);

            const stream = response.body;
            let buffer = '';
            let fullCode = '';

            stream.on('data', chunk => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            const finalCode = extractHtmlCode(fullCode) || fullCode;
                            // 如果代码不完整，尝试补全
                            send({ done: true, fullCode: finalCode, isComplete: finalCode.includes('</html>') });
                            res.end();
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                fullCode += content;
                                const partial = extractHtmlCode(fullCode) || fullCode;
                                send({ chunk: partial });
                            }
                        } catch (e) { /* 忽略非 JSON 行 */ }
                    }
                }
            });

            stream.on('end', () => {
                const finalCode = extractHtmlCode(fullCode) || fullCode;
                send({ done: true, fullCode: finalCode, isComplete: finalCode.includes('</html>') });
                res.end();
            });

            stream.on('error', (err) => {
                console.error('流错误:', err);
                send({ error: 'AI 流中断' });
                res.end();
            });

        } else {
            // 模拟流式发送
            const mockCode = getMockHtmlCode(instruction);
            let index = 0;
            const chunkSize = 20;
            const interval = setInterval(() => {
                if (index < mockCode.length) {
                    const partial = mockCode.slice(0, index + chunkSize);
                    send({ chunk: partial });
                    index += chunkSize;
                } else {
                    clearInterval(interval);
                    send({ done: true, fullCode: mockCode, isComplete: true });
                    res.end();
                }
            }, 50);
        }
    } catch (error) {
        console.error('流式生成失败:', error.message);
        send({ error: '生成失败' });
        res.end();
    }
});

function extractHtmlCode(raw) {
    const codeBlockMatch = raw.match(/```html?\s*([\s\S]*?)```/i);
    if (codeBlockMatch && codeBlockMatch[1]) return codeBlockMatch[1].trim();
    const htmlStart = raw.search(/<(!DOCTYPE html|html)/i);
    if (htmlStart !== -1) return raw.substring(htmlStart).trim();
    if (raw.includes('<html') || raw.includes('<body') || raw.includes('<head')) return raw.trim();
    return null;
}

function getMockHtmlCode(instruction) {
    if (instruction.toLowerCase().includes('计算器')) {
        return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { font-family: Tahoma; display: flex; justify-content: center; align-items: center; height: 100vh; margin:0; background: #f0f0f0; }
.calc { background: #ddd; padding: 15px; border-radius: 8px; }
input { width: 100%; padding: 10px; margin-bottom: 10px; text-align: right; font-size: 18px; }
button { width: 22%; padding: 12px; margin: 3px; font-size: 16px; cursor: pointer; }
</style></head>
<body><div class="calc"><input type="text" id="display" readonly><br>
<button onclick="calc('7')">7</button><button onclick="calc('8')">8</button><button onclick="calc('9')">9</button><button onclick="calc('/')">/</button><br>
<button onclick="calc('4')">4</button><button onclick="calc('5')">5</button><button onclick="calc('6')">6</button><button onclick="calc('*')">*</button><br>
<button onclick="calc('1')">1</button><button onclick="calc('2')">2</button><button onclick="calc('3')">3</button><button onclick="calc('-')">-</button><br>
<button onclick="calc('0')">0</button><button onclick="calc('.')">.</button><button onclick="calc('=')">=</button><button onclick="calc('+')">+</button>
<script>let d=document.getElementById('display'); function calc(v){if(v==='='){try{d.value=eval(d.value)}catch{d.value='Error'}}else{d.value+=v}}</script></div></body>
</html>`;
    }
    return `<!DOCTYPE html><html><head><style>body{font-family:Tahoma;padding:20px;}</style></head><body><h2>${instruction}</h2><p>这是一个模拟的交互页面。</p><button onclick="alert('你好！')">点我</button></body></html>`;
}

// 前端路由回退
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🖥️  Windows XP AI HTML Generator (流式) 运行在 http://localhost:${PORT}`);
});
