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

// 验证 AI 配置
if (ENABLE_AI) {
    if (!API_KEY || !API_URL || !API_MODEL) {
        console.error('❌ ENABLE_AI=true 但缺少 API_KEY / API_URL / API_MODEL，请检查 .env 文件');
        process.exit(1);
    }
    console.log('✅ AI 功能已启用，模型:', API_MODEL);
} else {
    console.log('ℹ️  AI 功能未启用，将使用内置模拟数据');
}

// 调用真实 AI（OpenAI 兼容接口）
async function callRealAI(messages, temperature = 0.7, maxTokens = 2000) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: API_MODEL,
            messages,
            temperature,
            max_tokens: maxTokens
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`AI API 请求失败: ${response.status} - ${err}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// ---------- 模拟数据（与前端逻辑相同，但移到了后端） ----------
function getMockSearchResults(query) {
    const lower = query.toLowerCase();
    const commonResults = [
        { icon: '🔍', title: `关于 "${query}" 的搜索结果`, description: '这是一条由模拟引擎生成的搜索结果。开启 AI 后可获得更精准的答案。' },
        { icon: '📄', title: `${query} — 综合百科`, description: `关于 "${query}" 的详细百科条目，涵盖背景、关键数据和最新动态。` },
        { icon: '📰', title: `${query} — 相关新闻`, description: `与 "${query}" 相关的最新资讯和趋势分析。` },
        { icon: '💡', title: `${query} — 深度解读`, description: `多位专家对 "${query}" 的深入分析和观点汇总。` }
    ];

    if (lower.includes('apple')) {
        return [
            { icon: '🏢', title: 'Apple Inc. — 官方网站', description: '探索 iPhone、iPad、Mac 等创新产品与服务。' },
            { icon: '📚', title: 'Apple Inc. — 维基百科', description: '苹果公司是一家美国跨国科技公司，总部位于加州库比蒂诺。' },
            { icon: '📰', title: 'Apple 最新动态', description: '关于苹果产品发布、软件更新及行业分析的权威报道。' },
            { icon: '💰', title: 'Apple 股票 (AAPL)', description: '实时股价、市值和财务分析，助你掌握投资动向。' }
        ];
    }
    return commonResults;
}

function getMockContent(title, query) {
    return `# ${title}

## 概述
这是关于 **"${title}"** 的详细内容页面（模拟数据）。  
您搜索的关键词为：*${query}*。  
当前 **AI 功能未启用**，此处展示的是预置示例内容。

## 背景
该主题涵盖了多个维度的信息。在真实 AI 模式下，这里将显示由大语言模型生成的丰富、准确的内容。

### 关键点
- 数据来源：综合多个权威渠道
- 相关性：与您的搜索高度匹配
- 生成时间：${new Date().toLocaleString('zh-CN')}

## 如何启用真实 AI？
1. 在项目根目录的 \`.env\` 文件中设置 \`ENABLE_AI=true\`
2. 填写 \`API_KEY\`、\`API_URL\`、\`API_MODEL\`
3. 重启服务即可体验 AI 驱动的搜索与内容生成

---

*Windows XP 风格界面 · Internet Explorer 模拟*`;
}

// ---------- API 路由 ----------

// 搜索接口
app.post('/api/search', async (req, res) => {
    const { query } = req.body;
    if (!query || !query.trim()) {
        return res.status(400).json({ error: '搜索词不能为空' });
    }

    try {
        let results;
        if (ENABLE_AI) {
            const systemPrompt = `你是一个 AI 搜索引擎。根据用户搜索词返回 JSON 数组，每个元素包含 icon(单个emoji), title(标题), description(简介)。只返回 JSON 数组，不要其他文字。`;
            const response = await callRealAI([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `搜索词: "${query.trim()}"` }
            ], 0.7, 1500);
            // 清理可能的 markdown 代码块标记
            let cleaned = response.trim();
            if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            }
            results = JSON.parse(cleaned);
        } else {
            // 模拟延迟，让转圈动画更自然
            await new Promise(r => setTimeout(r, 800));
            results = getMockSearchResults(query.trim());
        }
        res.json({ results });
    } catch (error) {
        console.error('搜索失败:', error.message);
        // 如果 AI 出错，回退到模拟数据
        if (ENABLE_AI) {
            console.warn('⚠️  AI 调用失败，使用模拟数据替代');
            const results = getMockSearchResults(query.trim());
            return res.json({ results, fallback: true });
        }
        res.status(500).json({ error: '搜索服务暂时不可用' });
    }
});

