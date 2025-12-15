import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // 代码高亮样式（可选其他主题）

// 自定义 Markdown 样式
const markdownStyles = {
    base: {
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#333',
    },
    heading: {
        marginTop: '1.5em',
        marginBottom: '0.8em',
        fontWeight: '600',
    },
    paragraph: {
        marginBottom: '1em',
    },
    list: {
        marginLeft: '1.5em',
        marginBottom: '1em',
    },
    code: {
        padding: '0.2em 0.4em',
        borderRadius: '4px',
        fontSize: '0.9em',
    },
    pre: {
        padding: '1em',
        borderRadius: '8px',
        margin: '1em 0',
        overflowX: 'auto',
    },
    link: {
        color: '#1890ff', // 蚂蚁蓝，适配 Ant Design
        textDecoration: 'none',
        '&:hover': {
            textDecoration: 'underline',
        },
    },
};

const MarkdownRenderer = ({ content }) => {
    return (
        <ReactMarkdown
            rehypePlugins={[rehypeHighlight]} // 启用代码高亮
            components={{
                // 自定义标题样式
                h1: ({ children }) => (
                    <h1 style={{ ...markdownStyles.heading, fontSize: '1.6em' }}>{children}</h1>
                ),
                h2: ({ children }) => (
                    <h2 style={{ ...markdownStyles.heading, fontSize: '1.4em' }}>{children}</h2>
                ),
                h3: ({ children }) => (
                    <h3 style={{ ...markdownStyles.heading, fontSize: '1.2em' }}>{children}</h3>
                ),
                // 自定义段落
                p: ({ children }) => (
                    <p style={markdownStyles.paragraph}>{children}</p>
                ),
                // 自定义列表
                ul: ({ children }) => (
                    <ul style={markdownStyles.list}>{children}</ul>
                ),
                ol: ({ children }) => (
                    <ol style={markdownStyles.list}>{children}</ol>
                ),
                // 自定义代码块
                code: ({ children, inline }) => {
                    if (inline) {
                        return <code style={markdownStyles.code}>{children}</code>;
                    }
                    return <pre style={markdownStyles.pre}><code>{children}</code></pre>;
                },
                // 自定义链接
                a: ({ children, href }) => (
                    <a href={href} style={markdownStyles.link} target="_blank" rel="noopener noreferrer">
                        {children}
                    </a>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownRenderer;