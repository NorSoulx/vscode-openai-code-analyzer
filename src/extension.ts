import * as vscode from 'vscode';
import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
	console.error('The OPENAI_API_KEY environment variable is not set. Please set it to use this extension.');
}

const config = vscode.workspace.getConfiguration('openaiCodeAnalyzer');
const maxTokens = config.get<number>('maxTokens') || 100;


function createSummaryWebView(context: vscode.ExtensionContext) {
	let history = '';

	const panel = vscode.window.createWebviewPanel(
		'openaiSummary',
		'Code Summary',
		vscode.ViewColumn.Two,
		{
			enableScripts: true,
			retainContextWhenHidden: true,
		}
	);

	const updateWebViewContent = (text: string, summary: string, maxTokens: number, tokensUsed: number, promptTokens: number, completionTokens: number, languageId: string) => {
		history += `
		  <div class="item">
		  	<pre><code class="language-${languageId}">${text}</code></pre>
		  	<div class="summary">${summary}</div>
		  </div>
		`;

		panel.webview.html = `
		  <!DOCTYPE html>
		  <html lang="en">
		  <head>
			  <meta charset="UTF-8">
			  <meta name="viewport" content="width=device-width, initial-scale=1.0">
			  <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.27.0/themes/prism.min.css" rel="stylesheet" />
			  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.27.0/components/prism-core.min.js"></script>
			  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.27.0/components/prism-${languageId}.min.js"></script>
			  </head>
			  <style>
				  body { padding: 10px; }
				  .item { display: flex; flex-direction: column; margin-bottom: 20px; }
				  .code { font-family: monospace; white-space: pre-wrap; background-color: #f5f5f5; padding: 10px; border-radius: 5px; }
				  .summary { margin-top: 5px; }
			  </style>
		  </head>
		  <body>
		  <div class="info">
		  Max tokens: ${maxTokens}. To change the max tokens, go to Settings and update the "openaiCodeAnalyzer.maxTokens" option.
		  <br>
		  Tokens used: ${tokensUsed} (Prompt tokens: ${promptTokens}, Completion tokens: ${completionTokens})
		</div>
			</div>
			  ${history}
			  <script>
				document.addEventListener('DOMContentLoaded', (event) => {
				  Prism.highlightAll();
				});
			  </script>
			    <div class="item">
        <pre><code class="language-${languageId}">${text}</code></pre>
        <div class="summary">${summary}</div>
      </div>
		  </body>
		  </html>
		`;
	};

	return updateWebViewContent;
}


async function summarizeText(text: string): Promise<{ summary: string; tokensUsed: number; promptTokens: number; completionTokens: number }> {
	if (!OPENAI_API_KEY) {
		throw new Error('The OPENAI_API_KEY environment variable is not set.');
	}

	const response = await axios.post(
		'https://api.openai.com/v1/completions',
		{
			model: "text-davinci-002",
			prompt: `Please analyze and provide a detailed summary, flow and what programming language being is used, of the following code snippet:\n${text}\nSummary:`,
			max_tokens: maxTokens,
			n: 1,
			stop: null,
			temperature: 0.5,
		},
		{
			headers: {
				'Authorization': `Bearer ${OPENAI_API_KEY}`,
				'Content-Type': 'application/json',
			}
		}
	);

	const summary = response.data.choices[0].text.trim();
	const tokensUsed = response.data.usage.total_tokens;
	const promptTokens = response.data.usage.prompt_tokens;
	const completionTokens = response.data.usage.completion_tokens;


	return { summary, tokensUsed, promptTokens, completionTokens };
}

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.summarizeCode', async () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showErrorMessage('Please open a file to use this extension.');
			return;
		}

		const selectedText = editor.document.getText(editor.selection);

		if (!selectedText) {
			vscode.window.showErrorMessage('Please select some text to summarize.');
			return;
		}
		const languageId = editor.document.languageId;
		try {
			const { summary, tokensUsed, promptTokens, completionTokens } = await summarizeText(selectedText);
			const updateWebViewContent = createSummaryWebView(context);
			updateWebViewContent(selectedText, summary, maxTokens, tokensUsed, promptTokens, completionTokens, languageId);

		} catch (error) {
			console.error('Error:', error);

			if (error instanceof Error) {
				vscode.window.showErrorMessage(`An error occurred while summarizing the text: ${error.message}`);
			} else {
				vscode.window.showErrorMessage('An error occurred while summarizing the text. Please try again.');
			}
		}

	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