// 内容生成接口（流式传输）
app.post('/api/content', async (req, res) => {
    const { title, query } = req.body;
    if (!title) {
        return res.status(400).json({ error: '缺少标题' });
    }

    // 设置 SSE 头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const generateMockContent = (t, q) => {
        const mock = getMockContent(t, q || '');
        let index = 0;
        const chunkSize = 10;
        const interval = setInterval(() => {
            if (index < mock.length) {
                send({ content: mock.slice(index, index + chunkSize) });
                index += chunkSize;
            } else {
                clearInterval(interval);
                send({ done: true });
                res.end();
            }
        }, 20);
    };

    try {
        if (ENABLE_AI) {
            // 调用 AI，开启 stream
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: API_MODEL,
                    messages: [
                        { role: 'system', content: '你是一个知识助手。根据用户点击的搜索结果生成详细、结构化的 Markdown 内容，包含标题、小节、列表等。你可以使用以下元素让页面更丰富：\n- 超链接：[链接文本](https://example.com)\n- 图片：![描述](https://image.url)（使用真实可访问的图片链接）\n- 按钮：使用 HTML <button onclick="alert(\'你好\')">点击我</button> 标签\n- 折叠面板：<details><summary>点击展开</summary>详细内容</details>\n- 其他 HTML 元素如 <kbd>快捷键</kbd>、<mark>高亮</mark> 等。\n注意：确保 Markdown 和 HTML 混合输出有效，不要添加额外的代码块标记。只返回 Markdown 内容。' },
                        { role: 'user', content: `原始搜索: "${query || title}"，点击的结果标题: "${title}"。请生成详细内容。` }
                    ],
                    stream: true,
                    temperature: 0.8,
                    max_tokens: 2500
                })
            });

            if (!response.ok) {
                throw new Error(`AI API 请求失败: ${response.status}`);
            }

            const stream = response.body;
            let buffer = '';

            stream.on('data', chunk => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // 保留未完成行

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            send({ done: true });
                            res.end();
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                send({ content });  // 发送每个 token
                            }
                        } catch (e) { /* 忽略非 JSON 行 */ }
                    }
                }
            });

            stream.on('end', () => {
                send({ done: true });
                res.end();
            });

            stream.on('error', (err) => {
                console.error('流读取错误:', err);
                send({ error: '流中断' });
                res.end();
            });
        } else {
            // 模拟模式：逐段发送内容（打字机效果）
            const mockContent = getMockContent(title, query || '');
            let index = 0;
            const chunkSize = 5; // 每次发送 5 个字符
            const interval = setInterval(() => {
                if (index < mockContent.length) {
                    const chunk = mockContent.slice(index, index + chunkSize);
                    send({ content: chunk });
                    index += chunkSize;
                } else {
                    clearInterval(interval);
                    send({ done: true });
                    res.end();
                }
            }, 30);
        }
    } catch (error) {
        console.error('内容生成失败:', error.message);
        if (ENABLE_AI) {
            // AI 出错时发送错误事件，前端会回退到模拟数据
            send({ error: 'AI 调用失败，将使用模拟数据', fallback: true });
            generateMockContent(title, query || '');
        } else {
            send({ error: '内容生成失败' });
            res.end();
        }
    }
});

// 所有其他请求返回前端页面
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🖥️  Windows XP AI Desktop 运行在 http://localhost:${PORT}`);
});
